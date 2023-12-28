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

import { connectExtensionHost } from './connect_extension_host';
import * as globalListener from './global_listener';
import type { ExtensionNotification } from './types';
import { ExtensionNotificationType, MountPoint } from './types';

let channel: any;
class MockMessageChannel {
  port1: any = {
    postMessage: () => {
      // noop
    },
  };

  port2: any = {};
  constructor() {
    channel = this;
  }
}

// Simulate the sync message
const simulateChattySyncMessage = () => {
  channel.port1.onmessage({ data: { action: 0 } });
};

// Simulate extension notification
const simulateExtensionNotification = (message: ExtensionNotification) => {
  window.setTimeout(() => {
    // Simulate the initialize message. Need to wait to let the sync promise complete
    channel.port1.onmessage({
      data: {
        action: 1,
        data: {
          eventName: 'EXTENSION_NOTIFICATION',
          payload: [message],
          sequence: 0,
        },
      },
    });
  });
};

describe('connect_extension_host tests', () => {
  let originalConsoleError: any;
  let registerHostApiSpy: jest.SpyInstance;

  beforeEach(() => {
    // Silence console error messages
    originalConsoleError = console.error;
    console.error = jest.fn();
    (global as any).MessageChannel = MockMessageChannel;
    registerHostApiSpy = jest.spyOn(globalListener as any, 'registerHostApi');
  });

  afterEach(() => {
    registerHostApiSpy.mockReset();
    console.error = originalConsoleError;
  });

  it('handles basic connection', (done) => {
    connectExtensionHost({}).then((extensionHost: any) => {
      expect(extensionHost).toBeDefined();
      expect(extensionHost.chattyHost).toBeDefined();
      expect(extensionHost.restoreRoute).not.toBeDefined();
      expect(registerHostApiSpy).toBeCalled();
      expect(globalListener.getExtensionSDK()).toEqual(extensionHost);
      done();
    });
    simulateChattySyncMessage();
    simulateExtensionNotification({
      type: ExtensionNotificationType.INITIALIZE,
      payload: {
        extensionDashboardTileEnabled: false,
        lookerVersion: '7.14.0',
        hostUrl: 'https://self-signed.looker.com:9999',
        hostOrigin: 'https://self-signed.looker.com:9999',
        hostType: 'standard',
        mountType: 'fullscreen',
        extensionId: 'a::b',
        mountPoint: MountPoint.standalone,
      },
    });
  });

  it('handles connection with callback and initial route', (done) => {
    const initializedCallback = jest.fn();
    const setInitialRoute = jest.fn();
    connectExtensionHost({
      initializedCallback,
      setInitialRoute,
      requiredLookerVersion: '>=7.14.0',
      chattyTimeout: -1,
    }).then((extensionHost: any) => {
      expect(extensionHost).toBeDefined();
      expect(extensionHost.chattyHost).toBeDefined();
      expect(extensionHost.setInitialRoute).toEqual(setInitialRoute);
      expect(initializedCallback).toHaveBeenCalledWith(undefined);
      expect(setInitialRoute).toHaveBeenCalledWith('/', { hello: 'world' });
      done();
    });
    simulateChattySyncMessage();
    simulateExtensionNotification({
      type: ExtensionNotificationType.INITIALIZE,
      payload: {
        extensionDashboardTileEnabled: false,
        route: '/',
        routeState: { hello: 'world' },
        lookerVersion: '7.14.0',
        hostUrl: 'https://self-signed.looker.com:9999',
        hostOrigin: 'https://self-signed.looker.com:9999',
        hostType: 'standard',
        mountType: 'fullscreen',
        extensionId: 'a::b',
        mountPoint: MountPoint.standalone,
      },
    });
  });

  it('rejects when looker version is not supported', (done) => {
    const initializedCallback = jest.fn();
    const setInitialRoute = jest.fn();
    connectExtensionHost({
      initializedCallback,
      setInitialRoute,
      requiredLookerVersion: '>=7.16.0',
    }).catch((error: any) => {
      expect(error.message).toEqual(
        'Extension requires Looker version >=7.16.0, got 7.14.0'
      );
      done();
    });
    simulateChattySyncMessage();
    simulateExtensionNotification({
      type: ExtensionNotificationType.INITIALIZE,
      payload: {
        extensionDashboardTileEnabled: false,
        route: '/',
        routeState: { hello: 'world' },
        lookerVersion: '7.14.0',
        hostUrl: 'https://self-signed.looker.com:9999',
        hostOrigin: 'https://self-signed.looker.com:9999',
        hostType: 'standard',
        mountType: 'fullscreen',
        extensionId: 'a::b',
        mountPoint: MountPoint.standalone,
      },
    });
  });
});
