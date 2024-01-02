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

import { MockCrypto } from './oauthSession.spec';
import { BrowserServices } from './browserServices';
import { DefaultSettings } from './apiSettings';
import { BrowserCryptoHash, BrowserTransport } from './browserTransport';
import type { IHostConnection } from './extensionTransport';
import { ExtensionTransport } from './extensionTransport';

describe('BrowserServices', () => {
  it('fails if settings are not provided', () => {
    expect(() => new BrowserServices({})).toThrow();
  });

  it('succeeds with default settings', () => {
    const defaultSettings = DefaultSettings();
    const svcs = new BrowserServices({ settings: defaultSettings });
    expect(svcs.settings).toEqual(defaultSettings);
    expect(svcs.transport).toBeInstanceOf(BrowserTransport);
    expect(svcs.crypto).toBeInstanceOf(BrowserCryptoHash);
  });

  it('accepts transport override', () => {
    const svcs = new BrowserServices({
      settings: DefaultSettings(),
      transport: new ExtensionTransport(
        DefaultSettings(),
        {} as IHostConnection
      ),
    });
    // nonsensical combination, but it doesn't matter for testing BrowserService ctor
    expect(svcs.transport).toBeInstanceOf(ExtensionTransport);
    expect(svcs.crypto).toBeInstanceOf(BrowserCryptoHash);
  });

  it('accepts crypto override', () => {
    const svcs = new BrowserServices({
      crypto: new MockCrypto(),
      settings: DefaultSettings(),
    });
    // nonsensical combination, but it doesn't matter for testing BrowserService ctor
    expect(svcs.transport).toBeInstanceOf(BrowserTransport);
    expect(svcs.crypto).toBeInstanceOf(MockCrypto);
  });
});
