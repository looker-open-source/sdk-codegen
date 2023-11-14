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

import type { FC } from 'react'
import React, { useContext } from 'react'
import { RunItProvider } from '@looker/run-it'
import type { ExtensionContextData } from '@looker/extension-sdk-react'
import { ExtensionContext } from '@looker/extension-sdk-react'
import type { IApixAdaptor } from '@looker/api-explorer'
import { ApiExplorer, store, sdkSpecFetch } from '@looker/api-explorer'
import { getExtensionSDK } from '@looker/extension-sdk'
import { Provider } from 'react-redux'
import { ExtensionAdaptor } from '@looker/extension-utils'
import type { SpecItem } from '@looker/sdk-codegen'
import { getSpecsFromVersions } from '@looker/sdk-codegen'
import cloneDeep from 'lodash/cloneDeep'
import type { ILooker40SDK } from '@looker/sdk'

class ApixExtensionAdaptor extends ExtensionAdaptor implements IApixAdaptor {
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

export const ExtensionApiExplorer: FC = () => {
  const extensionContext = useContext<ExtensionContextData>(ExtensionContext)

  const extensionAdaptor = new ApixExtensionAdaptor(
    getExtensionSDK(),
    extensionContext.coreSDK
  )

  return (
    <Provider store={store}>
      <RunItProvider basePath="">
        <ApiExplorer adaptor={extensionAdaptor} headless={true} />
      </RunItProvider>
    </Provider>
  )
}
