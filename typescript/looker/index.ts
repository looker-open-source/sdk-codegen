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

import * as models31 from './sdk/3.1/models'
export { models31 }

export * from './rtl/apiMethods'
export * from './rtl/apiSettings'
export * from './rtl/authToken'
export * from './rtl/authSession'
export * from './rtl/browserSdk'
export * from './rtl/browserSession'
export * from './rtl/browserTransport'
export * from './rtl/constants'
export * from './rtl/corsSession'
export * from './rtl/extensionSdk'
export * from './rtl/extensionSession'
export * from './rtl/extensionTransport'
export * from './rtl/nodeSdk'
export * from './rtl/nodeSession'
export * from './rtl/nodeSettings'
export * from './rtl/nodeTransport'
export * from './rtl/proxySession'
export * from './rtl/transport'
export * from './sdk/3.1/methods'
export * from './sdk/3.1/streams'
export * from './sdk/4.0/methods'
export * from './sdk/4.0/models'
export * from './sdk/4.0/streams'

import { IAuthSession } from './rtl/authSession'
import { Looker31SDK } from './sdk/3.1/methods'
import { Looker40SDK } from './sdk/4.0/methods'

/**
 * @class SDK
 *
 * Simple factory for the Typescript version of the Looker SDK. Provides default connectivity for SDK methods
 *
 */
export class SDK {
  /**
   * Creates a [[LookerSDK]] object.
   *
   * @param session {IAuthSession} SDK session manager to use
   * @param apiVersion Version of API to initialize. Defaults to 4.0
   */
  static createClient(session: IAuthSession) {
    const apiVersion = session.settings.api_version ?? '4.0'
    if (apiVersion === '3.1') {
      return new Looker31SDK(session)
    }
    return new Looker40SDK(session)
  }
}
