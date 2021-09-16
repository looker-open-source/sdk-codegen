/*

 MIT License

 Copyright (c) 2021 Looker Data Sciences, Inc.

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.

 */

import type { Looker31SDK, Looker40SDK } from '@looker/sdk'
import type { BaseExtensionContextData } from '../ExtensionConnector'

/**
 * Extension context
 */
export interface ExtensionContextData extends BaseExtensionContextData {
  /**
   * Looker 3.1 SDK. Note that SDK calls are made by the extension host.
   * @deprecated use core31SDK - coreSDK === core31SDK
   */
  coreSDK: Looker31SDK
  /**
   * Looker 31. SDK. Note that SDK calls are made by the extension host.
   */
  core31SDK: Looker31SDK
  /**
   * Looker 4.0 SDK. Note that SDK calls are made by the extension host.
   */
  core40SDK: Looker40SDK
}
