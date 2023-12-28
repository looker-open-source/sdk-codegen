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
import * as fs from 'fs';
import path from 'path';
import { JWT } from 'google-auth-library';
import type { IRequestProps, IApiSettings, ITransport } from '@looker/sdk-rtl';
import { DefaultSettings, AuthSession } from '@looker/sdk-rtl';
import { NodeTransport } from '@looker/sdk-node';
import { defaultScopes, SheetSDK } from '../SheetSDK';

const credFile = path.join(
  __dirname,
  '../../../../examples/access-token-server/service_account.json'
);
const creds = fs.readFileSync(credFile, { encoding: 'utf-8' });
export const cred = JSON.parse(creds);
export const transport = new NodeTransport(DefaultSettings());
export const sheetTimeout = 10000;

export const getAuthToken = async (cred: any): Promise<string> => {
  const client = new JWT({
    email: cred.client_email,
    key: cred.private_key,
    scopes: defaultScopes,
  });

  const result = await client.getAccessToken();
  // console.log({ result })
  return result.token || '';
};

class TestAuthSession extends AuthSession {
  constructor(
    public readonly activeToken: string,
    settings: IApiSettings,
    transport: ITransport
  ) {
    super(settings, transport);
  }

  async authenticate(props: IRequestProps) {
    props.headers.Authorization = `Bearer ${this.activeToken}`;
    return props;
  }

  getToken() {
    return Promise.resolve(this.activeToken);
  }

  isAuthenticated(): boolean {
    return !!this.activeToken;
  }
}

export const initSheetSDK = async (keys = cred): Promise<SheetSDK> => {
  const token = await getAuthToken(keys);
  const settings = DefaultSettings();
  const transport = new NodeTransport(settings);
  const session = new TestAuthSession(token, settings, transport);
  const sheetSDK = new SheetSDK(session, cred.sheet_id);
  return sheetSDK;
};
