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

// import * as fs from 'fs';
// import 'whatwg-fetch';
import type { IApiSettings } from '@looker/sdk-rtl';
import { ApiConfigMap } from '@looker/sdk-rtl';
import { TestConfig } from '@looker/sdk-codegen-utils';
import { ApiConfig, NodeSettings, NodeSettingsIniFile } from './nodeSettings';
import { specToModel } from '@looker/sdk-codegen';
const mockIni = `
[Looker]
base_url=https\x58//self-signed.looker.com:19999
client_id=id
client_secret=secret
verify_ssl=false
timeout=31
[Looker31]
base_url=https\x58//self-signed.looker.com:19999
verify_ssl=False
timeout=30
`;

jest.mock('fs', () => {
  const original = jest.requireActual('fs');
  return {
    ...original,
    existsSync: (path: string) => {
      if (path === 'mock.ini') return true;
      if (path === 'missing.ini') return false;
      return original.existsSync(path);
    },
    readFileSync: (path: string, options: any) => {
      if (path === 'mock.ini') return mockIni;
      return original.readFileSync(path, options);
    },
  };
});

const server = 'https\x58//self-signed.looker.com:19999';

const envPrefix = 'LOOKERSDK';
const section2 = 'Looker31';

describe('NodeSettings', () => {
  let config: ReturnType<typeof TestConfig>;

  beforeAll(() => {
    config = TestConfig(specToModel);
  });

  describe('ApiConfig', () => {
    it('discovers multiple sections', () => {
      const conf = ApiConfig(mockIni);
      expect(Object.keys(conf)).toEqual(['Looker', section2]);
    });
  });

  describe('NodeSettingsIni', () => {
    beforeAll(() => {
      // clear any environment variables
      const envKey = ApiConfigMap(envPrefix);
      delete process.env[envKey.timeout];
      delete process.env[envKey.client_id];
      delete process.env[envKey.client_secret];
      delete process.env[envKey.base_url];
      delete process.env[envKey.verify_ssl];
    });

    it('settings default to the first section', () => {
      const settings = new NodeSettings(envPrefix, mockIni);
      expect(settings.timeout).toEqual(31);
      expect(settings.verify_ssl).toEqual(false);
    });

    it('retrieves the first section by name', () => {
      const settings = new NodeSettings(envPrefix, mockIni, 'Looker');
      expect(settings.timeout).toEqual(31);
    });

    it('retrieves the second section by name', () => {
      const settings = new NodeSettings(envPrefix, mockIni, section2);
      expect(settings.timeout).toEqual(30);
      expect(settings.verify_ssl).toEqual(false);
    });

    it('fails with a bad section name', () => {
      expect(
        () => new NodeSettings(envPrefix, mockIni, 'NotAGoodLookForYou')
      ).toThrow(/No section named "NotAGoodLookForYou"/);
    });
  });

  describe('NodeSettingsEnv', () => {
    beforeAll(() => {
      const envKey = ApiConfigMap(envPrefix);
      process.env[envKey.timeout] = '30';
      process.env[envKey.client_id] = 'client_id';
      process.env[envKey.client_secret] = 'client_secret';
      process.env[envKey.base_url] = server;
      process.env[envKey.verify_ssl] = 'false';
    });

    afterAll(() => {
      // reset environment variables
      const envKey = ApiConfigMap(envPrefix);
      delete process.env[envKey.timeout];
      delete process.env[envKey.client_id];
      delete process.env[envKey.client_secret];
      delete process.env[envKey.base_url];
      delete process.env[envKey.verify_ssl];
    });

    it('settings are retrieved from environment variables', () => {
      const settings = new NodeSettings(envPrefix);
      expect(settings.base_url).toEqual(server);
      expect(settings.timeout).toEqual(30);
      expect(settings.verify_ssl).toEqual(false);
    });

    it('empty file name uses environment variables', () => {
      const settings = new NodeSettingsIniFile(envPrefix);
      expect(settings.base_url).toEqual(server);
      expect(settings.timeout).toEqual(30);
      expect(settings.verify_ssl).toEqual(false);
    });

    it('partial INI uses environment variables', () => {
      const settings = new NodeSettings(envPrefix, {
        base_url: server,
      } as IApiSettings);
      expect(settings.base_url).toEqual(server);
      expect(settings.timeout).toEqual(30);
      expect(settings.verify_ssl).toEqual(false);
      const creds = settings.readConfig();
      expect(creds.client_id).toBeDefined();
      expect(creds.client_secret).toBeDefined();
    });

    it('environment variables override ini values', () => {
      const envKey = ApiConfigMap(envPrefix);
      process.env[envKey.timeout] = '66';
      process.env[envKey.verify_ssl] = '1';
      const settings = new NodeSettingsIniFile(envPrefix, config.testIni);
      expect(settings.base_url).toEqual(server);
      expect(settings.timeout).toEqual(66);
      expect(settings.verify_ssl).toEqual(true);
      // process.env[strLookerTimeout] = config.testSection['timeout'] || defaultTimeout.toString()
      // process.env[strLookerVerifySsl] = verifySsl.toString()
    });
  });

  describe('NodeSettingsIniFile', () => {
    beforeEach(() => {
      const envKey = ApiConfigMap(envPrefix);
      delete process.env[envKey.timeout];
      delete process.env[envKey.verify_ssl];
      delete process.env[envKey.base_url];
    });

    it('settings default to the first section', () => {
      const settings = new NodeSettingsIniFile(envPrefix, 'mock.ini');
      expect(settings.timeout).toEqual(31);
      expect(settings.verify_ssl).toEqual(false);
    });

    it('retrieves the first section by name', () => {
      const settings = new NodeSettingsIniFile(envPrefix, 'mock.ini', 'Looker');
      expect(settings.timeout).toEqual(31);
      expect(settings.verify_ssl).toEqual(false);
    });

    it('retrieves the second section by name', () => {
      const settings = new NodeSettingsIniFile(envPrefix, 'mock.ini', section2);
      expect(settings.timeout).toEqual(30);
      expect(settings.verify_ssl).toEqual(false);
    });

    it('fails with a bad section name', () => {
      expect(
        () =>
          new NodeSettingsIniFile(envPrefix, 'mock.ini', 'NotAGoodLookForYou')
      ).toThrow(/No section named "NotAGoodLookForYou"/);
    });

    it('fails with a bad file name', () => {
      expect(
        () =>
          new NodeSettingsIniFile(
            envPrefix,
            'missing.ini',
            'NotAGoodLookForYou'
          )
      ).toThrow(/File missing.ini was not found/);
    });
  });
});
