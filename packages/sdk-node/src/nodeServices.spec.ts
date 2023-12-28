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

import type { IApiSection, IApiSettings, ICryptoHash } from '@looker/sdk-rtl';
import { ApiSettings, DefaultSettings, OAuthSession } from '@looker/sdk-rtl';
import { NodeServices } from './nodeServices';
import { NodeCryptoHash } from './nodeTransport';

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

// TODO need to mock SessionStorage for downstream use in OAuthSession or mock code_verifier get/set for this to work
describe.skip('nodeServices', () => {
  it('createAuthCodeRequestUrl with live crypto', async () => {
    const services = new NodeServices({
      crypto: new NodeCryptoHash(),
      settings: new MockOauthSettings(),
    });
    const session = new OAuthSession(services);
    const urlstr = await session.createAuthCodeRequestUrl('api', 'mystate');
    expect(session.code_verifier).toBeDefined();
    expect((session.code_verifier || '').length).toEqual(66);

    const url = new URL(urlstr);
    expect(url.origin).toEqual(allSettings.looker_url);
    const params = url.searchParams;
    const props: any = {};
    params.forEach((value, key) => {
      props[key] = value;
    });
    delete props.code_challenge;
    expect(props).toEqual({
      client_id: '123456',
      code_challenge_method: 'S256',
      redirect_uri: 'https://myapp.com/redirect',
      response_type: 'code',
      scope: 'api',
      state: 'mystate',
    });
  });
});
