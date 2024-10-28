/*

 MIT License

 Copyright (c) 2022 Looker Data Sciences, Inc.

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
import { LookerExtensionSDK } from '@looker/extension-sdk';
import type { ILooker40SDK, Looker40SDK } from '@looker/sdk';
import type {
  BaseExtensionContextData,
  ExtensionProviderProps,
} from '../ExtensionConnector';
import { ExtensionConnector } from '../ExtensionConnector';
import { registerCore40SDK, unregisterCore40SDK } from '../../sdk/core_sdk_40';

/**
 * Extension context data
 */
export interface ExtensionContextData40 extends BaseExtensionContextData {
  coreSDK: ILooker40SDK;
}

/**
 * React context provider for extension API and Looker SDK 4.0.
 */
export const ExtensionContext40 = React.createContext<ExtensionContextData40>(
  undefined as any // no one will ever see this undefined!
);

export interface ExtensionProvider40Props extends ExtensionProviderProps {}

/**
 * ExtensionProvider40 component. Provides access to the extension API and SDK (use
 * ExtensionContext40) and react routing services.
 */
export function ExtensionProvider40(props: ExtensionProvider40Props) {
  const { children, ...rest } = props;
  const [extensionData, setExtensionData] = useState<ExtensionContextData40>(
    {} as ExtensionContextData40
  );

  const connectedCallback = (extensionHost: ExtensionHostApi) => {
    const coreSDK: ILooker40SDK =
      LookerExtensionSDK.createClient(extensionHost);
    registerCore40SDK(coreSDK as Looker40SDK);
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
    unregisterCore40SDK();
  };

  const updateContextData = (
    updatedContextData: Partial<BaseExtensionContextData>
  ) => {
    setExtensionData((previousState: ExtensionContextData40) => {
      return {
        ...previousState,
        ...updatedContextData,
      };
    });
  };

  return (
    <ExtensionContext40.Provider value={extensionData}>
      <ExtensionConnector
        {...rest}
        contextData={extensionData}
        connectedCallback={connectedCallback}
        updateContextData={updateContextData}
        unloadedCallback={unloadedCallback}
      >
        {children}
      </ExtensionConnector>
    </ExtensionContext40.Provider>
  );
}
