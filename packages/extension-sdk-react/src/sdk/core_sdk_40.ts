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

import type { Looker40SDK } from '@looker/sdk';

let _core40SDK: Looker40SDK | undefined;

/**
 * Register the core 4.0 SDK. The ExtensionProvider will automatically
 * call this when connection with the host suceeds. An extension using
 * the ExtensionProvider should  never call this.
 * @param coreSDK core sdk
 */
export const registerCore40SDK = (coreSDK: Looker40SDK) => {
  if (_core40SDK) {
    throw new Error('coreSDK can only be registered once');
  }
  _core40SDK = coreSDK;
};

/**
 * Unregister the core 4.0 SDK. The ExtensionProvider will automatically
 * call this when it is unloaded. An extension using
 * the ExtensionProvider should  never call this.
 */
export const unregisterCore40SDK = () => (_core40SDK = undefined);

/**
 * Global access to the core40SDK. An error will be thrown if accessed prematurely.
 */
export const getCore40SDK = () => {
  if (!_core40SDK) {
    throw new Error('Looker host connection not established');
  }
  return _core40SDK;
};
