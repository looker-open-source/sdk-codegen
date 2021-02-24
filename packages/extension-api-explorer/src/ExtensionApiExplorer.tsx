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
import ApiExplorer, { SpecItems } from '@looker/api-explorer/src/ApiExplorer'
import { IStorageValue, RunItProvider, RunItConfigurator } from '@looker/run-it'
import { useRouteMatch } from 'react-router-dom'
import {
  ExtensionContext,
  ExtensionContextData,
} from '@looker/extension-sdk-react'
import { getSpecsFromVersions } from '@looker/api-explorer/src/reducers/spec/utils'

// const specs: SpecItems = {
//   '3.0': {
//     status: 'stable',
//     specURL: 'https://self-signed.looker.com:19999/api/3.0/swagger.json',
//     specContent: require('../../../spec/Looker.3.0.oas.json'),
//   },
//   '3.1': {
//     status: 'current',
//     isDefault: true,
//     specURL: 'https://self-signed.looker.com:19999/api/3.1/swagger.json',
//     specContent: require('../../../spec/Looker.3.1.oas.json'),
//   },
//   '4.0': {
//     status: 'experimental',
//     specURL: 'https://self-signed.looker.com:19999/api/4.0/swagger.json',
//     specContent: require('../../../spec/Looker.4.0.oas.json'),
//   },
// }

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
  const [specs, setSpecs] = useState<SpecItems>()

  let sdk: any
  if (match?.params.specKey === '3.1') {
    sdk = extensionContext.core31SDK
  } else {
    sdk = extensionContext.core40SDK
  }

  useEffect(() => {
    async function getSpecs() {
      const versions = await sdk.ok(sdk.versions())
      return getSpecsFromVersions(versions)
    }

    getSpecs()
      .then((resp) => setSpecs(resp))
      .catch((err) => console.error(err))
  }, [sdk])

  // if (!specs)
  //   return (
  //     <>
  //       <Loading
  //         key="specLoader"
  //         message="Loading specifications"
  //         loading={true}
  //       />{' '}
  //     </>
  //   )

  return (
    <RunItProvider sdk={sdk} configurator={configurator} basePath="">
      <>
        {specs && <ApiExplorer specs={specs} />}
        {!specs && 'Loading API specifications from Looker ...'}
      </>
    </RunItProvider>
  )
}
