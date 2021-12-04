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
import React, { useContext, useEffect, useState } from 'react'
import { RunItProvider, runItNoSet, sdkSpecFetch } from '@looker/run-it'
import type { ExtensionContextData } from '@looker/extension-sdk-react'
import { ExtensionContext } from '@looker/extension-sdk-react'
import type { SpecItem, SpecList } from '@looker/sdk-codegen'
import { getSpecsFromVersions } from '@looker/sdk-codegen'
import { ApiExplorer, store, Loader } from '@looker/api-explorer'
import { getExtensionSDK } from '@looker/extension-sdk'
import { Provider } from 'react-redux'
import { ExtensionAdaptor } from '@looker/extension-utils'

export const ExtensionApiExplorer: FC = () => {
  const extensionContext = useContext<ExtensionContextData>(ExtensionContext)
  const [specs, setSpecs] = useState<SpecList>()

  const sdk = extensionContext.core40SDK

  useEffect(() => {
    /** Load Looker /versions information and retrieve all supported specs */
    async function loadSpecs() {
      const versions = await sdk.ok(sdk.versions())
      const result = await getSpecsFromVersions(versions, (spec: SpecItem) =>
        sdkSpecFetch(spec, (version, name) =>
          sdk.ok(sdk.api_spec(version, name))
        )
      )

      setSpecs(result)
    }

    if (sdk && !specs) loadSpecs().catch((err) => console.error(err))
  }, [specs, sdk])

  const extensionAdaptor = new ExtensionAdaptor(
    getExtensionSDK(),
    extensionContext.core40SDK
  )

  return (
    <Provider store={store}>
      <RunItProvider basePath="">
        <>
          {specs ? (
            <ApiExplorer
              specs={specs}
              adaptor={extensionAdaptor}
              setVersionsUrl={runItNoSet}
              // TODO We need expand/collapse side nav for the headless extension before we enabled this
              headless={false}
            />
          ) : (
            <Loader themeOverrides={extensionAdaptor.themeOverrides()} />
          )}
        </>
      </RunItProvider>
    </Provider>
  )
}
