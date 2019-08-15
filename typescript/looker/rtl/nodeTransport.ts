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
  ISDKError,
  SDKResponse,
  ITransport,
  addQueryParams,
  parseResponse,
  ITransportSettings,
  Authenticator,
  StatusCode
} from './transport'

import * as rq from 'request'
import rp from 'request-promise-native'

type RequestOptions = rq.RequiredUriUrl & rp.RequestPromiseOptions

export class NodeTransport implements ITransport {
  apiPath = ''

  constructor(private options: ITransportSettings) {
    this.options = options
    this.apiPath = `${options.base_url}/api/${options.api_version}`
  }

  private ok(res: rq.Response) {
    return res.statusCode >= StatusCode.OK && (res.statusCode <= StatusCode.IMUsed)
  }

  async request<TSuccess, TError>(
    method: string,
    path: string,
    queryParams?: any,
    body?: any,
    authenticator?: Authenticator
  ): Promise<SDKResponse<TSuccess, TError>> {
    // TODO use version info for the Typescript packagePath
    const agentTag = `LookerSDK JS ${this.options.api_version}`
    let headers: any = {
      'User-Agent': agentTag,
      ...this.options.headers
    }
    if (body) {
      // if (body instanceof Object) {
      //   // TODO figure out this ugliness
      //   body = JSON.parse(JSON.stringify(body))
      // }
      headers = {
        'User-Agent': agentTag,
        // 'Content-Length': Buffer.byteLength(body),
        ...this.options.headers
      }
    }
    // is this an API-versioned call?
    let requestPath = (authenticator ? this.apiPath : this.options.base_url) + addQueryParams(path, queryParams)
    let init: RequestOptions = {
      url: requestPath,
      rejectUnauthorized: false, // TODO make this configurable for tests. Should default to True
      headers: headers,
      body: body ? body : undefined,
      json: body ? true : false,
      resolveWithFullResponse: true,
      method
    }

    if (authenticator) {
      // Automatic authentication process for the request
      init = await authenticator(init)
    }
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
        message: typeof e.message === 'string' ? e.message : `The SDK call was not successful. The error was '${e}'.`
      }
      return {ok: false, error}
    }
  }
}
