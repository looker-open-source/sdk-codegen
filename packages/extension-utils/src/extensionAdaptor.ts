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

import type { ExtensionSDK } from '@looker/extension-sdk'
import type { IAPIMethods } from '@looker/sdk-rtl'
import type { SpecItem } from '@looker/sdk-codegen'
import { getSpecsFromVersions } from '@looker/sdk-codegen'
import cloneDeep from 'lodash/cloneDeep'
import type { ILooker40SDK } from '@looker/sdk'
import { sdkSpecFetch } from '@looker/api-explorer'
import type {
  IEnvironmentAdaptor,
  ThemeOverrides,
  IAuthAdaptor,
} from './adaptorUtils'
import { getThemeOverrides } from './adaptorUtils'

export class ExtensionAuthAdaptor implements IAuthAdaptor {
  constructor(public readonly sdk: IAPIMethods) {}

  async login() {
    // Noop for extensions. Authentication is not required in an extension context
    return true
  }
}

/**
 * An adaptor class for interacting with browser APIs when running as an extension
 */
export class ExtensionAdaptor
  extends ExtensionAuthAdaptor
  implements IEnvironmentAdaptor
{
  _themeOverrides: ThemeOverrides
  _route: string | undefined

  constructor(public extensionSdk: ExtensionSDK, sdk: IAPIMethods) {
    super(sdk)
    this._themeOverrides = getThemeOverrides(
      (this.extensionSdk.lookerHostData || { hostType: 'standard' })
        .hostType === 'standard'
    )
  }

  updateRoute(route: string) {
    this._route = route
  }

  async copyToClipboard() {
    const { lookerHostData } = this.extensionSdk
    if (lookerHostData) {
      const { extensionId, hostOrigin } = lookerHostData
      if (hostOrigin && this._route) {
        const url = `${hostOrigin}/extensions/${extensionId}${this._route}`
        await this.extensionSdk.clipboardWrite(url)
      }
    }
  }

  isExtension() {
    return true
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

  openBrowserWindow(url: string, target?: string) {
    this.extensionSdk.openBrowserWindow(url, target)
  }

  logError(error: Error, componentStack: string): void {
    this.extensionSdk.error({
      error: error,
      message: componentStack,
    } as ErrorEvent)
  }

  async fetchSpecList() {
    const sdk = this.sdk as ILooker40SDK
    const versions = await sdk.ok(sdk.versions())
    const result = await getSpecsFromVersions(versions)
    return result
  }

  async fetchSpec(spec: SpecItem): Promise<SpecItem> {
    const sdk = this.sdk as ILooker40SDK
    const _spec = cloneDeep(spec)
    _spec.api = await sdkSpecFetch(spec, (version, name) =>
      sdk.ok(sdk.api_spec(version, name))
    )
    return _spec
  }
}
