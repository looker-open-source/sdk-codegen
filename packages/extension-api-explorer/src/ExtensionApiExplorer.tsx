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

import React, { FC, useContext, useEffect, useState } from 'react'
import { IStorageValue, RunItProvider, RunItConfigurator } from '@looker/run-it'
import { useRouteMatch } from 'react-router-dom'
import {
  ExtensionContext,
  ExtensionContextData,
} from '@looker/extension-sdk-react'
import {
  ApiModel,
  getSpecsFromVersions,
  SpecItem,
  SpecList,
  upgradeSpecObject,
} from '@looker/sdk-codegen'
import { Looker31SDK, Looker40SDK } from '@looker/sdk'
import ApiExplorer from '@looker/api-explorer/lib/ApiExplorer'

class ExtensionConfigurator implements RunItConfigurator {
  storage: Record<string, string> = {}
  getStorage(key: string, defaultValue = ''): IStorageValue {
    const value = this.storage[key]
    if (value) {
      return {
        location: 'session',
        value,
      }
    }
    return {
      location: 'session',
      value: defaultValue,
    }
  }

  setStorage(key: string, value: string): string {
    this.storage[key] = value
    return value
  }

  removeStorage(key: string) {
    delete this.storage[key]
  }
}

const configurator = new ExtensionConfigurator()

export const ExtensionApiExplorer: FC = () => {
  const match = useRouteMatch<{ specKey: string }>(`/:specKey`)
  const extensionContext = useContext<ExtensionContextData>(ExtensionContext)
  const [specs, setSpecs] = useState<SpecList>()

  let sdk: Looker31SDK | Looker40SDK
  if (match?.params.specKey === '3.1') {
    sdk = extensionContext.core31SDK
  } else {
    sdk = extensionContext.core40SDK
  }

  /**
   * fetch and compile an API specification to an ApiModel
   *
   * @param spec to fetch and compile
   */
  async function extFetch(spec: SpecItem) {
    if (!spec.specURL) return undefined
    const sdk = extensionContext.core40SDK
    const [version, name] = spec.specURL.split('/').slice(-2)
    const content = await sdk.ok(sdk.api_spec(version, name))
    // TODO switch this to just call const api = ApiModel.fromString(content) now
    // TODO I think we can remove this this crazy step now that the api_spec endpoint is cleaner
    let json = JSON.parse(content)
    if (typeof json === 'string') {
      json = JSON.parse(json)
    }
    json = upgradeSpecObject(json)
    const api = ApiModel.fromJson(json)
    return api
  }

  useEffect(() => {
    /** Load Looker /versions information and retrieve all supported specs */
    async function loadSpecs() {
      const versions = await sdk.ok(sdk.versions())
      const result = await getSpecsFromVersions(versions, (spec: SpecItem) =>
        extFetch(spec)
      )
      setSpecs(result)
    }

    if (sdk && !specs) loadSpecs().catch((err) => console.error(err))
  }, [specs, sdk])

  return (
    <RunItProvider sdk={sdk} configurator={configurator} basePath="">
      <>
        {specs && <ApiExplorer specs={specs} />}
        {!specs && 'Loading API specifications from Looker ...'}
      </>
    </RunItProvider>
  )
}
