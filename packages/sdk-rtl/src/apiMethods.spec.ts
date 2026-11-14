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

import type {
  Authenticator,
  IRequestProps,
  ITransport,
  SDKResponse,
} from './transport';
import { StatusCode } from './transport';
import { APIMethods } from './apiMethods';
import type { IAuthSession } from './authSession';
import type { IApiSettings } from './apiSettings';
import { DefaultSettings } from './apiSettings';
import { AuthToken } from './authToken';

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

  describe('401 Unauthorized handling', () => {
    const createMockSession = (
      handler: (props: IRequestProps) => SDKResponse<any, any>,
      sudoId = ''
    ) => {
      let loginCount = 0;
      const token = new AuthToken({
        access_token: 'stale-token',
        expires_in: 3600,
        token_type: 'Bearer',
      });
      const calls: IRequestProps[] = [];
      const transport = {
        request: jest.fn(
          async (
            method: any,
            path: string,
            _queryParams?: any,
            body?: any,
            authenticator?: Authenticator
          ) => {
            let props: IRequestProps = {
              method,
              url: path,
              headers: {},
              body,
            };
            if (authenticator) {
              props = await authenticator(props);
            }
            calls.push(props);
            return handler(props);
          }
        ),
      } as unknown as ITransport;

      const mockSession: IAuthSession = {
        settings,
        transport,
        sudoId,
        isAuthenticated: () => token.isActive(),
        getToken: async () => {
          if (!token.isActive()) {
            loginCount++;
            token.setToken({
              access_token: mockSession.sudoId
                ? `sudo-${mockSession.sudoId}-${loginCount}`
                : `fresh-token-${loginCount}`,
              expires_in: 3600,
              token_type: 'Bearer',
            });
          }
          return token;
        },
        authenticate: async (props: IRequestProps) => {
          const active = await mockSession.getToken();
          props.headers.Authorization = `Bearer ${active.access_token}`;
          return props;
        },
        login: async () => mockSession.getToken(),
        logout: async () => true,
        isSudo: () => !!mockSession.sudoId && token.isActive(),
        reset: () => {
          mockSession.sudoId = '';
          token.reset();
        },
      };

      const sdk = new APIMethods(mockSession, 'mock');
      sdk.apiVersion = apiVersion;
      sdk.apiPath = `${settings.base_url}/api/${apiVersion}`;
      return { sdk, mockSession, calls, getLoginCount: () => loginCount };
    };

    it('invalidates cached token and retries once on 401', async () => {
      const { sdk, calls, getLoginCount } = createMockSession(props => {
        if (props.headers.Authorization === 'Bearer stale-token') {
          return {
            ok: false,
            error: { message: 'Requires authentication.' },
            statusCode: StatusCode.Unauthorized,
          };
        }
        return { ok: true, value: { id: 'user-1' } };
      });

      const res = await sdk.get<{ id: string }, any>('/user');
      expect(res.ok).toEqual(true);
      if (res.ok) {
        expect(res.value.id).toEqual('user-1');
      }
      expect(getLoginCount()).toEqual(1);
      expect(calls).toHaveLength(2);
      expect(calls[0].headers.Authorization).toEqual('Bearer stale-token');
      expect(calls[1].headers.Authorization).toEqual('Bearer fresh-token-1');
    });

    it('preserves sudoId across 401 token invalidation and retry', async () => {
      const { sdk, mockSession, calls } = createMockSession(props => {
        if (props.headers.Authorization === 'Bearer stale-token') {
          return {
            ok: false,
            error: { message: 'Requires authentication.' },
            statusCode: StatusCode.Unauthorized,
          };
        }
        return { ok: true, value: { auth: props.headers.Authorization } };
      }, '42');

      const res = await sdk.get<{ auth: string }, any>('/user');
      expect(res.ok).toEqual(true);
      expect(mockSession.sudoId).toEqual('42');
      expect(calls[1].headers.Authorization).toEqual('Bearer sudo-42-1');
    });

    it('does not loop infinitely on persistent 401 and leaves session unauthenticated', async () => {
      const { sdk, mockSession, calls } = createMockSession(() => ({
        ok: false,
        error: { message: 'Requires authentication.' },
        statusCode: StatusCode.Unauthorized,
      }));

      const res = await sdk.get('/user');
      expect(res.ok).toEqual(false);
      expect(calls).toHaveLength(2);
      expect(mockSession.isAuthenticated()).toEqual(false);
    });

    it('invalidates token without retrying /logout on 401', async () => {
      const { sdk, mockSession, calls } = createMockSession(() => ({
        ok: false,
        error: { message: 'Requires authentication.' },
        statusCode: StatusCode.Unauthorized,
      }));

      const res = await sdk.delete('/logout');
      expect(res.ok).toEqual(false);
      expect(calls).toHaveLength(1);
      expect(mockSession.isAuthenticated()).toEqual(false);
    });
  });
});
