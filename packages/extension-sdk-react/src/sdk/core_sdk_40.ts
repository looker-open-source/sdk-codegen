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

 import {
  registerCoreSDK,
  unregisterCoreSDK,
  getCoreSDK,
 } from './core_sdk'

/**
 * Register the core SDK. The ExtensionProvider will automatically
 * call this when connection with the host succeeds. An extension using
 * the ExtensionProvider should  never call this.
 * @param coreSDK core sdk
 * @deprecated use registerCoreSDK
 */
export const registerCore40SDK = registerCoreSDK

/**
 * Unregister the core SDK. The ExtensionProvider will automatically
 * call this when it is unloaded. An extension using
 * the ExtensionProvider should never call this.
 * @deprecated use unregisterCoreSDK
 */
export const unregisterCore40SDK = unregisterCoreSDK

/**
 * Global access to the coreSDK. An error will be thrown if accessed prematurely.
 * @deprecated use getCoreSDK
 */
export const getCore40SDK = getCoreSDK

