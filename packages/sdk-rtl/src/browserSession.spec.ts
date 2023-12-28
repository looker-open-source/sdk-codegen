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

import { AuthToken } from './authToken';
import type { IApiSettings } from './apiSettings';
import type { ITransport, IRequestProps } from './transport';
import type { IAccessToken } from './authSession';
import { MockOauthSettings } from './oauthSession.spec';
import { BrowserSession } from './browserSession';

const mockToken: IAccessToken = {
  access_token: 'mocked',
  expires_in: 3600,
  token_type: 'Bearer',
};

const settings = new MockOauthSettings();

/**
 * Mocking class for BrowserSession getToken() tests
 */
class BrowserSessionMock extends BrowserSession {
  constructor(
    public settings: IApiSettings,
    transport?: ITransport
  ) {
    super(settings, transport);
  }

  async login() {
    return await this.getToken();
  }

  async logout() {
    this.activeToken = new AuthToken();
    return true;
  }

  async getToken() {
    this.activeToken = new AuthToken(mockToken);
    return Promise.resolve(this.activeToken);
  }
}

describe('Browser session', () => {
  it('initialization', async () => {
    const mock = new BrowserSessionMock(settings);
    const token = await mock.login();
    expect(token.access_token).toEqual(mockToken.access_token);
    expect(token.expires_in).toEqual(mockToken.expires_in);
    expect(token.token_type).toEqual(mockToken.token_type);
    expect(mock.isAuthenticated()).toEqual(true);
    expect(mock.isSudo()).toEqual(false);
    const logout = await mock.logout();
    expect(logout).toEqual(true);
  });

  it('getToken is mocked', async () => {
    const mock = new BrowserSessionMock(settings);
    const token = await mock.getToken();
    expect(token.access_token).toEqual(mockToken.access_token);
    expect(token.expires_in).toEqual(mockToken.expires_in);
    expect(token.token_type).toEqual(mockToken.token_type);
  });

  it('authenticate causes authentication', async () => {
    const mock = new BrowserSessionMock(settings);
    expect(mock.isAuthenticated()).toEqual(false);
    const props = await mock.authenticate({ headers: {} } as IRequestProps);
    expect(mock.isAuthenticated()).toEqual(true);
    expect(props.mode).toEqual('cors');
    expect(props.headers.Authorization).toEqual('Bearer mocked');
  });
});
