/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2019 Looker Data Sciences, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import {
  addQueryParams,
  Authenticator,
  HttpMethod,
  ITransport,
  ITransportSettings,
  SDKResponse,
  Values,
} from './transport'
import { Readable } from 'readable-stream'

export abstract class BaseTransport implements ITransport {
  apiPath = ''

  constructor(protected readonly options: ITransportSettings) {
    this.options = options
    this.apiPath = `${options.base_url}/api/${options.api_version}`
  }

  /**
   * Request a streaming response
   * @param {HttpMethod} method
   * @param {string} path Request path
   * @param queryParams query parameters for the request
   * @param body http body to include with request
   * @param {Authenticator} authenticator callback to add authentication information to the request
   * @param {Partial<ITransportSettings>} options transport option overrides
   * @returns {Promise<TSuccess>} the streaming response
   */
  abstract async request<TSuccess, TError>(
    method: HttpMethod,
    path: string,
    queryParams?: any,
    body?: any,
    authenticator?: Authenticator,
    options?: Partial<ITransportSettings>,
  ): Promise<SDKResponse<TSuccess, TError>>

  /**
   * Request a streaming response
   * @param {(readable: _Readable.Readable) => Promise<TSuccess>} callback A function will be called with a Node.js or
   *  Browser `Readable` object. The readable object represents the streaming data.
   * @param {HttpMethod} method
   * @param {string} path Request path
   * @param queryParams query parameters for the request
   * @param body http body to include with request
   * @param {Authenticator} authenticator callback to add authentication information to the request
   * @param {Partial<ITransportSettings>} options transport option overrides
   * @returns {Promise<TSuccess>} the streaming response
   */
  abstract async stream<TSuccess>(
    callback: (readable: Readable) => Promise<TSuccess>,
    method: HttpMethod,
    path: string,
    queryParams?: Values,
    body?: any,
    authenticator?: Authenticator,
    options?: Partial<ITransportSettings>
  )
    : Promise<TSuccess>

  /**
   * Determine whether the url should be an API path, relative from base_url, or is already fully specified override
   * @param path Request path
   * @param options Transport settings
   * @param queryParams Collection of query Params
   * @param authenticator optional callback
   * @returns the fully specified request path including any query string parameters
   */
  makeUrl(
    path: string,
    options: Partial<ITransportSettings>,
    queryParams?: Values,
    authenticator?: Authenticator,
  ) {
    // is this an API-versioned call?
    let base = (authenticator ? this.apiPath : options.base_url)!
    if (!path.match(/^(http:\/\/|https:\/\/)/gi)) {
      path = `${base}${path}` // path was relative
    }
    path = addQueryParams(path, queryParams)
    return path
  }

}
