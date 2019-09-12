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
  ITransportSettings,
  HttpMethod,
} from './transport'

export class BrowserTransport implements ITransport {
  constructor(private options: ITransportSettings) {
    this.options = options
  }

  async request<TSuccess, TError>(
    method: HttpMethod,
    path: string,
    queryParams?: any,
    body?: any,
  ): Promise<SDKResponse<TSuccess, TError>> {
    const req = fetch(
      this.options.base_url + addQueryParams(path, queryParams),
      {
        body: body ? JSON.stringify(body) : undefined,
        headers: this.options.headers || new Headers(),
        credentials: 'same-origin',
        method,
      },
    )

    try {
      const res = await req
      const contentType = String(res.headers.get('content-type'))
      const parsed = await parseResponse(contentType, res)
      if (res.ok) {
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
}

async function parseResponse(contentType: string, res: Response) {
  if (contentType.match(/application\/json/g)) {
    try {
      return await res.json()
    } catch (error) {
      return Promise.reject(error)
    }
  } else if (contentType === 'text' || contentType.startsWith('text/')) {
    return res.text()
  } else {
    try {
      return await res.blob()
    } catch (error) {
      return Promise.reject(error)
    }
  }
}
