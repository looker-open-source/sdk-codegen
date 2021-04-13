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

/**
 * NOTE: This interface should describe all methods that require an adaptor when running in standalone vs extension mode
 * Examples include: local storage operations, writing to clipboard and various link navigation functions amongst others
 */
export interface IApixEnvAdaptor {
  /** Method for retrieving a keyed value from local storage */
  localStorageGetItem(key: string): Promise<string | null>
  /** Method for setting a keyed value in local storage */
  localStorageSetItem(key: string, value: string): void
  /** Method for removing a keyed value from local storage */
  localStorageRemoveItem(key: string): void
}

/**
 * An adaptor class for interacting with browser APIs when running in standalone mode
 */
export class StandaloneEnvAdaptor implements IApixEnvAdaptor {
  async localStorageGetItem(key: string) {
    return localStorage.getItem(key)
  }

  async localStorageSetItem(key: string, value: string) {
    await localStorage.setItem(key, value)
  }

  async localStorageRemoveItem(key: string) {
    await localStorage.removeItem(key)
  }
}

export enum EnvAdaptorConstants {
  LOCALSTORAGE_SDK_LANGUAGE_KEY = 'sdkLanguage',
}
