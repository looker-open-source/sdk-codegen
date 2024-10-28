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

describe('AccessToken', () => {
  it('defaults with empty token', () => {
    const actual = new AuthToken();
    expect(actual.access_token).toEqual('');
    expect(actual.token_type).toEqual('');
    expect(actual.expires_in).toEqual(0);
    expect(actual.isActive()).toEqual(false);
  });

  it('is active with full token', () => {
    const actual = new AuthToken({
      access_token: 'all-access',
      expires_in: 3600,
      token_type: 'backstage',
    });
    expect(actual.access_token).toEqual('all-access');
    expect(actual.token_type).toEqual('backstage');
    expect(actual.expires_in).toEqual(3600);
    expect(actual.isActive()).toEqual(true);
  });

  it('has a 10 second lag time for expiration', () => {
    let actual = new AuthToken({
      access_token: 'all-access',
      expires_in: 9,
      token_type: 'backstage',
    });
    expect(actual.access_token).toEqual('all-access');
    expect(actual.token_type).toEqual('backstage');
    expect(actual.expires_in).toEqual(9);
    expect(actual.isActive()).toEqual(false);
    actual = new AuthToken({
      access_token: 'all-access',
      expires_in: 11,
      token_type: 'backstage',
    });
    expect(actual.expires_in).toEqual(11);
    expect(actual.isActive()).toEqual(true);
  });
});
