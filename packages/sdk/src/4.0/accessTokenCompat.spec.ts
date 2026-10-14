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

// Reproduction/verification for
// https://github.com/looker-open-source/sdk-codegen/issues/1729
//
// `@looker/sdk`'s `IAccessToken.refresh_token` is `string | null` (matching
// the actual Looker API response shape), while `@looker/sdk-rtl`'s
// `IAccessToken` previously declared it as `string`. That mismatch meant a
// `login_user()` response (typed with the sdk's `IAccessToken`) could not be
// passed directly into `AuthToken.setToken()`/the constructor (typed with the
// rtl's `IAccessToken`) without a manual `null -> undefined` cast. This test
// proves the two interfaces are now compatible.

import { AuthToken } from '@looker/sdk-rtl';
import type { IAccessToken } from './models';

describe('IAccessToken compatibility with @looker/sdk-rtl (issue #1729)', () => {
  it('accepts an @looker/sdk IAccessToken with a null refresh_token', () => {
    // this is the shape login_user() actually returns; `refresh_token: null`
    // wouldn't compile against the pre-fix @looker/sdk-rtl IAccessToken
    const token: IAccessToken = {
      access_token: 'all-access',
      token_type: 'backstage',
      expires_in: 3600,
      refresh_token: null,
    };

    const authToken = new AuthToken(token);

    expect(authToken.access_token).toEqual('all-access');
    expect(authToken.token_type).toEqual('backstage');
    expect(authToken.expires_in).toEqual(3600);
    // a nil refresh_token means "keep using the old refresh_token", which is
    // unset here, so it stays undefined
    expect(authToken.refresh_token).toBeUndefined();
    expect(authToken.isActive()).toEqual(true);
  });

  it('captures a non-nil refresh_token from an @looker/sdk IAccessToken', () => {
    const token: IAccessToken = {
      access_token: 'all-access',
      token_type: 'backstage',
      expires_in: 3600,
      refresh_token: 'a-refresh-token',
    };

    const authToken = new AuthToken(token);

    expect(authToken.refresh_token).toEqual('a-refresh-token');
  });
});
