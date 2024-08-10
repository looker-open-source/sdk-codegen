/**
 * Copyright (c) 2024 Google LLC
 * SPDX-License-Identifier: MIT
 */

import path from 'path';
import {
  lookUp,
  getRootPath,
  loadApiSettings,
  MeldSettings,
  rootFile,
} from './testUtils';
import { ApiConfigMap } from '@looker/sdk-rtl';

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

    it('finds package-lock.json in the root', () => {
      const actual = lookUp('package-lock.json');
      const expected = rootFile('package-lock.json');
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
