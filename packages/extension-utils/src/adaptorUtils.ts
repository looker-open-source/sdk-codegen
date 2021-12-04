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
import type { IAPIMethods } from '@looker/sdk-rtl'
import { BrowserAdaptor } from './browserAdaptor'

export interface IAuthAdaptor {
  /** Method for retrieving an instantiated SDK */
  get sdk(): IAPIMethods
  /** Method for authenticating against the API server. Auth mechanism is dependent on the authSession implementation
   * used for the sdk. */
  login(): void
}

/**
 * NOTE: This interface should describe all methods that require an adaptor when running in standalone vs extension mode
 * Examples include: local storage operations and various link navigation functions
 */
export interface IEnvironmentAdaptor extends IAuthAdaptor {
  /** Method for determining whether running in a browser or extension environment */
  isExtension(): boolean
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
  /** Should Google-specific fonts be used for the theme? */
  loadGoogleFonts?: boolean
  /** Property bag overrides for Looker component theming */
  themeCustomizations?: ThemeCustomizations
}

/**
 * Is this an "internal" host that will use internal branding?
 * @param hostname to check
 */
export const hostedInternally = (hostname: string): boolean =>
  hostname.endsWith('.looker.com') ||
  hostname.endsWith('.google.com') ||
  hostname === 'localhost' ||
  // Include firebase staging dev portal for now. Can be removed
  // when dev portal gets its own APIX project. Also includes
  // PRs.
  (hostname.startsWith('looker-developer-portal') &&
    hostname.endsWith('.web.app'))

/**
 * Return theme overrides that make apply "internal" or external theming
 * @param internalTheming true if "internal" theme should be used
 */
export const getThemeOverrides = (internalTheming: boolean): ThemeOverrides =>
  internalTheming
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

let extensionAdaptor: IEnvironmentAdaptor | undefined

/**
 * Register the environment adaptor. Used when initializing the application
 * @param adaptor to register
 */
export const registerEnvAdaptor = (adaptor: IEnvironmentAdaptor) => {
  extensionAdaptor = adaptor
}

/**
 * Unregister the environment adaptor. Extensions should call this when unmounted
 */
export const unregisterEnvAdaptor = () => {
  extensionAdaptor = undefined
}

/**
 * Global access to the environment adaptor. An error will be thrown if accessed prematurely.
 */
export const getEnvAdaptor = () => {
  if (!extensionAdaptor) {
    throw new Error('Environment adaptor not initialized.')
  }
  return extensionAdaptor
}

/**
 * Used by some unit tests
 * @param adaptor to use for testing
 */
export const registerTestEnvAdaptor = (adaptor?: IEnvironmentAdaptor) => {
  const mockSdk = {} as unknown as IAPIMethods
  registerEnvAdaptor(adaptor || new BrowserAdaptor(mockSdk))
}
