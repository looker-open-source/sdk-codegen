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

import React, { FC, useEffect, useState } from 'react'
import { useRouteMatch } from 'react-router-dom'
import {
  RunItProvider,
  defaultConfigurator,
  initRunItSdk,
  loadSpecsFromVersions,
} from '@looker/run-it'
import { IAPIMethods } from '@looker/sdk-rtl'
import { SpecList } from '@looker/sdk-codegen'
import { Provider } from 'react-redux'

import ApiExplorer from './ApiExplorer'
import { configureStore } from './state'
import { StandaloneEnvAdaptor } from './utils'
import { Loader } from './components'

export interface StandaloneApiExplorerProps {
  headless?: boolean
  versionsUrl: string
}

const standaloneEnvAdaptor = new StandaloneEnvAdaptor()
const store = configureStore()

export const StandaloneApiExplorer: FC<StandaloneApiExplorerProps> = ({
  headless = false,
  versionsUrl = '',
}) => {
  const [specs, setSpecs] = useState<SpecList | undefined>()

  useEffect(() => {
    if (versionsUrl) {
      // Load specifications from the versions url
      loadSpecsFromVersions(versionsUrl).then((response) =>
        setSpecs(response.specs)
      )
    } else {
      setSpecs(undefined)
    }
  }, [versionsUrl])

  const match = useRouteMatch<{ specKey: string }>(`/:specKey`)
  const specKey = match?.params.specKey || ''
  // TODO we may not need this restriction any more?
  // Check explicitly for specs 3.0 and 3.1 as run it is not supported.
  // This is done as the return from OAUTH does not provide a spec key
  // but an SDK is needed.
  const chosenSdk: IAPIMethods | undefined =
    specKey === '3.0' || specKey === '3.1'
      ? undefined
      : initRunItSdk(defaultConfigurator)

  return (
    <Provider store={store}>
      <RunItProvider
        sdk={chosenSdk}
        configurator={defaultConfigurator}
        basePath="/api/4.0"
      >
        <>
          {specs ? (
            <ApiExplorer
              specs={specs}
              envAdaptor={standaloneEnvAdaptor}
              headless={headless}
            />
          ) : (
            <Loader themeOverrides={standaloneEnvAdaptor.themeOverrides()} />
          )}
        </>
      </RunItProvider>
    </Provider>
  )
}
