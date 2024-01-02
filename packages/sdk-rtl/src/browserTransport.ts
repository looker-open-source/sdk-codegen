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

import type { Readable } from 'readable-stream';
import type {
  Authenticator,
  HttpMethod,
  IRawResponse,
  IRequestHeaders,
  IRequestProps,
  ISDKError,
  ITransportSettings,
  SDKResponse,
  Values,
} from './transport';
import {
  LookerAppId,
  ResponseMode,
  agentPrefix,
  isErrorLike,
  responseMode,
  safeBase64,
  trace,
} from './transport';
import { BaseTransport } from './baseTransport';
import type { ICryptoHash } from './cryptoHash';

export class BrowserCryptoHash implements ICryptoHash {
  arrayToHex(array: Uint8Array): string {
    return Array.from(array)
      .map((b) => b.toString(16).padStart(2, '0'))
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

  async rawRequest(
    method: HttpMethod,
    path: string,
    queryParams?: Values,
    body?: any,
    authenticator?: Authenticator,
    options?: Partial<ITransportSettings>
  ): Promise<IRawResponse> {
    options = { ...this.options, ...options };
    const requestPath = this.makeUrl(path, options, queryParams);
    const props = await this.initRequest(
      method,
      requestPath,
      body,
      authenticator,
      options
    );
    const req = fetch(
      props.url,
      props // Weird package issues with unresolved imports for RequestInit :(
    );

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
    if (!('fromRequest' in options)) {
      // Request will markEnd, so don't mark the end here
      BrowserTransport.markEnd(requestPath, started);
    }
    const headers: { [key: string]: any } = {};
    res.headers.forEach((value, key) => (headers[key] = value));
    const response: IRawResponse = {
      method,
      url: requestPath,
      body: responseBody,
      contentType,
      ok: true,
      statusCode: res.status,
      statusMessage: res.statusText,
      startMark: started,
      headers,
      requestStarted,
      responseCompleted,
    };
    // Update OK with response statusCode check
    response.ok = this.ok(response);
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
        options = { ...options, ...{ fromRequest: true } };
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
      const result: SDKResponse<TSuccess, TError> =
        await this.parseResponse(res);
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

  private async initRequest(
    method: HttpMethod,
    path: string,
    body?: any,
    authenticator?: Authenticator,
    options?: Partial<ITransportSettings>
  ) {
    const agentTag = options?.agentTag || agentPrefix;
    options = options ? { ...this.options, ...options } : this.options;
    const headers: IRequestHeaders = { [LookerAppId]: agentTag };
    if (options && options.headers) {
      Object.entries(options.headers).forEach(([key, val]) => {
        headers[key] = val;
      });
    }

    // Make sure an empty body is undefined
    if (!body) {
      body = undefined;
    } else {
      if (typeof body !== 'string') {
        body = JSON.stringify(body);
        headers['Content-Type'] = 'application/json';
      }
    }
    let props: IRequestProps = {
      body,
      credentials: 'same-origin',
      headers,
      method,
      url: path,
    };

    if (authenticator) {
      // Add authentication information to the request
      props = await authenticator(props);
    }

    return props;
  }

  // TODO finish this method
  async stream<TSuccess>(
    _callback: (readable: Readable) => Promise<TSuccess>,
    method: HttpMethod,
    path: string,
    queryParams?: any,
    body?: any,
    authenticator?: Authenticator,
    options?: Partial<ITransportSettings>
  ): Promise<TSuccess> {
    options = options ? { ...this.options, ...options } : this.options;
    // const stream = new PassThrough()
    // const returnPromise = callback(stream)
    const requestPath = this.makeUrl(path, options, queryParams);
    const props = await this.initRequest(
      method,
      requestPath,
      body,
      authenticator,
      options
    );
    trace(`[stream] attempting to stream via download url`, props);

    return Promise.reject<TSuccess>(
      // Silly error message to prevent linter from complaining about unused variables
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      Error(
        `Streaming for callback ${props.method} ${props.requestPath} is not implemented`
      )
    );

    /*
    TODO complete this for the browser implementation
    const streamPromise = new Promise<void>((resolve, reject) => {
      trace(`[stream] beginning stream via download url`, props)
      reject(Error('Not implemented yet!'))
      // let hasResolved = false
      // const req = this.requestor(props)
      //
      // req
      //   .on("error", (err) => {
      //     if (hasResolved && (err as any).code === "ECONNRESET") {
      //       trace('ignoring ECONNRESET that occurred after streaming finished', props)
      //     } else {
      //       trace('streaming error', err)
      //       reject(err)
      //     }
      //   })
      //   .on("finish", () => {
      //     trace(`[stream] streaming via download url finished`, props)
      //   })
      //   .on("socket", (socket) => {
      //     trace(`[stream] setting keepalive on socket`, props)
      //     socket.setKeepAlive(true)
      //   })
      //   .on("abort", () => {
      //     trace(`[stream] streaming via download url aborted`, props)
      //   })
      //   .on("response", () => {
      //     trace(`[stream] got response from download url`, props)
      //   })
      //   .on("close", () => {
      //     trace(`[stream] request stream closed`, props)
      //   })
      //   .pipe(stream)
      //   .on("error", (err) => {
      //     trace(`[stream] PassThrough stream error`, err)
      //     reject(err)
      //   })
      //   .on("finish", () => {
      //     trace(`[stream] PassThrough stream finished`, props)
      //     resolve()
      //     hasResolved = true
      //   })
      //   .on("close", () => {
      //     trace(`[stream] PassThrough stream closed`, props)
      //   })
    })

    const results = await Promise.all([returnPromise, streamPromise])
    return results[0]
    */
  }
}
