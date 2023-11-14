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

import React, { useState } from 'react'
import type { ILooker40SDK } from '@looker/sdk'
import type { ExtensionHostApi } from '@looker/extension-sdk'
import { LookerExtensionSDK } from '@looker/extension-sdk'
import type {
  BaseExtensionContextData,
  ExtensionProviderProps,
} from '../ExtensionConnector'
import { ExtensionConnector } from '../ExtensionConnector'
import { registerCoreSDK, unregisterCoreSDK } from '../../sdk/core_sdk'

export interface ExtensionContextData2 extends BaseExtensionContextData {
  coreSDK: ILooker40SDK
}

/**
 * React context provider for extension API and SDK
 * @deprecated use ExtensionContext
 */
export const ExtensionContext2 = React.createContext<
  ExtensionContextData2
>(
  undefined as any // no one will ever see this undefined!
)

/**
 * ExtensionProvider component. Provides access to the extension API and SDK (use
 * ExtensionContext) and react routing services.
 * @deprecated use ExtensionProvider
 */
export function ExtensionProvider2(props: ExtensionProviderProps) {
  const { children, ...rest } = props
  const [extensionData, setExtensionData] = useState<ExtensionContextData2>(
    {} as ExtensionContextData2
  )

  const connectedCallback = (extensionHost: ExtensionHostApi) => {
    const coreSDK = LookerExtensionSDK.createClient(extensionHost)
    registerCoreSDK(coreSDK)
    const { visualizationSDK, tileSDK, lookerHostData } = extensionHost
    const { visualizationData } = visualizationSDK
    const { tileHostData } = tileSDK
    setExtensionData((previousState: any) => {
      return {
        ...previousState,
        extensionSDK: extensionHost,
        coreSDK,
        visualizationSDK,
        tileSDK,
        visualizationData,
        tileHostData,
        lookerHostData,
      }
    })
  }

  const unloadedCallback = () => {
    unregisterCoreSDK()
  }

  const updateContextData = (
    updatedContextData: Partial<BaseExtensionContextData>
  ) => {
    setExtensionData((previousState: ExtensionContextData2) => {
      return {
        ...previousState,
        ...updatedContextData,
      }
    })
  }

  return (
    <ExtensionContext2.Provider value={extensionData}>
      <ExtensionConnector
        {...rest}
        contextData={extensionData}
        connectedCallback={connectedCallback}
        updateContextData={updateContextData}
        unloadedCallback={unloadedCallback}
      >
        {children}
      </ExtensionConnector>
    </ExtensionContext2.Provider>
  )
}
