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

import type { ThemeCustomizations } from '@looker/design-tokens'

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
  /** Theme settings for extension */
  themeOverrides(): ThemeOverrides
  /** Open a new browser window with the given url and target  */
  openBrowserWindow: (url: string, target?: string) => void
  /** error logger */
  logError: (error: Error, componentStack: string) => void
}

/**
 * Theme overrides used to load google fonts in Google environments only.
 * Google fonts should NOT be used when it is not obvious that a Google
 * system is being used (for example an embedded extension).
 */
export interface ThemeOverrides {
  loadGoogleFonts?: boolean
  themeCustomizations?: ThemeCustomizations
}

export const getThemeOverrides = (useGoogleFonts: boolean): ThemeOverrides =>
  useGoogleFonts
    ? {
        loadGoogleFonts: true,
        themeCustomizations: {
          fontFamilies: { brand: 'Google Sans' },
          colors: { key: '#1A73E8' },
        },
      }
    : {
        themeCustomizations: {
          colors: { key: '#1A73E8' },
        },
      }

/**
 * An adaptor class for interacting with browser APIs when running in standalone mode
 */
export class StandaloneEnvAdaptor implements IApixEnvAdaptor {
  private _themeOverrides: ThemeOverrides

  constructor() {
    const { hostname } = location
    this._themeOverrides = getThemeOverrides(
      hostname.endsWith('.looker.com') ||
        hostname.endsWith('.google.com') ||
        hostname === 'localhost' ||
        // Include firebase staging dev portal for now. Can be removed
        // when dev portal gets its own APIX project. Also includes
        // PRs.
        (hostname.startsWith('looker-developer-portal') &&
          hostname.endsWith('.web.app'))
    )
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

export enum EnvAdaptorConstants {
  LOCALSTORAGE_SDK_LANGUAGE_KEY = 'sdkLanguage',
}

let envAdaptor: IApixEnvAdaptor | undefined

/**
 * Register the environment adaptor. The API Explorer will automatically call this.
 */
export const registerEnvAdaptor = (adaptor: IApixEnvAdaptor) => {
  envAdaptor = adaptor
}

/**
 * Unregister the envAdaptor. The API Explorer will automatically call this when it is unmounted.
 */
export const unregisterEnvAdaptor = () => {
  envAdaptor = undefined
}

/**
 * Global access to the envAdaptor. An error will be thrown if accessed prematurely.
 */
export const getEnvAdaptor = () => {
  if (!envAdaptor) {
    throw new Error('Environment adaptor not initialized.')
  }
  return envAdaptor
}
