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
  IApixEnvAdaptor,
  ThemeOverrides,
  getThemeOverrides,
} from '@looker/api-explorer/src/utils'
import { ExtensionSDK } from '@looker/extension-sdk'

/**
 * An adaptor class for interacting with browser APIs when running as an extension
 */
export class ExtensionEnvAdaptor implements IApixEnvAdaptor {
  _themeOverrides: ThemeOverrides
  constructor(public extensionSdk: ExtensionSDK) {
    this._themeOverrides = getThemeOverrides(
      (this.extensionSdk.lookerHostData || { hostType: 'standard' })
        .hostType === 'standard'
    )
  }

  async localStorageGetItem(key: string) {
    return await this.extensionSdk.localStorageGetItem(key)
  }

  async localStorageSetItem(key: string, value: string) {
    await this.extensionSdk.localStorageSetItem(key, value)
  }

  async localStorageRemoveItem(key: string) {
    await this.extensionSdk.localStorageRemoveItem(key)
  }

  themeOverrides(): ThemeOverrides {
    return this._themeOverrides
  }

  runAsEmbed(): boolean {
    return (
      (this.extensionSdk.lookerHostData || { hostType: 'standard' })
        .hostType === 'embed'
    )
  }

  openBrowserWindow(url: string, target?: string) {
    this.extensionSdk.openBrowserWindow(url, target)
  }
}
