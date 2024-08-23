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

import nodeCrypto from 'crypto';
import type * as fs from 'fs';

// import { Buffer } from 'node:buffer';

import type {
  Authenticator,
  HttpMethod,
  ICryptoHash,
  IRawRequest,
  IRawResponse,
  IRequestHeaders,
  IRequestProps,
  ISDKError,
  ITransportSettings,
  SDKResponse,
  Values,
} from '@looker/sdk-rtl';
import {
  BaseTransport,
  BrowserTransport,
  LookerAppId,
  ResponseMode,
  agentPrefix,
  canRetry,
  defaultTimeout,
  initResponse,
  pauseForRetry,
  responseMode,
  retryError,
  retryWait,
  safeBase64,
  mergeOptions,
} from '@looker/sdk-rtl';
import { WritableStream } from 'node:stream/web';

const utf8 = 'utf8';

const asString = (value: any): string => {
  if (value instanceof Buffer) {
    return Buffer.from(value).toString(utf8);
  }
  if (value instanceof Object) {
    return JSON.stringify(value);
  }
  return value.toString();
};

export class NodeCryptoHash implements ICryptoHash {
  secureRandom(byteCount: number): string {
    return nodeCrypto.randomBytes(byteCount).toString('hex');
  }

  async sha256Hash(message: string): Promise<string> {
    const hash = nodeCrypto.createHash('sha256');
    hash.update(message);
    return safeBase64(new Uint8Array(hash.digest()));
  }
}

export class NodeTransport extends BaseTransport {
  constructor(protected readonly options: ITransportSettings) {
    super(options);
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
    const waiter = newOpts.waitHandler || retryWait;
    const props = await this.initRequest(
      method,
      requestPath,
      body,
      authenticator,
      newOpts
    );
    let response = initResponse(method, requestPath);
    // TODO assign to MaxTries when retry is opt-out instead of opt-in
    const maxRetries = newOpts.maxTries ?? 1; // MaxTries
    let attempt = 1;
    while (attempt <= maxRetries) {
      const req = fetch(
        props.url,
        props as RequestInit // Weird package issues with unresolved imports for RequestInit for node-fetch :(
      );

      const requestStarted = Date.now();
      try {
        const res = await req;
        const responseCompleted = Date.now();

        // Start tracking the time it takes to convert the response
        const started = BrowserTransport.markStart(
          BrowserTransport.markName(requestPath)
        );
        const contentType = String(res.headers.get('content-type'));
        const mode = responseMode(contentType);
        const responseBody =
          mode === ResponseMode.binary ? res.blob() : res.text();
        if (!('fromRequest' in newOpts)) {
          // Request will markEnd, so don't mark the end here
          BrowserTransport.markEnd(requestPath, started);
        }
        const headers: IRequestHeaders = {};
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
          const result = await pauseForRetry(
            request,
            response,
            attempt,
            waiter
          );
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
      } catch (e: any) {
        response.ok = false;
        response.body = e;
        response.statusCode = e.statusCode;
        response.statusMessage = e.message;
        return response;
      }
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

  async parseResponse<TSuccess, TError>(res: IRawResponse) {
    const mode = responseMode(res.contentType);
    let response: SDKResponse<TSuccess, TError>;
    let error;
    if (!res.ok) {
      // Raw request had an error. Make sure it's a string before parsing the result
      error = await res.body;
      if (typeof error === 'string') {
        try {
          error = JSON.parse(error);
        } catch {
          error = { message: `Request failed: ${error}` };
        }
      }
      response = { ok: false, error };
      return response;
    }
    let result = await res.body;
    if (mode === ResponseMode.string) {
      if (res.contentType.match(/^application\/.*\bjson\b/g)) {
        try {
          if (result instanceof Buffer) {
            result = Buffer.from(result).toString(); // (utf8);
          }
          if (!(result instanceof Object)) {
            result = JSON.parse(result.toString());
          }
        } catch (err: any) {
          error = err;
        }
      } else if (!error) {
        // Convert to string otherwise
        result = asString(result);
      }
    } else {
      try {
        const body = await result;
        if (typeof body === 'string') {
          result = body;
        } else {
          // must be a blob?
          const bytes = await body.arrayBuffer();
          result = Buffer.from(bytes ?? '').toString('binary');
        }
      } catch (err: any) {
        error = err;
      }
    }
    if (!error) {
      response = { ok: true, value: result };
    } else {
      response = { ok: false, error: error as TError };
    }
    return response;
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
      const res = await this.rawRequest(
        method,
        path,
        queryParams,
        body,
        authenticator,
        options
      );
      return await this.parseResponse<TSuccess, TError>(res);
    } catch (e: any) {
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

    const response: Response = await fetch(requestPath, init as RequestInit);
    return await callback(response);
  }

  /**
   * should the request verify SSL?
   * @param options Defaults to the instance options values
   * @returns true if the request should require full SSL verification
   */
  verifySsl(options?: Partial<ITransportSettings>) {
    if (!options) options = this.options;
    return 'verify_ssl' in options ? options.verify_ssl : true;
  }

  /**
   * Request timeout in seconds
   * @param options Defaults to the instance options values
   */
  timeout(options?: Partial<ITransportSettings>): number {
    if (!options) options = this.options;
    if ('timeout' in options && options.timeout) return options.timeout;
    return defaultTimeout;
  }

  private async initRequest(
    method: HttpMethod,
    path: string,
    body?: any,
    authenticator?: Authenticator,
    options?: Partial<ITransportSettings>
  ) {
    const agentTag = options?.agentTag || this.options.agentTag || agentPrefix;
    options = mergeOptions(
      { ...this.options, ...{ headers: { [LookerAppId]: agentTag } } },
      options ?? {}
    );
    const headers = options.headers ?? {};

    // Make sure an empty body is undefined
    if (!body) {
      body = undefined;
    } else {
      if (typeof body !== 'string') {
        body = JSON.stringify(body);
        headers['Content-Type'] = 'application/json';
      }
    }

    // TODO need to add timeout back
    let props: IRequestProps = {
      body,
      credentials: 'same-origin',
      headers,
      method,
      url: path,
    };

    if (!this.verifySsl(options)) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
      // This information appears to be stale. Commenting it out as a cruft
      // signal to continue researching something better than the process
      // toggle cannon
      // props.agent = new https.Agent({
      //   requestCert: false,
      //   rejectUnauthorized: false,
      // });
    }

    if (authenticator) {
      // Add authentication information to the request
      props = await authenticator(props);
    }

    // Transform to HTTP request headers at the last second
    // props.headers = new Headers(props.headers) as any;

    return props;
  }
}

/**
 * Turn a NodeJS WriteStream into a WritableStream for compatibility with browser standards
 * @param writer usually created by fs.createWriteStream()
 */
export const createWritableStream = (
  writer: ReturnType<typeof fs.createWriteStream>
) => {
  return new WritableStream({
    write: (chunk: any) => {
      writer.write(chunk);
    },
  });
};
