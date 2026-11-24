/*

 Copyright 2026 Google LLC

 Use of this source code is governed by an MIT-style
 license that can be found in the LICENSE file or at
 https://opensource.org/licenses/MIT

 */

import type {
  IApiSection,
  IApiSettings,
  IRequestProps,
  SDKResponse,
} from '@looker/sdk-rtl';
import { ApiSettings, DefaultSettings } from '@looker/sdk-rtl';
import { NodeSession } from './nodeSession';
import { NodeTransport } from './nodeTransport';

class MockSettings extends ApiSettings {
  readConfig(_section?: string): IApiSection {
    return { client_id: 'id', client_secret: 'secret' };
  }
}

const tokenResponse = (access_token: string) =>
  ({
    ok: true,
    value: { access_token, token_type: 'Bearer', expires_in: 3600 },
  } as SDKResponse<any, any>);

describe('NodeSession', () => {
  const settings = new MockSettings({
    ...DefaultSettings(),
    base_url: 'https://myinstance.looker.com:19999',
  } as IApiSettings);

  it('login(sudoId) sudoes when the API user is not logged in yet', async () => {
    const transport = new NodeTransport(settings);
    const authorization: Array<string | undefined> = [];
    const request = jest
      .spyOn(transport, 'request')
      .mockImplementation(
        async (_method, path, _queryParams, _body, authenticator) => {
          const init = { headers: {} } as IRequestProps;
          if (authenticator) {
            authenticator(init);
          }
          authorization.push(init.headers.Authorization);
          return tokenResponse(path === '/api/4.0/login/5' ? 'sudo' : 'api');
        }
      );
    const session = new NodeSession(settings, transport);

    await session.login('5');

    expect(request).toHaveBeenCalledTimes(2);
    expect(request).toHaveBeenNthCalledWith(
      1,
      'POST',
      '/api/4.0/login',
      undefined,
      'client_id=id&client_secret=secret',
      undefined,
      { headers: { 'content-type': 'application/x-www-form-urlencoded' } }
    );
    expect(request).toHaveBeenNthCalledWith(
      2,
      'POST',
      '/api/4.0/login/5',
      null,
      null,
      expect.any(Function),
      settings
    );
    expect(authorization).toEqual([undefined, 'Bearer api']);
    expect(session.isSudo()).toEqual(true);
    const props = await session.authenticate({ headers: {} } as IRequestProps);
    expect(props.headers.Authorization).toEqual('Bearer sudo');
  });
});
