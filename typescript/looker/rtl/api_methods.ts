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

import { SDKResponse, Transport } from './transport'

export class APIMethods {
  constructor (private transport: Transport) {
    this.transport = transport
  }

  /** A helper method for simplifying error handling of SDK responses.
   *
   * Pass in a promise returned by any SDK method, and it will return a promise
   * that rejects if the `SDKResponse` is not `ok`. This will swallow the type
   * information in the error case, but allows you to route all the error cases
   * into a single promise rejection.
   *
   * The promise will have a `Error` rejection reason with a string `message`.
   * If the server error contains a `message` field, it will be provided, otherwise a
   * generic message will occur.
   *
   * ```ts
   * const sdk = LookerSDK({...})
   * let look
   * try {
   *    look = await sdk.ok(sdk.create_look({...}))
   *    // do something with look
   * }
   * catch(e) {
   *    // handle error case
   * }
   * ```
   */
  async ok<TSuccess, TError> (promise: Promise<SDKResponse<TSuccess, TError>>) {
    const result = await promise
    if (result.ok) {
      return result.value
    } else {
      const anyResult = result as any
      if (typeof anyResult.message === 'string') {
        throw new Error(anyResult.message)
      } else {
        throw new Error('An unknown error occurred with the SDK method.')
      }
    }
  }

  // dynamically evaluate a template string
  macro(template: string, vars: any) {
    // replace {foo} from spec path with ${foo} for template string
    template = template.replace('{', '${')
    return new Function("return `+template +`;").call(vars)
  }

  pathify(path: string, pathParams?: any) {
    if (!pathParams) return path
    if (path.indexOf("{") < 0) return path
    return this.macro(path, pathParams)
  }

  /** Make a GET request */
  async get<TSuccess, TError> (
    path: string,
    pathParams?: any,
    queryParams?: any,
    body?: any
  ): Promise<SDKResponse<TSuccess, TError>> {
    return this.transport.request<TSuccess, TError>('GET', this.pathify(path, pathParams), queryParams, body)
  }

  /** Make a HEAD request */
  async head<TSuccess, TError> (
    path: string,
    pathParams?: any,
    queryParams?: any,
    body?: any
  ): Promise<SDKResponse<TSuccess, TError>> {
    return this.transport.request<TSuccess, TError>('HEAD', this.pathify(path, pathParams), queryParams, body)
  }

  /** Make a DELETE request */
  async delete<TSuccess, TError> (
    path: string,
    pathParams?: any,
    queryParams?: any,
    body?: any
  ): Promise<SDKResponse<TSuccess, TError>> {
    return this.transport.request<TSuccess, TError>('DELETE', this.pathify(path, pathParams), queryParams, body)
  }

  /** Make a POST request */
  async post<TSuccess, TError> (
    path: string,
    pathParams?: any,
    queryParams?: any,
    body?: any
  ): Promise<SDKResponse<TSuccess, TError>> {
    return this.transport.request<TSuccess, TError>('POST', this.pathify(path, pathParams), queryParams, body)
  }

  /** Make a PUT request */
  async put<TSuccess, TError> (
    path: string,
    pathParams?: any,
    queryParams?: any,
    body?: any
  ): Promise<SDKResponse<TSuccess, TError>> {
    return this.transport.request<TSuccess, TError>('PUT', this.pathify(path, pathParams), queryParams, body)
  }

  /** Make a PATCH request */
  async patch<TSuccess, TError> (
    path: string,
    pathParams?: any,
    queryParams?: any,
    body?: any
  ): Promise<SDKResponse<TSuccess, TError>> {
    return this.transport.request<TSuccess, TError>('PATCH', this.pathify(path, pathParams), queryParams, body)
  }
}
