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
import React from 'react';
import { render, screen } from '@testing-library/react';
import type {
  ExtensionHostConfiguration,
  ExtensionHostApi,
  TileSDK,
  TileHostDataChangedCallback,
  VisualizationDataReceivedCallback,
  VisualizationSDK,
} from '@looker/extension-sdk';
import { DashboardRunState } from '@looker/extension-sdk';
import { useLocation } from 'react-router-dom';
import { unregisterCore40SDK } from '../../sdk/core_sdk_40';
import type { BaseExtensionContextData } from '.';
import { ExtensionConnector } from '.';

let mockFailConnection = false;
const mockHost: any = {
  clientRouteChanged: () => {
    // noop
  },
};

type ConnectExtensionHostFunc = (
  configuration: ExtensionHostConfiguration
) => Promise<ExtensionHostApi>;

let tileHostDataChangedCb: TileHostDataChangedCallback | undefined;
let visualizationDataReceivedCb: VisualizationDataReceivedCallback | undefined;

jest.mock('@looker/extension-sdk', () => {
  const connectExtensionHost: ConnectExtensionHostFunc = ({
    visualizationDataReceivedCallback,
    tileHostDataChangedCallback,
  }) => {
    tileHostDataChangedCb = tileHostDataChangedCallback;
    visualizationDataReceivedCb = visualizationDataReceivedCallback;
    return mockFailConnection
      ? Promise.reject(new Error('Extension failed to load'))
      : Promise.resolve(mockHost);
  };
  const actual = jest.requireActual('@looker/extension-sdk');
  return {
    ...actual,
    connectExtensionHost,
    LookerExtensionSDK: {
      create40Client: () => ({}),
    },
  };
});

const MockExtension = () => {
  let location;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    location = useLocation();
  } catch (err) {
    location = undefined;
  }
  return (
    <>
      <div>Mock Extension</div>
      <div>{location ? location.pathname : 'No Router'}</div>
    </>
  );
};

describe('ExtensionConnector component', () => {
  const tileSDK: TileSDK = {} as TileSDK;
  const visualizationSDK: VisualizationSDK = {} as VisualizationSDK;
  const getContextData = () => {
    return {
      tileSDK,
      extensionSDK: mockHost,
    } as BaseExtensionContextData;
  };
  let connectedCallback: jest.Mock;
  let unloadedCallback: jest.Mock;
  let updateContextData: jest.Mock;

  beforeEach(() => {
    connectedCallback = jest.fn();
    unloadedCallback = jest.fn();
    updateContextData = jest.fn();
    tileSDK.tileHostDataChanged = jest.fn();
    visualizationSDK.updateVisData = jest.fn();
    jest.spyOn(console, 'error').mockImplementation();
    mockFailConnection = false;
    unregisterCore40SDK();
  });

  it('renders loading component and then extension', async () => {
    render(
      <ExtensionConnector
        loadingComponent={<span id="loading">Loading</span>}
        contextData={getContextData()}
        updateContextData={updateContextData}
        connectedCallback={connectedCallback}
        unloadedCallback={unloadedCallback}
      >
        <MockExtension />
      </ExtensionConnector>
    );
    expect(screen.queryByText('Loading')).toBeInTheDocument();
    expect(await screen.findByText('Mock Extension')).toBeInTheDocument();
    expect(await screen.findByText('/')).toBeInTheDocument();
    expect(connectedCallback).toHaveBeenCalled();
  });

  it('does not render loading component before rendering extension', async () => {
    render(
      <ExtensionConnector
        contextData={getContextData()}
        updateContextData={updateContextData}
        connectedCallback={connectedCallback}
        unloadedCallback={unloadedCallback}
      >
        <MockExtension />
      </ExtensionConnector>
    );
    expect(screen.queryByText('Loading')).not.toBeInTheDocument();
    expect(await screen.findByText('Mock Extension')).toBeInTheDocument();
    expect(await screen.findByText('/')).toBeInTheDocument();
    expect(connectedCallback).toHaveBeenCalled();
  });

  it('does not render router', async () => {
    render(
      <ExtensionConnector
        hostTracksRoute={false}
        contextData={getContextData()}
        updateContextData={updateContextData}
        connectedCallback={connectedCallback}
        unloadedCallback={unloadedCallback}
      >
        <MockExtension />
      </ExtensionConnector>
    );
    expect(await screen.findByText('Mock Extension')).toBeInTheDocument();
    expect(await screen.findByText('No Router')).toBeInTheDocument();
    expect(connectedCallback).toHaveBeenCalled();
  });

  it('renders initialization  error', async () => {
    mockFailConnection = true;
    render(
      <ExtensionConnector
        contextData={getContextData()}
        updateContextData={updateContextData}
        connectedCallback={connectedCallback}
        unloadedCallback={unloadedCallback}
      >
        <MockExtension />
      </ExtensionConnector>
    );
    expect(screen.queryByText('Mock Extension')).not.toBeInTheDocument();
    expect(
      await screen.findByText('Extension failed to load')
    ).toBeInTheDocument();
  });

  it('updates tile host data context data', async () => {
    render(
      <ExtensionConnector
        contextData={getContextData()}
        updateContextData={updateContextData}
        connectedCallback={connectedCallback}
        unloadedCallback={unloadedCallback}
      >
        <MockExtension />
      </ExtensionConnector>
    );
    expect(await screen.findByText('Mock Extension')).toBeInTheDocument();
    expect(connectedCallback).toHaveBeenCalled();
    tileHostDataChangedCb!({
      isDashboardEditing: false,
      dashboardRunState: DashboardRunState.NOT_RUNNING,
      dashboardFilters: {},
      isDashboardCrossFilteringEnabled: false,
    });
    expect(tileSDK.tileHostDataChanged).toHaveBeenCalledWith({
      dashboardFilters: {},
      isDashboardCrossFilteringEnabled: false,
      dashboardRunState: 'NOT_RUNNING',
      isDashboardEditing: false,
    });
  });

  it('updates visualization context data', async () => {
    render(
      <ExtensionConnector
        contextData={getContextData()}
        updateContextData={updateContextData}
        connectedCallback={connectedCallback}
        unloadedCallback={unloadedCallback}
      >
        <MockExtension />
      </ExtensionConnector>
    );
    expect(await screen.findByText('Mock Extension')).toBeInTheDocument();
    expect(connectedCallback).toHaveBeenCalled();
    visualizationDataReceivedCb!({
      visConfig: {},
      queryResponse: { data: [], fields: {}, pivots: [] },
    });
    // expect(updateContextData).toHaveBeenNthCalledWith(1, {
    //   tileHostData: undefined,
    // })
    expect(updateContextData).toHaveBeenNthCalledWith(1, {
      visualizationData: {
        visConfig: {},
        queryResponse: { data: [], fields: {}, pivots: [] },
      },
    });
  });
});
