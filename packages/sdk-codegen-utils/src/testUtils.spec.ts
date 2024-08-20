/*

 MIT License

 Copyright (c) 2023 Looker Data Sciences, Inc.

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

import path from 'path';
import { ApiConfigMap } from '@looker/sdk-rtl';
import {
  MeldSettings,
  getRootPath,
  loadApiSettings,
  lookUp,
  rootFile,
} from './testUtils';

describe('TestUtils', () => {
  const orig = MeldSettings.prototype.readConfig;

  afterEach(() => {
    MeldSettings.prototype.readConfig = orig;
  });

  describe('lookUp', () => {
    it('finds local file', () => {
      const local = 'testUtils.ts';
      const expected = path.join(__dirname, local);
      const actual = lookUp(local);
      expect(actual).toEqual(expected);
    });

    it('finds parent folder file', () => {
      const expected = path.join(__dirname, '../package.json');
      const actual = lookUp('package.json');
      expect(actual).toEqual(expected);
    });

    it('finds lock file in the root', () => {
      const lockFile = 'yarn.lock';
      const actual = lookUp(lockFile);
      const expected = rootFile(lockFile);
      expect(actual).toEqual(expected);
    });

    it('does not find $sillyfile$', () => {
      const actual = lookUp('$sillyfile$');
      expect(actual).toEqual('');
    });
  });

  it('loadApiSettings errors with no sdk configuration', () => {
    MeldSettings.prototype.readConfig = jest.fn().mockImplementation(() => {
      return {};
    });
    expect(() => loadApiSettings(getRootPath(), 'not.here')).toThrow(
      `Test SDK not initialized. Configure environment variables, 'cypress.env.json', or 'not.here'`
    );
  });

  it('loadApiSettings processes CYPRESS environment variables', () => {
    const envKey = ApiConfigMap('CYPRESS');
    const cyBase = 'https://cypress.looker.com:9995';
    const cyClient = 'cy_client';
    const cySecret = 'cy_secret';
    // populate environment variables
    process.env[envKey.base_url] = cyBase;
    process.env[envKey.client_id] = cyClient;
    process.env[envKey.client_secret] = cySecret;
    const actual = loadApiSettings(getRootPath(), 'not.there');
    expect(actual.base_url).toEqual(cyBase);
    const creds = actual.readConfig();
    expect(creds.client_id).toEqual(cyClient);
    expect(creds.client_secret).toEqual(cySecret);

    delete process.env[envKey.base_url];
    delete process.env[envKey.client_id];
    delete process.env[envKey.client_secret];
  });
});
