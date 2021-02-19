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

import { Looker31SDK } from '@looker/sdk/lib/3.1/methods'

let _core31SDK: Looker31SDK | undefined

/**
 * Register the core 3.1 SDK. The ExtensionProvider will automatically
 * call this when connection with the host suceeds. An extension using
 * the ExtensionProvider should  never call this.
 * @param coreSDK core sdk
 */
export const registerCore31SDK = (coreSDK: Looker31SDK) => {
  if (_core31SDK) {
    throw new Error('coreSDK can only be registered once')
  }
  _core31SDK = coreSDK
}

/**
 * Unregister the core 3.1 SDK. The ExtensionProvider will automatically
 * call this when it is unloaded. An extension using
 * the ExtensionProvider should  never call this.
 */
export const unregisterCore31SDK = () => (_core31SDK = undefined)

/**
 * Global access to the coreSDK. An error will be thrown if accessed prematurely.
 */
export const getCore31SDK = () => {
  if (!_core31SDK) {
    throw new Error('Looker host connection not established')
  }
  return _core31SDK
}
