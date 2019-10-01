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
  agentTag,
  Authenticator,
  defaultTimeout,
  HttpMethod,
  ISDKError, isUtf8,
  ITransport,
  ITransportSettings,
  responseMode,
  ResponseMode,
  SDKResponse,
  StatusCode,
} from './transport'

import rq, { Response } from 'request'
import rp from 'request-promise-native'

type RequestOptions = rq.RequiredUriUrl & rp.RequestPromiseOptions;

export class NodeTransport implements ITransport {
  apiPath = ''

  constructor(private readonly options: ITransportSettings) {
    this.options = options
    this.apiPath = `${options.base_url}/api/${options.api_version}`
  }

  async request<TSuccess, TError>(
    method: HttpMethod,
    path: string,
    queryParams?: any,
    body?: any,
    authenticator?: Authenticator,
    options?: Partial<ITransportSettings>,
  ): Promise<SDKResponse<TSuccess, TError>> {
    let init = await this.initRequest(
      method,
      path,
      queryParams,
      body,
      authenticator,
      options,
    )
    const req = rp(init).promise()

    try {
      const res = await req
      const resTyped = res as rq.Response
      const contentType = String(resTyped.headers['content-type'])
      // @ts-ignore have to resolve missing properties of response promise
      const parsed = await parseResponse(contentType, res)
      if (this.ok(resTyped)) {
        return {ok: true, value: parsed}
      } else {
        return {ok: false, error: parsed}
      }
    } catch (e) {
      const error: ISDKError = {
        type: 'sdk_error',
        message:
          typeof e.message === 'string'
            ? e.message
            : `The SDK call was not successful. The error was '${e}'.`,
      }
      return {ok: false, error}
    }
  }

  /**
   * should the request verify SSL?
   * @param {Partial<ITransportSettings>} options Defaults to the instance options values
   * @returns {boolean} true if the request should require full SSL verification
   */
  verifySsl(options?: Partial<ITransportSettings>) {
    if (!options) options = this.options
    return 'verify_ssl' in options ? options.verify_ssl : true
  }

  /**
   * Request timeout in seconds
   * @param {Partial<ITransportSettings>} options Defaults to the instance options values
   * @returns {number | undefined}
   */
  timeout(options?: Partial<ITransportSettings>): number {
    if (!options) options = this.options
    if ('timeout' in options && options.timeout) return options.timeout
    return defaultTimeout
  }

  // async stream<TError>(
  //   method: HttpMethod,
  //   path: string,
  //   queryParams?: any,
  //   body?: any,
  //   authenticator?: Authenticator
  // ): Promise<SDKResponse<rq.Response, TError>> {
  //   let init = await this.initRequest(method, path, queryParams, body, authenticator)
  //   let req: rq.Request = rq.defaults(init)
  // }

  private async initRequest(
    method: HttpMethod,
    path: string,
    queryParams?: any,
    body?: any,
    authenticator?: Authenticator,
    options?: Partial<ITransportSettings>,
  ) {
    options = options ? {...this.options, ...options} : this.options
    let headers: any = {
      'User-Agent': agentTag,
      ...options.headers,
    }
    if (body) {
      headers = {
        'User-Agent': agentTag,
        ...options.headers,
      }
    }
    // is this an API-versioned call?
    let requestPath =
      (authenticator ? this.apiPath : options.base_url) +
      addQueryParams(path, queryParams)
    let init: RequestOptions = {
      url: requestPath,
      headers: headers,
      body: body ? body : undefined,
      json: !!body,
      resolveWithFullResponse: true,
      rejectUnauthorized: this.verifySsl(options),
      timeout: this.timeout(options) * 1000,
      encoding: null, // null = requests are returned as binary so `Content-Type` dictates response format
      method,
    }
    if ('encoding' in options) init.encoding = options.encoding

    if (authenticator) {
      // Automatic authentication process for the request
      init = await authenticator(init)
    }
    return init
  }

  private ok(res: rq.Response) {
    return (
      res.statusCode >= StatusCode.OK && res.statusCode <= StatusCode.IMUsed
    )
  }
}

async function parseResponse(contentType: string, res: Response) {
  const mode = responseMode(contentType)
  let result = await res.body
  if (mode === ResponseMode.string) {
    if (!isUtf8(contentType)) {
      // always convert to UTF-8 from whatever it was
      result = Buffer.from(result.toString(), 'utf8')
    }
    if (contentType.match(/^application\/.*\bjson\b/g)) {
      try {
        result = result instanceof Object ? result : JSON.parse(result)
        return result
      } catch (error) {
        return Promise.reject(error)
      }
    }
    return result.toString()
  } else {
    try {
      // Return string result from buffer without any character encoding
      return result.toString()
    } catch (error) {
      return Promise.reject(error)
    }
  }
}
