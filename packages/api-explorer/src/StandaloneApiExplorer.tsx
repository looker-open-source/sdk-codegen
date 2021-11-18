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
import React, { useEffect, useState } from 'react'
import {
  RunItProvider,
  loadSpecsFromVersions,
  RunItConfigKey,
  RunItNoConfig,
  initRunItSdk,
} from '@looker/run-it'
import type { SpecList } from '@looker/sdk-codegen'
import { Provider } from 'react-redux'
import { BrowserAdaptor } from '@looker/extension-utils'

import { ApiExplorer } from './ApiExplorer'
import { store } from './state'
import { Loader } from './components'

export interface StandaloneApiExplorerProps {
  headless?: boolean
  versionsUrl: string
}

const browserAdaptor = new BrowserAdaptor(initRunItSdk())

const loadVersions = async (current: string) => {
  const data = await browserAdaptor.localStorageGetItem(RunItConfigKey)
  const config = data ? JSON.parse(data) : RunItNoConfig
  let url = config.base_url ? `${config.base_url}/versions` : current
  let response = await loadSpecsFromVersions(url)
  if (response.fetchResult) {
    console.error(
      `Reverting to ${current} due to ${url} error: ${response.fetchResult}`
    )
    // The stored server location has an error so default to current
    url = current
    response = await loadSpecsFromVersions(url)
  }
  return { url, response }
}

export const StandaloneApiExplorer: FC<StandaloneApiExplorerProps> = ({
  headless = false,
  versionsUrl = '',
}) => {
  const [specs, setSpecs] = useState<SpecList | undefined>()
  const [currentVersionsUrl, setCurrentVersionsUrl] =
    useState<string>(versionsUrl)

  useEffect(() => {
    if (currentVersionsUrl) {
      loadVersions(currentVersionsUrl).then((result) => {
        setCurrentVersionsUrl(result.url)
        const response = result.response
        setSpecs(response.specs)
      })
    } else {
      setSpecs(undefined)
    }
  }, [versionsUrl, currentVersionsUrl])

  return (
    <Provider store={store}>
      <RunItProvider basePath="/api/4.0">
        <>
          {specs ? (
            <ApiExplorer
              specs={specs}
              adaptor={browserAdaptor}
              headless={headless}
              setVersionsUrl={setCurrentVersionsUrl}
            />
          ) : (
            <Loader themeOverrides={browserAdaptor.themeOverrides()} />
          )}
        </>
      </RunItProvider>
    </Provider>
  )
}
