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
import { LookerExtensionSDK } from '@looker/extension-sdk';
import type { Looker40SDK } from '@looker/sdk';
import type {
  BaseExtensionContextData,
  ExtensionProviderProps,
} from '../ExtensionConnector';
import { ExtensionConnector } from '../ExtensionConnector';
import { registerCore40SDK, unregisterCore40SDK } from '../../sdk/core_sdk_40';
import type { ExtensionContextData } from './types';

/**
 * React context provider for extension API and SDK
 */
export const ExtensionContext = React.createContext<ExtensionContextData>(
  undefined as any // no one will ever see this undefined!
);

/**
 * ExtensionProvider component. Provides access to the extension API and SDK (use
 * ExtensionContext) and react routing services.
 * @deprecated use ExtensionProvider40
 */
export const ExtensionProvider: React.FC<ExtensionProviderProps> = ({
  children,
  ...props
}) => {
  const [extensionData, setExtensionData] = useState<ExtensionContextData>(
    {} as ExtensionContextData
  );
  const connectedCallback = (extensionHost: ExtensionHostApi) => {
    const core40SDK: Looker40SDK =
      LookerExtensionSDK.create40Client(extensionHost);
    // Provide global access for use by redux if needed
    registerCore40SDK(core40SDK);
    const { visualizationSDK, tileSDK, lookerHostData } = extensionHost;
    const { visualizationData } = visualizationSDK;
    const { tileHostData } = tileSDK;
    setExtensionData((previousState: ExtensionContextData) => {
      return {
        ...previousState,
        extensionSDK: extensionHost,
        coreSDK: core40SDK,
        core40SDK,
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
    setExtensionData((previousState: ExtensionContextData) => {
      return {
        ...previousState,
        ...updatedContextData,
      };
    });
  };

  return (
    <ExtensionContext.Provider value={extensionData}>
      <ExtensionConnector
        {...props}
        contextData={extensionData}
        connectedCallback={connectedCallback}
        updateContextData={updateContextData}
        unloadedCallback={unloadedCallback}
      >
        {children}
      </ExtensionConnector>
    </ExtensionContext.Provider>
  );
};
