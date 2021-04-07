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
import { ExtensionSDK } from '@looker/extension-sdk'

export interface IDualModeConfigurator {
  getLocalStorageItem: (key: string) => Promise<string | null>
  setLocalStorageItem: (key: string, value: string) => void
}

/**
 * A dual mode configurator class for interacting with browser APIs both in the
 * standalone and extension versions
 */
export class DualModeConfigurator implements IDualModeConfigurator {
  extensionSDK?: ExtensionSDK

  constructor(extensionSDK?: ExtensionSDK) {
    this.extensionSDK = extensionSDK
  }

  async getLocalStorageItem(key: string): Promise<string | null> {
    const item =
      this.extensionSDK?.localStorageGetItem(key) || localStorage.getItem(key)
    return item
  }

  async setLocalStorageItem(key: string, value: string) {
    if (this.extensionSDK) {
      await this.extensionSDK.localStorageSetItem(key, value)
    } else {
      localStorage.setItem(key, value)
    }
  }
}
