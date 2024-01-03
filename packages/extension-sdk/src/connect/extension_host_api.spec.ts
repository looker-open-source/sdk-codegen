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

import type { ChattyHostConnection } from '@looker/chatty';
import type { RawVisQueryResponse } from './visualization/types';
import {
  EXTENSION_SDK_VERSION,
  ExtensionHostApiImpl,
} from './extension_host_api';
import { ApiVersion, ExtensionNotificationType, MountPoint } from './types';
import type { ExtensionInitializeMessage } from './types';

describe('extension_host_api tests', () => {
  let chattyHost: ChattyHostConnection;
  let sendAndReceiveSpy: jest.SpyInstance;
  let sendSpy: jest.SpyInstance;

  let originalConsoleError: any;

  beforeEach(() => {
    // Silence console error messages
    originalConsoleError = console.error;
    console.error = jest.fn();
    chattyHost = {
      send: (_eventName: string, ..._payload: any[]) => {
        // noop
      },
      sendAndReceive: async (_eventName: string, ..._payload: any[]) =>
        new Promise(resolve => {
          setTimeout(() => {
            resolve(['ss']);
          });
        }),
    } as ChattyHostConnection;
    sendAndReceiveSpy = jest.spyOn(chattyHost, 'sendAndReceive');
    sendSpy = jest.spyOn(chattyHost, 'send');
  });

  afterEach(() => {
    sendAndReceiveSpy.mockReset();
    sendSpy.mockReset();
    console.error = originalConsoleError;
  });

  const createHostApi = (initMessage = {}, lookerVersion = '6.25.0') => {
    const initializedCallback = jest.fn();
    const hostApi = new ExtensionHostApiImpl({
      chattyHost,
      initializedCallback,
    });
    const resp = hostApi.handleNotification({
      type: ExtensionNotificationType.INITIALIZE,
      payload: {
        extensionDashboardTileEnabled: false,
        lookerVersion,
        extensionId: 'ks::ks',
        route: '/sandbox',
        hostUrl: 'https://self-signed.looker.com:9999',
        mountPoint: MountPoint.standalone,
        ...initMessage,
      },
    });

    expect(resp?.extensionSdkVersion).toEqual(EXTENSION_SDK_VERSION);

    return hostApi;
  };

  it('handles empty initialize notification', () => {
    const initializedCallback = jest.fn();
    const api = new ExtensionHostApiImpl({
      chattyHost,
      initializedCallback,
    });
    const response = api.handleNotification({
      type: ExtensionNotificationType.INITIALIZE,
    } as ExtensionInitializeMessage);
    expect(response?.errorMessage).toBeUndefined();
    expect(api.lookerHostData).toEqual({ mountPoint: 'standalone' });
  });

  it('handles initialize notification with data', () => {
    const setInitialRoute = jest.fn();
    const initializedCallback = jest.fn();
    const lookerHostData = {
      extensionDashboardTileEnabled: false,
      extensionId: 'a::b',
      route: '/sandbox',
      routeState: { hello: 'world' },
      lookerVersion: '6.25.00004168',
      hostUrl: 'https://self-signed.looker.com:9999',
      mountPoint: MountPoint.standalone,
    };
    const api = new ExtensionHostApiImpl({
      chattyHost,
      initializedCallback,
      setInitialRoute,
      requiredLookerVersion: '>=6.24.0',
    });
    const resp = api.handleNotification({
      type: ExtensionNotificationType.INITIALIZE,
      payload: lookerHostData,
    });
    expect(resp?.errorMessage).toBeUndefined();
    expect(setInitialRoute).toHaveBeenCalledWith(
      lookerHostData.route,
      lookerHostData.routeState
    );
    expect(api.lookerHostData).toEqual(lookerHostData);
  });

  it('handles route change notification', () => {
    const setInitialRoute = jest.fn();
    const initializedCallback = jest.fn();
    const hostChangedRoute = jest.fn();
    const lookerHostData = {
      extensionDashboardTileEnabled: false,
      extensionId: 'a::b',
      route: '/sandbox',
      routeState: { hello: 'world' },
      lookerVersion: '7.6.0',
      hostUrl: 'https://self-signed.looker.com:9999',
      mountPoint: MountPoint.standalone,
    };
    const api = new ExtensionHostApiImpl({
      chattyHost,
      initializedCallback,
      setInitialRoute,
      hostChangedRoute,
      requiredLookerVersion: '>=7.6.0',
    });
    api.handleNotification({
      type: ExtensionNotificationType.INITIALIZE,
      payload: lookerHostData,
    });
    api.handleNotification({
      type: ExtensionNotificationType.ROUTE_CHANGED,
      payload: {
        route: '/sandbox',
        routeState: { hello: 'world' },
      },
    });
    expect(hostChangedRoute).toHaveBeenCalledWith('/sandbox', {
      hello: 'world',
    });
  });

  it('handles visualization data notification', () => {
    const setInitialRoute = jest.fn();
    const initializedCallback = jest.fn();
    const hostChangedRoute = jest.fn();
    const visualizationDataReceivedCallback = jest.fn();
    const lookerHostData = {
      extensionDashboardTileEnabled: true,
      extensionId: 'a::b',
      route: '/sandbox',
      routeState: { hello: 'world' },
      lookerVersion: '22.8.0',
      hostUrl: 'https://self-signed.looker.com:9999',
      mountPoint: MountPoint.dashboardVisualization,
    };
    const api = new ExtensionHostApiImpl({
      chattyHost,
      initializedCallback,
      setInitialRoute,
      hostChangedRoute,
      visualizationDataReceivedCallback,
      requiredLookerVersion: '>=22.8.0',
    });
    api.handleNotification({
      type: ExtensionNotificationType.INITIALIZE,
      payload: lookerHostData,
    });
    api.handleNotification({
      type: ExtensionNotificationType.VISUALIZATION_DATA,
      payload: { visConfig: {}, queryResponse: {} as RawVisQueryResponse },
    });
    expect(api.visualizationSDK).toBeDefined();
    expect(visualizationDataReceivedCallback).toHaveBeenCalledWith({
      visConfig: {},
      queryResponse: {},
    });
  });

  it('handles tile host data notification', () => {
    const setInitialRoute = jest.fn();
    const initializedCallback = jest.fn();
    const hostChangedRoute = jest.fn();
    const tileHostDataChangedCallback = jest.fn();
    const lookerHostData = {
      extensionDashboardTileEnabled: true,
      extensionId: 'a::b',
      route: '/sandbox',
      routeState: { hello: 'world' },
      lookerVersion: '22.8.0',
      hostUrl: 'https://self-signed.looker.com:9999',
      mountPoint: MountPoint.dashboardVisualization,
    };
    const api = new ExtensionHostApiImpl({
      chattyHost,
      initializedCallback,
      setInitialRoute,
      hostChangedRoute,
      tileHostDataChangedCallback,
      requiredLookerVersion: '>=22.8.0',
    });
    api.handleNotification({
      type: ExtensionNotificationType.INITIALIZE,
      payload: lookerHostData,
    });
    api.handleNotification({
      type: ExtensionNotificationType.TILE_HOST_DATA,
      payload: {
        isDashboardEditing: true,
        isDashboardCrossFilteringEnabled: true,
      },
    });
    expect(api.tileSDK).toBeDefined();
    expect(tileHostDataChangedCallback).toHaveBeenCalledWith({
      isDashboardEditing: true,
      isDashboardCrossFilteringEnabled: true,
    });
  });

  it('provides error when looker version not high enough', () => {
    const initializedCallback = jest.fn();
    const lookerHostData = {
      route: '/sandbox',
      lookerVersion: '6.25.0',
      hostUrl: 'https://self-signed.looker.com:9999',
    };
    const api = new ExtensionHostApiImpl({
      chattyHost,
      initializedCallback,
      requiredLookerVersion: '>=7.0.0',
    });
    const resp = api.handleNotification({
      type: ExtensionNotificationType.INITIALIZE,
      payload: lookerHostData,
    } as ExtensionInitializeMessage);
    expect(resp?.errorMessage).toEqual(
      'Extension requires Looker version >=7.0.0, got 6.25.0'
    );
  });

  it('handles invalid initialize notification', () => {
    const initializedCallback = jest.fn();
    try {
      new ExtensionHostApiImpl({
        chattyHost,
        initializedCallback,
      }).handleNotification({
        type: 'XXX',
      } as any);
      throw new Error('Unexpected success');
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('verifies host connection', async () => {
    const hostApi = createHostApi();
    await hostApi.verifyHostConnection();
    expect(sendAndReceiveSpy).toHaveBeenCalledWith('EXTENSION_API_REQUEST', {
      payload: undefined,
      type: 'VERIFY_HOST',
    });
  });

  it('invoke core sdk', async () => {
    const hostApi = createHostApi();
    await hostApi.invokeCoreSdk(
      'POST',
      '/looker/all_connections',
      { params: true },
      { body: true },
      undefined,
      { options: true }
    );
    expect(sendAndReceiveSpy).toHaveBeenCalledWith('EXTENSION_API_REQUEST', {
      payload: {
        httpMethod: 'POST',
        path: '/looker/all_connections',
        body: { body: true },
        params: { params: true },
        options: { options: true },
      },
      type: 'INVOKE_CORE_SDK',
    });
  });

  it('invoke raw core sdk', async () => {
    const hostApi = createHostApi();
    await hostApi.invokeCoreSdkRaw(
      'POST',
      '/looker/all_connections',
      { params: true },
      { body: true },
      ApiVersion.sdk40
    );
    expect(sendAndReceiveSpy).toHaveBeenCalledWith('EXTENSION_API_REQUEST', {
      payload: {
        httpMethod: 'POST',
        path: '/looker/all_connections',
        body: { body: true },
        params: { params: true },
        apiVersion: ApiVersion.sdk40,
      },
      type: 'RAW_INVOKE_CORE_SDK',
    });
  });

  it('updates title', () => {
    const hostApi = createHostApi();
    hostApi.updateTitle('NEW TITLE');
    expect(sendSpy).toHaveBeenCalledWith('EXTENSION_API_REQUEST', {
      payload: {
        title: 'NEW TITLE',
      },
      type: 'UPDATE_TITLE',
    });
  });

  it('updates location', () => {
    const hostApi = createHostApi();
    hostApi.updateLocation('/marketplace', { state: true }, '_blank');
    expect(sendSpy).toHaveBeenCalledWith('EXTENSION_API_REQUEST', {
      payload: {
        url: '/marketplace',
        state: { state: true },
        target: '_blank',
      },
      type: 'UPDATE_LOCATION',
    });
  });

  it('opens window', () => {
    const hostApi = createHostApi();
    hostApi.openBrowserWindow('/marketplace');
    expect(sendSpy).toHaveBeenCalledWith('EXTENSION_API_REQUEST', {
      payload: {
        url: '/marketplace',
        state: undefined,
        target: '_blank',
      },
      type: 'UPDATE_LOCATION',
    });
    hostApi.openBrowserWindow('/marketplace', 'target');
    expect(sendSpy).toHaveBeenCalledWith('EXTENSION_API_REQUEST', {
      payload: {
        url: '/marketplace',
        state: undefined,
        target: 'target',
      },
      type: 'UPDATE_LOCATION',
    });
  });

  it('logs out', () => {
    const hostApi = createHostApi();
    hostApi.spartanLogout();
    expect(sendSpy).toHaveBeenCalledWith('EXTENSION_API_REQUEST', {
      type: 'SPARTAN_LOGOUT',
    });
  });

  it('notifies route change', () => {
    const hostApi = createHostApi();
    hostApi.clientRouteChanged('/sandbox', { hello: 'world' });
    expect(sendSpy).toHaveBeenCalledWith('EXTENSION_API_REQUEST', {
      payload: {
        route: '/sandbox',
        routeState: { hello: 'world' },
      },
      type: 'ROUTE_CHANGED',
    });
  });

  it('closes host popovers', () => {
    const hostApi = createHostApi();
    hostApi.closeHostPopovers();
    expect(sendSpy).toHaveBeenCalledWith('EXTENSION_API_REQUEST', {
      type: 'CLOSE_HOST_POPOVERS',
    });
  });

  it('sets local storage', async () => {
    const hostApi = createHostApi();
    await hostApi.localStorageSetItem('keyName', 'valueData');
    expect(sendAndReceiveSpy).toHaveBeenCalledWith('EXTENSION_API_REQUEST', {
      payload: { type: 'set', name: 'keyName', value: 'valueData' },
      type: 'LOCAL_STORAGE',
    });
  });

  it('gets local storage', async () => {
    const hostApi = createHostApi();
    await hostApi.localStorageGetItem('keyName');
    expect(sendAndReceiveSpy).toHaveBeenCalledWith('EXTENSION_API_REQUEST', {
      payload: { type: 'get', name: 'keyName' },
      type: 'LOCAL_STORAGE',
    });
  });

  it('removes local storage', async () => {
    const hostApi = createHostApi();
    await hostApi.localStorageRemoveItem('keyName');
    expect(sendAndReceiveSpy).toHaveBeenCalledWith('EXTENSION_API_REQUEST', {
      payload: { type: 'remove', name: 'keyName' },
      type: 'LOCAL_STORAGE',
    });
  });

  it('writes to clipboard', async () => {
    const hostApi = createHostApi({}, '21.7.0');
    await hostApi.clipboardWrite('ABCD');
    expect(sendAndReceiveSpy).toHaveBeenCalledWith('EXTENSION_API_REQUEST', {
      payload: { type: 'write', value: 'ABCD' },
      type: 'CLIPBOARD',
    });
  });

  it('tracks an action', () => {
    const hostApi = createHostApi();
    hostApi.track('MY_TRACK_NAME', 'MY_TRACK_ACTION', { a: 'a', b: 'bb' });
    expect(sendSpy).toHaveBeenCalledWith('EXTENSION_API_REQUEST', {
      payload: {
        name: 'MY_TRACK_NAME',
        trackAction: 'MY_TRACK_ACTION',
        attributes: { a: 'a', b: 'bb' },
      },
      type: 'TRACK_ACTION',
    });
  });

  it('sends error details', () => {
    const errorMessage = "Help, I've fallen and I can't get up!";
    const errorDetail = {
      colno: 20,
      error: new Error(errorMessage),
      filename: 'bundle.js',
      lineno: 987,
      message: errorMessage,
    };
    const hostApi = createHostApi();
    hostApi.error(new ErrorEvent('fake_error', errorDetail));
    expect(sendSpy).toHaveBeenCalledWith('EXTENSION_API_REQUEST', {
      payload: {
        ...errorDetail,
        error: errorDetail.error.toString(),
      },
      type: 'ERROR_EVENT',
    });
  });

  it('sends unload', () => {
    const hostApi = createHostApi();
    hostApi.unloaded();
    expect(sendSpy).toHaveBeenCalledWith('EXTENSION_API_REQUEST', {
      type: 'EXTENSION_UNLOADED',
      payload: {},
    });
  });

  it('prevents fetch proxy call for early Looker versions', async () => {
    const hostApi = createHostApi();
    try {
      await hostApi.fetchProxy(`https://my-json-server/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'My brand new post',
          author: 'Anthony Mouse',
        }),
      });
      throw new Error('Unexpected success');
    } catch (error: any) {
      expect(error.message).toEqual(
        'Extension requires Looker version >=7.9, got 6.25.0'
      );
    }
  });

  it('sends fetch proxy request', async () => {
    const hostApi = createHostApi({ lookerVersion: '7.9' });
    const body = JSON.stringify({
      title: 'My brand new post',
      author: 'Anthony Mouse',
    });
    await hostApi.fetchProxy(`https://my-json-server/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    });
    expect(sendAndReceiveSpy).toHaveBeenCalledWith('EXTENSION_API_REQUEST', {
      payload: {
        payload: {
          resource: 'https://my-json-server/posts',
          init: {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body,
          },
          responseBodyType: undefined,
        },
        type: 'fetch',
      },
      type: 'INVOKE_EXTERNAL_API',
    });
  });

  it('appends include credentials', async () => {
    const hostApi = createHostApi({ lookerVersion: '7.9' });
    const body = JSON.stringify({
      title: 'My brand new post',
      author: 'Anthony Mouse',
    });
    const fetchProxy = hostApi.createFetchProxy(undefined, {
      credentials: 'include',
    });
    await fetchProxy.fetchProxy(`https://my-json-server/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    });
    expect(sendAndReceiveSpy).toHaveBeenCalledWith('EXTENSION_API_REQUEST', {
      payload: {
        payload: {
          resource: 'https://my-json-server/posts',
          init: {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body,
          },
          responseBodyType: undefined,
        },
        type: 'fetch',
      },
      type: 'INVOKE_EXTERNAL_API',
    });
  });

  it('prevents server proxy call for early Looker versions', async () => {
    const hostApi = createHostApi();
    try {
      await hostApi.serverProxy(`https://my-json-server/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'My brand new post',
          author: 'Anthony Mouse',
        }),
      });
      throw new Error('Unexpected success');
    } catch (error: any) {
      expect(error.message).toEqual(
        'Extension requires Looker version >=7.11, got 6.25.0'
      );
    }
  });

  it('sends server proxy request', async () => {
    const hostApi = createHostApi({ lookerVersion: '7.11' });
    const body = JSON.stringify({
      title: 'My brand new post',
      author: 'Anthony Mouse',
    });
    await hostApi.serverProxy(`https://my-json-server/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    });
    expect(sendAndReceiveSpy).toHaveBeenCalledWith('EXTENSION_API_REQUEST', {
      payload: {
        payload: {
          resource: 'https://my-json-server/posts',
          init: {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body,
          },
          responseBodyType: undefined,
        },
        type: 'server-proxy',
      },
      type: 'INVOKE_EXTERNAL_API',
    });
  });

  it('prevents oauth2 requests for early versions of Looker', async () => {
    const hostApi = createHostApi();
    try {
      const authEndpoint = 'https://accounts.google.com/o/oauth2/v2/auth';
      const authParameters = {
        client_id: 'CLIENT_ID',
        scope: 'SCOPE',
        response_type: 'token',
      };
      await hostApi.oauth2Authenticate(authEndpoint, authParameters);
      throw new Error('Unexpected success');
    } catch (error: any) {
      expect(error.message).toEqual(
        'Extension requires Looker version >=7.9, got 6.25.0'
      );
    }
  });

  it('sends oauth2 authenticate request', async () => {
    const hostApi = createHostApi({ lookerVersion: '7.9' });
    const authEndpoint = 'https://accounts.google.com/o/oauth2/v2/auth';
    const authParameters = {
      client_id: 'CLIENT_ID',
      scope: 'SCOPE',
      response_type: 'token',
    };
    await hostApi.oauth2Authenticate(authEndpoint, authParameters);
    expect(sendAndReceiveSpy).toHaveBeenCalledWith(
      'EXTENSION_API_REQUEST',
      {
        payload: {
          payload: {
            authEndpoint,
            authParameters,
            httpMethod: 'POST',
          },
          type: 'oauth2_authenticate',
        },
        type: 'INVOKE_EXTERNAL_API',
      },
      { signal: new AbortController().signal }
    );
  });

  it('sends oauth2 authenticate request with response_type id_token', async () => {
    const hostApi = createHostApi({ lookerVersion: '7.9' });
    const authEndpoint = 'https://accounts.google.com/o/oauth2/v2/auth';
    const authParameters = {
      client_id: 'CLIENT_ID',
      scope: 'SCOPE',
      response_type: 'id_token',
    };
    await hostApi.oauth2Authenticate(authEndpoint, authParameters);
    expect(sendAndReceiveSpy).toHaveBeenCalledWith(
      'EXTENSION_API_REQUEST',
      {
        payload: {
          payload: {
            authEndpoint,
            authParameters,
            httpMethod: 'POST',
          },
          type: 'oauth2_authenticate',
        },
        type: 'INVOKE_EXTERNAL_API',
      },
      { signal: new AbortController().signal }
    );
  });

  it('rejects oauth2 authenticate request with invalid response_type', async () => {
    const hostApi = createHostApi({ lookerVersion: '7.9' });
    const authEndpoint = 'https://accounts.google.com/o/oauth2/v2/auth';
    const authParameters = {
      client_id: 'CLIENT_ID',
      scope: 'SCOPE',
      response_type: 'unknown_response_type',
    };
    try {
      await hostApi.oauth2Authenticate(authEndpoint, authParameters);
      throw new Error('How did I get here');
    } catch (err: any) {
      expect(err.message).toEqual(
        'invalid response_type, must be token, id_token or code, unknown_response_type'
      );
    }
    expect(sendAndReceiveSpy).not.toHaveBeenCalled();
  });

  it('overrides http method for oauth2Authenticate', async () => {
    const hostApi = createHostApi({ lookerVersion: '7.9' });
    const authEndpoint = 'https://accounts.google.com/o/oauth2/v2/auth';
    const authParameters = {
      client_id: 'CLIENT_ID',
      scope: 'SCOPE',
      response_type: 'token',
    };
    await hostApi.oauth2Authenticate(authEndpoint, authParameters, 'GET');
    expect(sendAndReceiveSpy).toHaveBeenCalledWith(
      'EXTENSION_API_REQUEST',
      {
        payload: {
          payload: {
            authEndpoint,
            authParameters,
            httpMethod: 'GET',
          },
          type: 'oauth2_authenticate',
        },
        type: 'INVOKE_EXTERNAL_API',
      },
      { signal: new AbortController().signal }
    );
  });

  it('prevents oauth2 code exchange requests for early versions of Looker', async () => {
    const hostApi = createHostApi({ lookerVersion: '7.9' });
    try {
      const exchangeEndpoint = 'https://github.com/login/oauth/authorize';
      const exchangeParameters = {};
      await hostApi.oauth2ExchangeCodeForToken(
        exchangeEndpoint,
        exchangeParameters
      );
      throw new Error('Unexpected success');
    } catch (error: any) {
      expect(error.message).toEqual(
        'Extension requires Looker version >=7.11, got 7.9'
      );
    }
  });

  it('sends oauth2 code exchanged request', async () => {
    const hostApi = createHostApi({ lookerVersion: '7.11' });
    const exchangeEndpoint = 'https://github.com/login/oauth/authorize';
    const exchangeParameters = {};
    await hostApi.oauth2ExchangeCodeForToken(
      exchangeEndpoint,
      exchangeParameters
    );
    expect(sendAndReceiveSpy).toHaveBeenCalledWith('EXTENSION_API_REQUEST', {
      payload: {
        payload: {
          authEndpoint: exchangeEndpoint,
          authParameters: exchangeParameters,
        },
        type: 'oauth2_exchange_code',
      },
      type: 'INVOKE_EXTERNAL_API',
    });
  });

  it('prevents secret key tag name requests for early versions of Looker', () => {
    const hostApi = createHostApi({ lookerVersion: '7.9' });
    try {
      hostApi.createSecretKeyTag('SECRET_KEY_NAME');
      throw new Error('Unexpected success');
    } catch (error: any) {
      expect(error.message).toEqual(
        'Extension requires Looker version >=7.11, got 7.9'
      );
    }
  });

  it('creates secret key name', () => {
    const hostApi = createHostApi({
      lookerVersion: '7.11',
      extensionId: 'ks-project::ks-extension',
    });
    expect(hostApi.createSecretKeyTag('SECRET_KEY_NAME')).toEqual(
      '{{ks_project_ks_extension_SECRET_KEY_NAME}}'
    );
  });

  it('rejects invalid characters in secret key name', () => {
    const hostApi = createHostApi({ lookerVersion: '7.11' });
    try {
      hostApi.createSecretKeyTag('SECRET_KEY_NAME_@@');
      throw new Error('Unexpected success');
    } catch (error: any) {
      expect(error.message).toEqual('Unsupported characters in key name');
    }
  });

  it('sets user attribute', async () => {
    const hostApi = createHostApi({ lookerVersion: '7.15' });
    await hostApi.userAttributeSetItem('keyName', 'valueData');
    expect(sendAndReceiveSpy).toHaveBeenCalledWith('EXTENSION_API_REQUEST', {
      payload: { type: 'set', name: 'keyName', value: 'valueData' },
      type: 'USER_ATTRIBUTE',
    });
  });

  it('gets user attribute', async () => {
    const hostApi = createHostApi({ lookerVersion: '7.15' });
    await hostApi.userAttributeGetItem('keyName');
    expect(sendAndReceiveSpy).toHaveBeenCalledWith('EXTENSION_API_REQUEST', {
      payload: { type: 'get', name: 'keyName' },
      type: 'USER_ATTRIBUTE',
    });
  });

  it('removes user attribute', async () => {
    const hostApi = createHostApi({ lookerVersion: '7.15' });
    await hostApi.userAttributeResetItem('keyName');
    expect(sendAndReceiveSpy).toHaveBeenCalledWith('EXTENSION_API_REQUEST', {
      payload: { type: 'reset', name: 'keyName' },
      type: 'USER_ATTRIBUTE',
    });
  });

  it('prevents set user attribute on old version', async () => {
    const hostApi = createHostApi({ lookerVersion: '7.12' });
    await expect(
      hostApi.userAttributeSetItem('keyName', 'valueData')
    ).rejects.toThrowError(
      'Extension requires Looker version >=7.15, got 7.12'
    );
  });

  it('prevents get user attribute on old version', async () => {
    const hostApi = createHostApi({ lookerVersion: '7.12' });
    await expect(hostApi.userAttributeGetItem('keyName')).rejects.toThrowError(
      'Extension requires Looker version >=7.15, got 7.12'
    );
  });

  it('prevents remove user attribute on old version', async () => {
    const hostApi = createHostApi({ lookerVersion: '7.12' });
    await expect(
      hostApi.userAttributeResetItem('keyName')
    ).rejects.toThrowError(
      'Extension requires Looker version >=7.15, got 7.12'
    );
  });

  it('gets context data', () => {
    const hostApi = createHostApi({
      lookerVersion: '7.13',
      contextData: JSON.stringify({ hello: 'world' }),
    });
    expect(hostApi.getContextData()).toEqual({ hello: 'world' });
  });

  it('saves context data', async () => {
    const hostApi = createHostApi({
      lookerVersion: '7.13',
      contextData: JSON.stringify({ hello: 'world' }),
    });
    await hostApi.saveContextData({ hello: 'looker' });
    expect(sendAndReceiveSpy).toHaveBeenCalledWith('EXTENSION_API_REQUEST', {
      payload: { type: 'save', contextData: '{"hello":"looker"}' },
      type: 'CONTEXT_DATA',
    });
  });

  it('refreshes context data', async () => {
    sendAndReceiveSpy = jest
      .spyOn(chattyHost, 'sendAndReceive')
      .mockImplementation(() =>
        Promise.resolve([JSON.stringify({ world: 'hello' })])
      );
    const hostApi = createHostApi({
      lookerVersion: '7.13',
      contextData: JSON.stringify({ hello: 'world' }),
    });
    await hostApi.refreshContextData();
    expect(sendAndReceiveSpy).toHaveBeenCalledWith('EXTENSION_API_REQUEST', {
      payload: { type: 'refresh' },
      type: 'CONTEXT_DATA',
    });
    expect(hostApi.getContextData()).toEqual({ world: 'hello' });
  });

  it('prevents get context on old version', () => {
    const hostApi = createHostApi({ lookerVersion: '7.12' });
    expect(() => hostApi.getContextData()).toThrowError(
      'Extension requires Looker version >=7.13, got 7.12'
    );
  });

  it('prevents save context on old version', async () => {
    const hostApi = createHostApi({ lookerVersion: '7.12' });
    await expect(
      hostApi.saveContextData({ hello: 'looker' })
    ).rejects.toThrowError(
      'Extension requires Looker version >=7.13, got 7.12'
    );
  });

  it('prevents refresh context on old version', async () => {
    const hostApi = createHostApi({ lookerVersion: '7.12' });
    await expect(hostApi.refreshContextData()).rejects.toThrowError(
      'Extension requires Looker version >=7.13, got 7.12'
    );
  });

  it('renders', async () => {
    const hostApi = createHostApi();
    await hostApi.rendered('Oh No!');
    await expect(sendSpy).toHaveBeenCalledWith('EXTENSION_API_REQUEST', {
      payload: { failureMessage: 'Oh No!' },
      type: 'RENDERED',
    });
  });
});
