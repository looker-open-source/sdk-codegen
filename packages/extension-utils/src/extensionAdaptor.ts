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

import type { ExtensionSDK } from '@looker/extension-sdk';
import type { IAPIMethods } from '@looker/sdk-rtl';
import type {
  IEnvironmentAdaptor,
  ThemeOverrides,
  IAuthAdaptor,
} from './adaptorUtils';
import { getThemeOverrides } from './adaptorUtils';

export class ExtensionAuthAdaptor implements IAuthAdaptor {
  constructor(public readonly sdk: IAPIMethods) {}

  async login() {
    // Noop for extensions. Authentication is not required in an extension context
    return true;
  }
}

/**
 * An adaptor class for interacting with browser APIs when running as an extension
 */
export class ExtensionAdaptor
  extends ExtensionAuthAdaptor
  implements IEnvironmentAdaptor
{
  _themeOverrides: ThemeOverrides;

  constructor(
    public extensionSdk: ExtensionSDK,
    sdk: IAPIMethods
  ) {
    super(sdk);
    this._themeOverrides = getThemeOverrides(
      (this.extensionSdk.lookerHostData || { hostType: 'standard' })
        .hostType === 'standard'
    );
  }

  async copyToClipboard(location?: { pathname: string; search: string }) {
    const { lookerHostData } = this.extensionSdk;
    if (lookerHostData && location) {
      const { hostOrigin, extensionId } = lookerHostData;
      const { pathname, search } = location;
      const url = `${hostOrigin}/extensions/${extensionId}${pathname}${search}`;
      await this.extensionSdk.clipboardWrite(url);
    }
  }

  isExtension() {
    return true;
  }

  async localStorageGetItem(key: string) {
    return await this.extensionSdk.localStorageGetItem(key);
  }

  async localStorageSetItem(key: string, value: string) {
    await this.extensionSdk.localStorageSetItem(key, value);
  }

  async localStorageRemoveItem(key: string) {
    await this.extensionSdk.localStorageRemoveItem(key);
  }

  themeOverrides(): ThemeOverrides {
    return this._themeOverrides;
  }

  openBrowserWindow(url: string, target?: string) {
    this.extensionSdk.openBrowserWindow(url, target);
  }

  logError(error: Error, componentStack: string): void {
    this.extensionSdk.error({
      error: error,
      message: componentStack,
    } as ErrorEvent);
  }
}
