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

import React, { useState } from 'react';
import type { ExtensionHostApi } from '@looker/extension-sdk';
import { SdkConnection } from '@looker/extension-sdk';
import { LookerExtensionSDK } from '@looker/sdk';
import type {
  BaseExtensionContextData,
  ExtensionProviderProps,
} from '../ExtensionConnector';
import { ExtensionConnector } from '../ExtensionConnector';
import { registerCoreSDK2, unregisterCoreSDK2 } from '../../sdk/core_sdk2';

export interface ExtensionContextData2<T> extends BaseExtensionContextData {
  coreSDK: T;
}

/**
 * React context provider for extension API and SDK
 */
export const ExtensionContext2 = React.createContext<
  ExtensionContextData2<any>
>(
  undefined as any // no one will ever see this undefined!
);

export interface ExtensionProvider2Props<T> extends ExtensionProviderProps {
  type: T;
}

/**
 * ExtensionProvider component. Provides access to the extension API and SDK (use
 * ExtensionContext) and react routing services.
 */
export function ExtensionProvider2<T>(props: ExtensionProvider2Props<T>) {
  const { children, type, ...rest } = props;
  const [extensionData, setExtensionData] = useState<ExtensionContextData2<T>>(
    {} as ExtensionContextData2<T>
  );
  const apiVersion = (type as any).ApiVersion;

  const connectedCallback = (extensionHost: ExtensionHostApi) => {
    let coreSDK: any;
    if (apiVersion) {
      coreSDK = LookerExtensionSDK.createClient(
        new SdkConnection(extensionHost, apiVersion),
        type as any
      );
    }
    registerCoreSDK2(coreSDK);
    const { visualizationSDK, tileSDK, lookerHostData } = extensionHost;
    const { visualizationData } = visualizationSDK;
    const { tileHostData } = tileSDK;
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
      };
    });
  };

  const unloadedCallback = () => {
    unregisterCoreSDK2();
  };

  const updateContextData = (
    updatedContextData: Partial<BaseExtensionContextData>
  ) => {
    setExtensionData((previousState: ExtensionContextData2<T>) => {
      return {
        ...previousState,
        ...updatedContextData,
      };
    });
  };

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
  );
}
