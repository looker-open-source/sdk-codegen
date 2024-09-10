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
// import 'whatwg-fetch';
import { ApiConfigMap, boolDefault, defaultTimeout } from '@looker/sdk-rtl';
import { TestConfig } from '@looker/sdk-codegen-utils';
import { NodeTransport } from './nodeTransport';
import { NodeSession } from './nodeSession';
import { ApiConfig, NodeSettings, NodeSettingsIniFile } from './nodeSettings';
import { specToModel } from '@looker/sdk-codegen';

const config = TestConfig(specToModel);
const envPrefix = 'LOOKERSDK';
const localIni = config.localIni;

describe('NodeSession', () => {
  const settings = new NodeSettingsIniFile(envPrefix, localIni, 'Looker');
  const transport = new NodeTransport(settings);

  describe('isAuthenticated', () => {
    it('unauthenticated logout returns false', async () => {
      const session = new NodeSession(settings, transport);
      expect(session.isAuthenticated()).toEqual(false);
      const actual = await session.logout();
      expect(actual).toEqual(false);
      expect(session.isAuthenticated()).toEqual(false);
    });
  });

  describe('integration tests', () => {
    it('initializes', () => {
      const session = new NodeSession(settings, transport);
      expect(session.settings).toEqual(settings);
      expect(session.isAuthenticated()).toEqual(false);
      expect(session.isSudo()).toEqual(false);
    });

    it('default auth logs in and out with good credentials', async () => {
      const session = new NodeSession(settings, transport);
      expect(session.isAuthenticated()).toEqual(false);
      const token = await session.login();
      expect(token).toBeDefined();
      expect(token.access_token).toBeDefined();
      expect(session.isAuthenticated()).toEqual(true);
      const result = await session.logout();
      expect(result).toEqual(true);
      expect(session.isAuthenticated()).toEqual(false);
    });
  });

  describe('environmental configuration', () => {
    it('no INI file', async () => {
      const section = ApiConfig(fs.readFileSync(localIni, 'utf8')).Looker;
      const verify_ssl = boolDefault(section.verify_ssl, false).toString();
      const envPrefix = 'LOOKERSDK';
      const envKey = ApiConfigMap(envPrefix);
      // populate environment variables
      process.env[envKey.timeout] =
        section.timeout || defaultTimeout.toString();
      process.env[envKey.client_id] = section.client_id;
      process.env[envKey.client_secret] = section.client_secret;
      process.env[envKey.base_url] = section.base_url;
      process.env[envKey.verify_ssl] = verify_ssl.toString();

      const settings = new NodeSettings(envPrefix);
      expect(settings.base_url).toEqual(section.base_url);
      expect(settings.timeout.toString()).toEqual(
        section.timeout || defaultTimeout.toString()
      );
      expect(settings.verify_ssl.toString()).toEqual(verify_ssl);

      const session = new NodeSession(settings, transport);
      expect(session.isAuthenticated()).toEqual(false);
      const token = await session.login();
      expect(token).toBeDefined();
      expect(token.access_token).toBeDefined();
      expect(session.isAuthenticated()).toEqual(true);
      const result = await session.logout();
      expect(result).toEqual(true);
      expect(session.isAuthenticated()).toEqual(false);

      // reset environment variables
      delete process.env[envKey.timeout];
      delete process.env[envKey.client_id];
      delete process.env[envKey.client_secret];
      delete process.env[envKey.base_url];
      delete process.env[envKey.verify_ssl];
    });
  });
});
