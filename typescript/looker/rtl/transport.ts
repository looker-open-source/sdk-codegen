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
export interface Transport {
  request<TSuccess, TError> (
    method: string,
    path: string,
    queryParams?: any,
    body?: any
  ): Promise<SDKResponse<TSuccess, TError>>
}

/** A successful SDK call. */
interface SDKSuccessResponse<T> {
  /** Whether the SDK call was successful. */
  ok: true
  /** The object returned by the SDK call. */
  value: T
}

/** An erroring SDK call. */
interface SDKErrorResponse<T> {
  /** Whether the SDK call was successful. */
  ok: false
  /** The error object returned by the SDK call. */
  error: T
}

/** An error representing an issue in the SDK, like a network or parsing error. */
export interface SDKError {
  type: 'sdk_error'
  message: string
}

export type SDKResponse<TSuccess, TError> = SDKSuccessResponse<TSuccess> | SDKErrorResponse<TError | SDKError>
