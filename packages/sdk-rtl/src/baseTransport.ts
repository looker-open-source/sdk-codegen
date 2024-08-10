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
import { StatusCode, addQueryParams } from './transport';
import type {
  Authenticator,
  HttpMethod,
  IRawRequest,
  IRawResponse,
  ITransport,
  ITransportSettings,
  RawObserver,
  SDKResponse,
  Values,
} from './transport';

export abstract class BaseTransport implements ITransport {
  protected constructor(protected readonly options: ITransportSettings) {
    this.options = options;
  }

  observer: RawObserver | undefined = undefined;

  abstract parseResponse<TSuccess, TError>(
    raw: IRawResponse
  ): Promise<SDKResponse<TSuccess, TError>>;

  ok(res: IRawResponse): boolean {
    return (
      res.statusCode >= StatusCode.OK && res.statusCode <= StatusCode.IMUsed
    );
  }

  /**
   * HTTP request function for atomic, fully downloaded raw HTTP responses
   *
   * NOTE: This method has no error handling. It simply returns the results of the HTTP request.
   *
   * @param method of HTTP request
   * @param path request path, either relative or fully specified
   * @param queryParams name/value pairs to pass as part of the URL
   * @param body data for the body of the request
   * @param authenticator authenticator callback, typically from `IAuthSession` implementation
   * @param options overrides of default transport settings
   * @returns typed response of `TSuccess`, or `TError` result
   */
  abstract rawRequest(
    method: HttpMethod,
    path: string,
    queryParams?: Values,
    body?: any,
    authenticator?: Authenticator,
    options?: Partial<ITransportSettings>
  ): Promise<IRawResponse>;

  /**
   * Request a streaming response
   * @param method HTTP method
   * @param path Request path
   * @param queryParams query parameters for the request
   * @param body http body to include with request
   * @param authenticator callback to add authentication information to the request
   * @param options transport settings overrides
   */
  abstract request<TSuccess, TError>(
    method: HttpMethod,
    path: string,
    queryParams?: any,
    body?: any,
    authenticator?: Authenticator,
    options?: Partial<ITransportSettings>
  ): Promise<SDKResponse<TSuccess, TError>>;

  /**
   * Request a streaming response
   * @param {(readable: _Readable.Readable) => Promise<TSuccess>} callback A function will be called with a Node.js or
   *  Browser `Readable` object. The readable object represents the streaming data.
   * @param method HTTP method
   * @param path Request path
   * @param queryParams parameters for the request
   * @param body http body to include with request
   * @param authenticator callback to add authentication information to the request
   * @param options transport settings overrides
   * @returns the streaming response
   */
  abstract stream<TSuccess>(
    callback: (readable: Readable) => Promise<TSuccess>,
    method: HttpMethod,
    path: string,
    queryParams?: Values,
    body?: any,
    authenticator?: Authenticator,
    options?: Partial<ITransportSettings>
  ): Promise<TSuccess>;

  /**
   * Determine whether the url should be an API path, relative from base_url, or is already fully specified override
   * @param path Request path
   * @param options Transport settings
   * @param queryParams Collection of query Params
   * @returns the fully specified request path including any query string parameters
   */
  makeUrl(
    path: string,
    options: Partial<ITransportSettings>,
    queryParams?: Values
  ) {
    // is this an API-versioned call?
    const base = options.base_url;
    if (!path.match(/^(http:\/\/|https:\/\/)/gi)) {
      path = `${base}${path}`; // path was relative
    }
    path = addQueryParams(path, queryParams);
    return path;
  }

  abstract retry(wait: IRawRequest): Promise<IRawResponse>;
}
