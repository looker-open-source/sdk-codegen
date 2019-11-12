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

export * from './rtl/apiMethods'
export * from './rtl/apiSettings'
export * from './rtl/authToken'
export * from './rtl/authSession'
export * from './rtl/browserSdk'
export * from './rtl/browserSession'
export * from './rtl/browserTransport'
export * from './rtl/nodeSdk'
export * from './rtl/nodeSession'
export * from './rtl/nodeSettings'
export * from './rtl/nodeTransport'
export * from './rtl/proxySession'
export * from './rtl/transport'
export * from './rtl/constants'
export * from './sdk/methods'
export * from './sdk/models'

import { IAuthSession } from './rtl/transport'
import { LookerSDK } from './sdk/methods'

/**
 * @class SDK
 *
 * Simple factory for the Typescript version of the Looker SDK. Provides default connectivity for SDK methods
 *
 */
export class SDK {
  /**
   * Creates an [[LookerSDK]] object.
   *
   * @param session {IAuthSession} SDK session manager to use
   */
  static createClient(session: IAuthSession) {
    return new LookerSDK(session)
  }
}
