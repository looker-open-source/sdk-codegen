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

import type { ArgValues } from '@looker/sdk-codegen';
import type { ICryptoHash } from './cryptoHash';
import { OAuthSession } from './oauthSession';
import type { IApiSection, IApiSettings } from './apiSettings';
import { ApiSettings, DefaultSettings } from './apiSettings';
import { BrowserCryptoHash, BrowserTransport } from './browserTransport';
// import { NodeCryptoHash, NodeTransport } from './nodeTransport'
import type { IHostConnection } from './extensionTransport';
import { ExtensionTransport } from './extensionTransport';
import { BrowserServices } from './browserServices';

const allSettings = {
  ...DefaultSettings(),
  base_url: 'https://myinstance.looker.com:19999',
  client_id: '123456',
  looker_url: 'https://myinstance.looker.com:9999',
  redirect_uri: 'https://myapp.com/redirect',
} as IApiSettings;

export class MockOauthSettings extends ApiSettings {
  constructor(private mocked: IApiSettings = allSettings) {
    super(mocked);
  }

  readConfig(_section?: string): IApiSection {
    return this.mocked;
  }
}

export class MockCrypto implements ICryptoHash {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  secureRandom(byteCount: number): string {
    return 'feedface';
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  sha256Hash(message: string): Promise<string> {
    return Promise.resolve('baadf00d');
  }
}

const mockStorage = (() => {
  let store: ArgValues = {};

  return {
    getItem(key: string) {
      return store[key] || undefined;
    },
    setItem(key: string, value: any) {
      store[key] = value.toString();
    },
    removeItem(key: string) {
      delete store[key];
    },
    clear() {
      store = {};
    },
  };
})();

let storageProp: any;

describe('oauthSession', () => {
  beforeEach(() => {
    sessionStorage.clear();
    jest.restoreAllMocks();
  });
  beforeAll(() => {
    storageProp = Object.getOwnPropertyDescriptor(window, 'sessionStorage');
    Object.defineProperty(window, 'sessionStorage', {
      value: mockStorage,
    });
  });
  afterAll(() => {
    Object.defineProperty(window, 'sessionStorage', storageProp);
  });

  it('mocked session storage works', () => {
    const expected = 'feedface';
    const key = 'key';
    sessionStorage.setItem(key, expected);
    const actual = sessionStorage.getItem(key);
    expect(actual).toEqual(expected);
    sessionStorage.removeItem(key);
    expect(sessionStorage.getItem(key)).toBeUndefined();
  });

  it('fails if missing settings', () => {
    for (const key of ['client_id', 'redirect_uri', 'looker_url']) {
      const dup: any = { ...allSettings };
      delete dup[key];
      const settings = new MockOauthSettings(dup);
      const svcs = new BrowserServices({ settings });
      expect(() => new OAuthSession(svcs)).toThrow(
        `Missing required configuration setting: '${key}'`
      );
    }
  });

  it('defaults to BrowserTransport and BrowserCryptoHash', () => {
    const services = new BrowserServices({ settings: new MockOauthSettings() });
    const session = new OAuthSession(services);
    expect(session.transport).toBeInstanceOf(BrowserTransport);
    expect(session.crypto).toBeInstanceOf(BrowserCryptoHash);
  });

  it('accepts transport and crypto overrides via services', () => {
    const settings = new MockOauthSettings();
    const transport = new ExtensionTransport(settings, {} as IHostConnection);
    const crypto = new MockCrypto();
    const services = new BrowserServices({
      crypto,
      settings,
      transport,
    });
    const session = new OAuthSession(services);
    expect(session.crypto).toEqual(crypto);

    const session2 = new OAuthSession({
      crypto: crypto,
      settings,
      transport: transport,
    });
    expect(session2.transport).toEqual(transport);
    expect(session2.crypto).toEqual(crypto);
  });

  // No need to test for property omission via duck type hash, since the
  // services param is not a partial, TypeScript will error for any hash
  // that does not provide all properties of IPlatformServices
  it('accepts transport and crypto overrides via duck type hash', () => {
    const settings = new MockOauthSettings();
    const transport = new ExtensionTransport(settings, {} as IHostConnection);
    const crypto = new MockCrypto();
    const session = new OAuthSession({
      crypto,
      settings,
      transport,
    });
    expect(session.transport).toEqual(transport);
    expect(session.crypto).toEqual(crypto);
  });

  it('createAuthCodeRequestUrl with mock constant code_verifier', async () => {
    const services = new BrowserServices({
      crypto: new MockCrypto(),
      settings: new MockOauthSettings(),
    });
    const session = new OAuthSession(services);
    const urlstr = await session.createAuthCodeRequestUrl('api', 'mystate');
    expect(session.code_verifier).toEqual('feedface');
    const url = new URL(urlstr);
    expect(url.origin).toEqual(allSettings.looker_url);
    expect(url.pathname).toEqual('/auth');
    const params = url.searchParams;
    const props: any = {};
    params.forEach((value, key) => {
      props[key] = value;
    });
    expect(props).toEqual({
      client_id: '123456',
      code_challenge: 'baadf00d',
      code_challenge_method: 'S256',
      redirect_uri: 'https://myapp.com/redirect',
      response_type: 'code',
      scope: 'api',
      state: 'mystate',
    });
  });

  it('redeemAuthCode', async () => {
    const mockRequest = jest.fn().mockReturnValue({ ok: true, value: '' });
    const transport = new BrowserTransport(allSettings);
    transport.request = mockRequest as any;
    const services = new BrowserServices({
      crypto: new MockCrypto(),
      settings: new MockOauthSettings(),
      transport,
    });
    const session = new OAuthSession(services);
    await session.createAuthCodeRequestUrl('api', 'mystate');
    const authCode = 'abcdef';
    await session.redeemAuthCode(authCode);
    const expected_url = new URL(allSettings.base_url);
    expected_url.pathname = 'api/token';
    expect(mockRequest).toHaveBeenCalledWith(
      'POST',
      expected_url.toString(),
      undefined,
      {
        client_id: allSettings.client_id,
        code: authCode,
        code_verifier: 'feedface',
        grant_type: 'authorization_code',
        redirect_uri: allSettings.redirect_uri,
      }
    );
  });
});
