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

import type { IExtensionAdaptor, ThemeOverrides } from './adaptorUtils'
import { getThemeOverrides, hostedByGoogle } from './adaptorUtils'

/**
 * An adaptor class for interacting with browser APIs when not running in an extension
 */
export class BrowserAdaptor implements IExtensionAdaptor {
  private _themeOverrides: ThemeOverrides

  constructor() {
    const { hostname } = location
    this._themeOverrides = getThemeOverrides(hostedByGoogle(hostname))
  }

  async localStorageGetItem(key: string) {
    return localStorage.getItem(key)
  }

  async localStorageSetItem(key: string, value: string) {
    await localStorage.setItem(key, value)
  }

  async localStorageRemoveItem(key: string) {
    await localStorage.removeItem(key)
  }

  themeOverrides() {
    return this._themeOverrides
  }

  openBrowserWindow(url: string, target?: string) {
    window.open(url, target)
  }

  logError(_error: Error, _componentStack: string): void {
    // noop - error logging for standalone APIX TBD
  }
}
