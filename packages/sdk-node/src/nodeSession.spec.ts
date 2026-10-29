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
    const request = jest
      .spyOn(transport, 'request')
      .mockImplementation(async (_method, path) =>
        tokenResponse(path === '/api/4.0/login/5' ? 'sudo' : 'api')
      );
    const session = new NodeSession(settings, transport);

    await session.login('5');

    expect(request).toHaveBeenCalledWith(
      'POST',
      '/api/4.0/login/5',
      null,
      null,
      expect.any(Function),
      settings
    );
    expect(session.isSudo()).toEqual(true);
    const props = await session.authenticate({ headers: {} } as IRequestProps);
    expect(props.headers.Authorization).toEqual('Bearer sudo');
  });
});
