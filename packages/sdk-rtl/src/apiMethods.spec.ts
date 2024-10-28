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

import type { Authenticator } from './transport';
import { APIMethods } from './apiMethods';
import type { IAuthSession } from './authSession';
import type { IApiSettings } from './apiSettings';
import { DefaultSettings } from './apiSettings';

describe('ApiMethods', () => {
  const hostname = 'https://looker.sdk';
  const apiVersion = '4.0';
  const settings = { base_url: hostname } as IApiSettings;
  const session = { settings } as IAuthSession;
  const fullPath = 'https://github.com/looker-open-source/sdk-codegen';
  const mockAuth: Authenticator = (props: any) => props;
  const api = new APIMethods(session, 'mock');
  api.apiVersion = apiVersion;
  api.apiPath = `${settings.base_url}/api/${apiVersion}`;

  it('relative path without auth is just base', () => {
    const actual = api.makePath('/login', settings);
    expect(actual).toEqual(`${hostname}/login`);
  });

  it('relative path with auth is api path', () => {
    const actual = api.makePath('/login', settings, mockAuth);
    expect(actual).toEqual(`${hostname}/api/${apiVersion}/login`);
  });

  it('full path without auth is just full path', () => {
    const actual = api.makePath(fullPath, settings);
    expect(actual).toEqual(fullPath);
  });

  it('full path with auth is just full path', () => {
    const actual = api.makePath(fullPath, settings, mockAuth);
    expect(actual).toEqual(fullPath);
  });

  it('path not prefixed if base url not set', () => {
    const actual = api.makePath('/all_connections', DefaultSettings());
    expect(actual).toEqual(`/all_connections`);
  });
});
