/*

 Copyright 2026 Google LLC

 Use of this source code is governed by an MIT-style
 license that can be found in the LICENSE file or at
 https://opensource.org/licenses/MIT

 */

import type {
  Authenticator,
  HttpMethod,
  IApiSection,
  IApiSettings,
  IRequestProps,
  SDKResponse,
} from '@looker/sdk-rtl';
import { ApiSettings, DefaultSettings, StatusCode } from '@looker/sdk-rtl';
import { NodeSession } from './nodeSession';
import { NodeTransport } from './nodeTransport';

class MockSettings extends ApiSettings {
  readConfig(_section?: string): IApiSection {
    return { client_id: 'id', client_secret: 'secret' };
  }
}

const tokenResponse = (access_token: string, expires_in = 3600) =>
  ({
    ok: true,
    value: { access_token, token_type: 'Bearer', expires_in },
  } as SDKResponse<any, any>);

describe('NodeSession', () => {
  const settings = new MockSettings({
    ...DefaultSettings(),
    base_url: 'https://myinstance.looker.com:19999',
  } as IApiSettings);

  it('logs in API user and sudoes when starting unauthenticated', async () => {
    const transport = new NodeTransport(settings);
    const seenCalls: Array<{
      method: HttpMethod;
      path: string;
      authHeader?: string;
    }> = [];
    const request = jest
      .spyOn(transport, 'request')
      .mockImplementation(
        async (
          method,
          path,
          _queryParams,
          _body,
          authenticator?: Authenticator
        ) => {
          const props = authenticator
            ? await authenticator({ headers: {} } as IRequestProps)
            : ({ headers: {} } as IRequestProps);
          seenCalls.push({
            method,
            path,
            authHeader: props.headers.Authorization,
          });
          return tokenResponse(path === '/api/4.0/login/5' ? 'sudo-5' : 'api');
        }
      );

    const session = new NodeSession(settings, transport);
    await session.login('5');

    expect(request).toHaveBeenCalledTimes(2);
    expect(seenCalls).toEqual([
      { method: 'POST', path: '/api/4.0/login', authHeader: undefined },
      { method: 'POST', path: '/api/4.0/login/5', authHeader: 'Bearer api' },
    ]);
    expect(session.isSudo()).toEqual(true);
    const props = await session.authenticate({ headers: {} } as IRequestProps);
    expect(props.headers.Authorization).toEqual('Bearer sudo-5');
  });

  it('renews expired sudo token using active API token instead of expired sudo token', async () => {
    const transport = new NodeTransport(settings);
    let sudoCount = 0;
    const seenCalls: Array<{
      method: HttpMethod;
      path: string;
      authHeader?: string;
    }> = [];
    jest
      .spyOn(transport, 'request')
      .mockImplementation(
        async (
          method,
          path,
          _queryParams,
          _body,
          authenticator?: Authenticator
        ) => {
          const props = authenticator
            ? await authenticator({ headers: {} } as IRequestProps)
            : ({ headers: {} } as IRequestProps);
          seenCalls.push({
            method,
            path,
            authHeader: props.headers.Authorization,
          });
          if (path === '/api/4.0/login') {
            return tokenResponse('api-token', 3600);
          }
          if (path === '/api/4.0/login/5') {
            sudoCount += 1;
            return tokenResponse(`sudo-token-${sudoCount}`, 900);
          }
          return { ok: true, value: '' } as SDKResponse<any, any>;
        }
      );

    const session = new NodeSession(settings, transport);
    await session.login('5');

    // Expire _sudoToken while _authToken remains active and _sudoToken.access_token is still populated
    session._sudoToken.expiresAt = new Date(Date.now() - 60_000);
    expect(session._sudoToken.access_token).toEqual('sudo-token-1');
    expect(session._authToken.isActive()).toEqual(true);
    expect(session.isSudo()).toEqual(false);
    expect(session.isAuthenticated()).toEqual(false);

    const props = await session.authenticate({ headers: {} } as IRequestProps);
    expect(props.headers.Authorization).toEqual('Bearer sudo-token-2');
    expect(session.isSudo()).toEqual(true);
    expect(seenCalls).toEqual([
      { method: 'POST', path: '/api/4.0/login', authHeader: undefined },
      {
        method: 'POST',
        path: '/api/4.0/login/5',
        authHeader: 'Bearer api-token',
      },
      {
        method: 'POST',
        path: '/api/4.0/login/5',
        authHeader: 'Bearer api-token',
      },
    ]);
  });

  it('reverts cleanly to active API token via login() or logout() after sudo token expires', async () => {
    const transport = new NodeTransport(settings);
    const seenPaths: string[] = [];
    jest
      .spyOn(transport, 'request')
      .mockImplementation(async (_method, path) => {
        seenPaths.push(path);
        if (path === '/api/4.0/login') {
          return tokenResponse('api-token', 3600);
        }
        if (path === '/api/4.0/login/5') {
          return tokenResponse('sudo-token', 900);
        }
        return { ok: true, value: '' } as SDKResponse<any, any>;
      });

    // Case 1: login() with no sudoId after _sudoToken expires
    const session1 = new NodeSession(settings, transport);
    await session1.login('5');
    session1._sudoToken.expiresAt = new Date(Date.now() - 60_000);

    const revertedToken = await session1.login();
    expect(revertedToken.access_token).toEqual('api-token');
    expect(session1.isSudo()).toEqual(false);
    expect(session1.isAuthenticated()).toEqual(true);
    const props1 = await session1.authenticate({
      headers: {},
    } as IRequestProps);
    expect(props1.headers.Authorization).toEqual('Bearer api-token');

    // Case 2: logout() after _sudoToken expires clears sudoId without calling DELETE /logout
    seenPaths.length = 0;
    const session2 = new NodeSession(settings, transport);
    await session2.login('5');
    session2._sudoToken.expiresAt = new Date(Date.now() - 60_000);

    const loggedOut = await session2.logout();
    expect(loggedOut).toEqual(false);
    expect(session2.sudoId).toEqual('');
    expect(session2.isSudo()).toEqual(false);
    expect(session2.isAuthenticated()).toEqual(true);
    expect(seenPaths).toEqual(['/api/4.0/login', '/api/4.0/login/5']);
    const props2 = await session2.authenticate({
      headers: {},
    } as IRequestProps);
    expect(props2.headers.Authorization).toEqual('Bearer api-token');
  });

  it('does not fall back to admin API token when sudo login fails', async () => {
    const transport = new NodeTransport(settings);
    let sudoAttempts = 0;
    jest
      .spyOn(transport, 'request')
      .mockImplementation(async (_method, path) => {
        if (path === '/api/4.0/login') {
          return tokenResponse('admin-api-token', 3600);
        }
        if (path === '/api/4.0/login/999') {
          sudoAttempts += 1;
          return {
            ok: false,
            error: { message: 'Not found', documentation_url: null },
            statusCode: StatusCode.NotFound,
          } as SDKResponse<any, any>;
        }
        return { ok: true, value: '' } as SDKResponse<any, any>;
      });

    const session = new NodeSession(settings, transport);
    await expect(session.login('999')).rejects.toThrow('Not found');

    // Admin _authToken was fetched, but session must NOT report authenticated or expose admin token
    expect(session._authToken.isActive()).toEqual(true);
    expect(session.sudoId).toEqual('999');
    expect(session.isSudo()).toEqual(false);
    expect(session.isAuthenticated()).toEqual(false);
    expect(session.activeToken.access_token).toEqual('');

    // Reusing session must retry sudo (and fail), never sending Bearer admin-api-token
    await expect(
      session.authenticate({ headers: {} } as IRequestProps)
    ).rejects.toThrow('Not found');
    expect(sudoAttempts).toEqual(2);
  });
});
