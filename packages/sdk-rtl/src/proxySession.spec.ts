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

import type { IApiSettings } from './apiSettings';
import type { IRequestProps, ITransport } from './transport';
import { LookerAppId, agentPrefix } from './transport';
import { ProxySession } from './proxySession';
import { AuthSession } from './authSession';

/**
 * Mocking setup for ProxySession getToken() tests
 */
const mockToken = 'mocked';

const proxyUrl = 'https://my.proxy';
class ProxyMock extends ProxySession {
  constructor(
    public settings: IApiSettings,
    transport?: ITransport
  ) {
    super(settings, proxyUrl, transport);
  }

  async getToken(): Promise<any> {
    return Promise.resolve(mockToken);
  }
}

describe('Proxy session', () => {
  it('initialization', async () => {
    const mock = new ProxyMock({} as IApiSettings);
    await expect(mock.login()).rejects.toEqual(AuthSession.TBD);
    expect(mock.isAuthenticated()).toEqual(true);
    expect(mock.isSudo()).toEqual(false);
    const logout = await mock.logout();
    expect(logout).toEqual(false);
  });

  it('getToken is mocked', async () => {
    const mock = new ProxyMock({} as IApiSettings);
    await expect(mock.getToken()).resolves.toEqual(mockToken);
  });

  it('authenticate causes authentication', async () => {
    const mock = new ProxyMock({} as IApiSettings);
    const props = await mock.authenticate({ url: 'mock.com' } as IRequestProps);
    expect(props.url).toEqual(proxyUrl);
    expect(props.headers['X-Forwarded-For']).toEqual('mock.com');
    expect(props.headers[LookerAppId]).toEqual(agentPrefix);
  });
});
