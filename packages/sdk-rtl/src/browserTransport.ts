/*

 MIT License

 Copyright (c) 2021 Looker Data Sciences, Inc.

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.

 */

import type {
  Authenticator,
  HttpMethod,
  IRawRequest,
  IRawResponse,
  ISDKError,
  ITransportSettings,
  SDKResponse,
  Values,
} from './transport';
import {
  ResponseMode,
  canRetry,
  initResponse,
  isErrorLike,
  pauseForRetry,
  responseMode,
  retryError,
  retryWait,
  safeBase64,
  mergeOptions,
} from './transport';
import { BaseTransport } from './baseTransport';
import type { ICryptoHash } from './cryptoHash';

export class BrowserCryptoHash implements ICryptoHash {
  arrayToHex(array: Uint8Array): string {
    return Array.from(array)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  fromBase64(str: string) {
    return atob(str)
      .split('')
      .map(function (c) {
        return c.charCodeAt(0);
      });
  }

  secureRandom(byteCount: number): string {
    const bytes = new Uint8Array(byteCount);
    window.crypto.getRandomValues(bytes);
    return this.arrayToHex(bytes);
  }

  async sha256Hash(message: string): Promise<string> {
    const msgUint8 = new TextEncoder().encode(message);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
    return safeBase64(new Uint8Array(hashBuffer));
  }
}

export class BrowserTransport extends BaseTransport {
  constructor(protected readonly options: ITransportSettings) {
    super(options);
  }

  /** Does this browser have the necessary performance APIs? */
  static supportsPerformance() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return !!(performance && performance.mark && performance.measure);
  }

  private static _trackPerf = false;

  public static get trackPerformance() {
    return this._trackPerf;
  }

  public static set trackPerformance(value: boolean) {
    this._trackPerf = value && BrowserTransport.supportsPerformance();
  }

  static startMark = 'A';
  static endMark = 'B';

  /**
   * Create a performance mark
   * @param name to use as prefix of mark. Use `markName()` to determine the name
   * @param tag tag to use to distinguish mark
   * @returns the name of the mark used, or '' if not marked
   */
  static mark(name: string, tag: string) {
    if (this.trackPerformance) {
      const mark = `${name}-${tag}`;
      performance.mark(mark);
      return mark;
    }
    return '';
  }

  /**
   * Create a unique name for the performance metric of the url based on its start time
   * @param url metric to find
   *
   * Uses the last entry of the matching metric to create the name for the tracker so
   * post processing can use it to merge into the main resource tracker
   *
   */
  static markName(url: string) {
    if (!this.trackPerformance) return '';

    const entries = performance.getEntriesByName(url, 'resource');
    if (entries.length > 0) {
      const last = entries[entries.length - 1];
      return `${url}-${last.startTime}`;
    }
    return url;
  }

  /**
   * Mark the start of a performance measure
   * @param name to use as prefix of mark. Use `markName()` to determine the name
   */
  static markStart(name: string) {
    return BrowserTransport.mark(name, BrowserTransport.startMark);
  }

  /**
   * Mark the end of a performance measure
   * @param url to find starting mark which doesn't have a resource entry yet
   * @param startName name of the start mark
   *
   * Creates the start/end performance measure
   *
   * @returns the name of the performance measure
   */
  static markEnd(url: string, startName: string) {
    if (this.trackPerformance) {
      // Find the resource entry and use it to create the measure name
      const measureName = this.markName(url);
      const end = BrowserTransport.mark(measureName, BrowserTransport.endMark);
      performance.measure(measureName, startName, end);
      // Marks have been processed into a measure, so remove them
      performance.clearMarks(startName);
      performance.clearMarks(end);
      return measureName;
    }
    return '';
  }

  /**
   * Standard retry where requests will be retried based on configured
   * transport settings. If retry is not enabled, no requests will be retried
   *
   * This default retry pattern implements the "full" jitter algorithm
   * documented in https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/
   *
   * @param request options for HTTP request
   */
  async retry(request: IRawRequest): Promise<IRawResponse> {
    const { method, path, queryParams, body, authenticator } = request;
    const newOpts = mergeOptions(this.options, request.options ?? {});
    const requestPath = this.makeUrl(path, newOpts, queryParams);
    const props = await this.initRequest(
      method,
      requestPath,
      body,
      authenticator,
      newOpts
    );
    const waiter = newOpts.waitHandler || retryWait;
    let response = initResponse(method, requestPath);
    // TODO assign to MaxTries when retry is opt-out instead of opt-in
    const maxRetries = newOpts?.maxTries ?? 1; // MaxTries
    let attempt = 1;
    while (attempt <= maxRetries) {
      const req = fetch(props.url, props as RequestInit);

      const requestStarted = Date.now();
      const res = await req;
      const responseCompleted = Date.now();

      // Start tracking the time it takes to convert the response
      const started = BrowserTransport.markStart(
        BrowserTransport.markName(requestPath)
      );
      const contentType = String(res.headers.get('content-type'));
      const mode = responseMode(contentType);
      const responseBody =
        mode === ResponseMode.binary ? await res.blob() : await res.text();
      if (!('fromRequest' in newOpts)) {
        // Request will markEnd, so don't mark the end here
        BrowserTransport.markEnd(requestPath, started);
      }
      const headers: { [key: string]: any } = {};
      res.headers.forEach((value, key) => (headers[key] = value));
      response = {
        method,
        url: requestPath,
        body: responseBody,
        contentType,
        statusCode: res.status,
        statusMessage: res.statusText,
        startMark: started,
        headers,
        requestStarted,
        responseCompleted,
        ok: true,
      };
      response.ok = this.ok(response);
      if (canRetry(response.statusCode) && attempt < maxRetries) {
        const result = await pauseForRetry(request, response, attempt, waiter);
        if (result.response === 'cancel') {
          if (result.reason) {
            response.statusMessage = result.reason;
          }
          break;
        } else if (result.response === 'error') {
          if (result.reason) {
            response.statusMessage = result.reason;
          }
          return retryError(response);
        }
      } else {
        break;
      }
      attempt++;
    }
    return response;
  }

  async rawRequest(
    method: HttpMethod,
    path: string,
    queryParams?: Values,
    body?: any,
    authenticator?: Authenticator,
    options?: Partial<ITransportSettings>
  ): Promise<IRawResponse> {
    const response = await this.retry({
      method,
      path,
      queryParams,
      body,
      authenticator,
      options,
    });
    return this.observer ? this.observer(response) : response;
  }

  /**
   * Process the response based on content type
   * @param res response to process
   */
  async parseResponse<TSuccess, TError>(
    res: IRawResponse
  ): Promise<SDKResponse<TSuccess, TError>> {
    const perfMark = res.startMark || '';
    if (!res.ok) {
      // Raw request had an error. Make sure it's a string before parsing the result
      let error = res.body;
      if (typeof error === 'string') {
        try {
          error = JSON.parse(error);
        } catch {
          error = { message: `Request failed: ${error}` };
        }
      }
      const response: SDKResponse<TSuccess, TError> = { ok: false, error };
      return response;
    }

    let value;
    let error;
    if (res.contentType.match(/application\/json/g)) {
      try {
        value = JSON.parse(await res.body);
        BrowserTransport.markEnd(res.url, perfMark);
      } catch (err) {
        error = err;
        BrowserTransport.markEnd(res.url, perfMark);
      }
    } else if (
      res.contentType === 'text' ||
      res.contentType.startsWith('text/')
    ) {
      value = res.body.toString();
      BrowserTransport.markEnd(res.url, perfMark);
    } else {
      try {
        BrowserTransport.markEnd(res.url, perfMark);
        value = res.body;
      } catch (err) {
        BrowserTransport.markEnd(res.url, perfMark);
        error = err;
      }
    }
    let result: SDKResponse<TSuccess, TError>;
    if (error) {
      result = { ok: false, error: error as TError };
    } else {
      result = { ok: true, value };
    }
    return result;
  }

  async request<TSuccess, TError>(
    method: HttpMethod,
    path: string,
    queryParams?: Values,
    body?: any,
    authenticator?: Authenticator,
    options?: Partial<ITransportSettings>
  ): Promise<SDKResponse<TSuccess, TError>> {
    try {
      if (BrowserTransport.trackPerformance) {
        options = { ...options, fromRequest: true } as any;
      }
      const res = await this.rawRequest(
        method,
        path,
        queryParams,
        body,
        authenticator,
        options
      );
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      const result: SDKResponse<TSuccess, TError> = await this.parseResponse(
        res
      );
      return result;
    } catch (e: unknown) {
      if (!isErrorLike(e)) throw e;
      const error: ISDKError = {
        message:
          typeof e.message === 'string'
            ? e.message
            : `The SDK call was not successful. The error was '${e}'.`,
        type: 'sdk_error',
      };
      return { error, ok: false };
    }
  }

  async stream<TSuccess>(
    callback: (response: Response) => Promise<TSuccess>,
    method: HttpMethod,
    path: string,
    queryParams?: Values,
    body?: any,
    authenticator?: Authenticator,
    options?: Partial<ITransportSettings>
  ): Promise<TSuccess> {
    // TODO push this method down to base transport
    const newOpts = { ...this.options, options };
    const requestPath = this.makeUrl(path, newOpts, queryParams);
    // TODO add signal: AbortSignal support
    const init = await this.initRequest(
      method,
      requestPath,
      body,
      authenticator,
      newOpts
    );

    const response = await fetch(requestPath, init as RequestInit);
    return await callback(response);
  }
}
