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
import type { ExtensionHostApi } from '@looker/extension-sdk'
import type {
  BaseExtensionContextData,
  ExtensionProviderProps,
} from '../ExtensionConnector'
import { ExtensionConnector } from '../ExtensionConnector'

/**
 * React context provider for extension API and SDK
 */
export const ExtensionContextBase =
  React.createContext<BaseExtensionContextData>(
    undefined as any // no one will ever see this undefined!
  )

/**
 * ExtensionProviderBase component. Provides access to the extension API but no SDK is
 * provided.
 */
export const ExtensionProviderBase: React.FC<ExtensionProviderProps> = ({
  children,
  ...props
}) => {
  const [extensionData, setExtensionData] = useState<BaseExtensionContextData>(
    {} as BaseExtensionContextData
  )

  const connectedCallback = (extensionHost: ExtensionHostApi) => {
    const { visualizationSDK, tileSDK, lookerHostData } = extensionHost
    const { visualizationData } = visualizationSDK
    const { tileHostData } = tileSDK
    setExtensionData((previousState: BaseExtensionContextData) => {
      return {
        ...previousState,
        extensionSDK: extensionHost,
        visualizationSDK,
        tileSDK,
        visualizationData,
        tileHostData,
        lookerHostData,
      }
    })
  }

  const unloadedCallback = () => {
    // noop
  }

  const updateContextData = (
    contextData: Partial<BaseExtensionContextData>
  ) => {
    setExtensionData((previousContextData) => ({
      ...previousContextData,
      ...contextData,
    }))
  }

  return (
    <ExtensionContextBase.Provider value={extensionData}>
      <ExtensionConnector
        {...props}
        contextData={extensionData}
        connectedCallback={connectedCallback}
        updateContextData={updateContextData}
        unloadedCallback={unloadedCallback}
      >
        {children}
      </ExtensionConnector>
    </ExtensionContextBase.Provider>
  )
}
