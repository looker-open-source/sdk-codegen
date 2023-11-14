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

import type { ILooker40SDK } from '@looker/sdk'

let _coreSDK: ILooker40SDK | undefined

/**
 * Register the core 4.0 SDK. The ExtensionProvider will automatically
 * call this when connection with the host suceeds. An extension using
 * the ExtensionProvider should  never call this.
 * @param coreSDK core sdk
 */
export const registerCoreSDK = (coreSDK: ILooker40SDK) => {
  if (_coreSDK) {
    throw new Error('coreSDK can only be registered onces')
  }
  _coreSDK = coreSDK
}

/**
 * Unregister the core 4.0 SDK. The ExtensionProvider will automatically
 * call this when it is unloaded. An extension using
 * the ExtensionProvider should  never call this.
 */
export const unregisterCoreSDK = () => (_coreSDK = undefined)

/**
 * Global access to the core40SDK. An error will be thrown if accessed prematurely.
 */
export const getCoreSDK = () => {
  if (!_coreSDK) {
    throw new Error('Looker host connection not established')
  }
  return _coreSDK
}
