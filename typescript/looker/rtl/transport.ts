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

/** A transport is a generic way to make HTTP requests. */

// TODO create generic Headers and Request interfaces that are not transport-specific
import { Headers, Response } from "node-fetch"
// TODO create generic Agent not transport-specific
import { Agent } from "https"

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'TRACE' | 'HEAD'

export interface ITransport {
  request<TSuccess, TError> (
    method: HttpMethod,
    path: string,
    queryParams?: any,
    body?: any,
    authenticator?: Authenticator
  ): Promise<SDKResponse<TSuccess, TError>>
}

/** A successful SDK call. */
interface ISDKSuccessResponse<T> {
  /** Whether the SDK call was successful. */
  ok: true
  /** The object returned by the SDK call. */
  value: T
}

/** An erroring SDK call. */
interface ISDKErrorResponse<T> {
  /** Whether the SDK call was successful. */
  ok: false
  /** The error object returned by the SDK call. */
  error: T
}

/** An error representing an issue in the SDK, like a network or parsing error. */
export interface ISDKError {
  type: 'sdk_error'
  message: string
}

export type SDKResponse<TSuccess, TError> = ISDKSuccessResponse<TSuccess> | ISDKErrorResponse<TError | ISDKError>

export interface IRequestInit {
  body?: any
  headers?: any
  method: string
  redirect?: any

  // node-fetch extensions
  agent?: Agent; // =null http.Agent instance, allows custom proxy, certificate etc.
  compress?: boolean; // =true support gzip/deflate content encoding. false to disable
  follow?: number; // =20 maximum redirect count. 0 to not follow redirect
  size?: number; // =0 maximum response body size in bytes. 0 to disable
  timeout?: number; // =0 req/res timeout in ms, it resets on redirect. 0 to disable (OS limit applies)

}

// General purpose authentication callback
export type Authenticator = (init: any) => any

export interface ITransportSettings {
  base_url: string
  headers?: Headers
}

export function addQueryParams (path: string, obj?: { [key: string]: string }) {
  if (!obj) {
    return path
  }
  const keys = Object.keys(obj)
  if (keys.length === 0) {
    return path
  } else {
    const qp = keys.map((k) => k + '=' + encodeURIComponent(obj[k])).join('&')
    return `${path}?${qp}`
  }
}

export async function parseResponse (contentType: string, res: Response) {
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
