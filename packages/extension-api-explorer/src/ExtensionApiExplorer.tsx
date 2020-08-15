/*

 MIT License

 Copyright (c) 2020 Looker Data Sciences, Inc.

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

import React, { FC, useContext } from 'react'
import ApiExplorer, {
  SpecItems,
  RuntimeEnvironment,
} from '@looker/api-explorer/src/ApiExplorer'
import { IStorageValue } from '@looker/run-it'
import { useRouteMatch } from 'react-router-dom'
import {
  ExtensionContext,
  ExtensionContextData,
} from '@looker/extension-sdk-react'
import { RunItCallback, pathify } from '@looker/run-it'
import { IRawResponse } from '@looker/sdk/lib/browser'

const specs: SpecItems = {
  '3.0': {
    status: 'stable',
    specURL: 'https://self-signed.looker.com:19999/api/3.0/swagger.json',
    specContent: require('../../api-explorer/specs/Looker.3.0.oas.json'),
  },
  '3.1': {
    status: 'current',
    isDefault: true,
    specURL: 'https://self-signed.looker.com:19999/api/3.1/swagger.json',
    specContent: require('../../api-explorer/specs/Looker.3.1.oas.json'),
  },
  '4.0': {
    status: 'experimental',
    specURL: 'https://self-signed.looker.com:19999/api/4.0/swagger.json',
    specContent: require('../../api-explorer/specs/Looker.4.0.oas.json'),
  },
}

// TODO move into its own file
class ExtensionRuntimeEnvironment implements RuntimeEnvironment {
  storage: Record<string, string> = {}
  getStorage(key: string, defaultValue = ''): IStorageValue {
    let value = this.storage[key]
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

export const ExtensionApiExplorer: FC = () => {
  const match = useRouteMatch<{ specKey: string }>(`/:specKey`)
  const { core40SDK } = useContext<ExtensionContextData>(ExtensionContext)
  let runItCallback: RunItCallback | undefined

  if (match && match.params.specKey) {
    // TODO runitCallback can probably be eliminated because SDK is being passed down.
    // TODO need to pass down correct SDK based upon the spec
    runItCallback = async (
      _specKey,
      httpMethod,
      path,
      pathParams,
      queryParams,
      body
    ): Promise<IRawResponse> => {
      const url = pathify(path, pathParams)
      const resp = await core40SDK.authSession.transport.rawRequest(
        httpMethod,
        url,
        queryParams,
        body
      )
      return resp
    }
  }

  return (
    <ApiExplorer
      specs={specs}
      runItCallback={runItCallback}
      runtimeEnvironment={new ExtensionRuntimeEnvironment()}
      sdk={core40SDK}
    />
  )
}
