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

import { ISDKError, SDKResponse, ITransport, addQueryParams, parseResponse, ITransportSettings, Authenticator } from './transport'
// TODO need to abstract the fetch plug-in
import fetch, { Headers, RequestInit } from 'node-fetch'
// TODO abstract and make insecure agent injectable for testing
import { Agent } from 'https'

export class NodeTransport implements ITransport {
  apiPath = ''
  constructor (private options: ITransportSettings) {
    this.options = options
    this.apiPath = `${options.base_url}/${options.api_version}`
  }

  async request<TSuccess, TError> (
    method: string,
    path: string,
    queryParams?: any,
    body?: any,
    authenticator?: Authenticator
  ): Promise<SDKResponse<TSuccess, TError>> {
    let init : RequestInit = {
      body: body ? JSON.stringify(body) : undefined,
      headers: this.options.headers || new Headers(),
      agent: new Agent({rejectUnauthorized: false}),
      method
    }

    let requestPath = this.options.base_url
    if (authenticator) {
      // Automatic authentication process for the request
      init = await authenticator(init)
      // this must be an API-versioned call
      requestPath = this.apiPath
    }

    const req = fetch(
      requestPath + addQueryParams(path, queryParams),
      init
    )

    try {
      const res = await req
      const contentType = String(res.headers.get('content-type'))
      // @ts-ignore have to resolve missing properties of response promise
      const parsed = await parseResponse(contentType, res)
      if (res.ok) {
        return { ok: true, value: parsed }
      } else {
        return { ok: false, error: parsed }
      }
    } catch (e) {
      const error: ISDKError = {
        type: 'sdk_error',
        message: typeof e.message === 'string' ? e.message : `The SDK call was not successful. The error was '${e}'.`
      }
      return { ok: false, error }
    }
  }
}
