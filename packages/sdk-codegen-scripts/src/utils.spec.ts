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

import fs from 'fs';
import { codeGenerators } from '@looker/sdk-codegen';
import { doArgs, loadSpecs, prepGen } from './utils';

const mockIni = `
[Looker]
base_url=https://self-signed.looker.com:19999
client_id=id
`;

const mockVersions = {
  looker_release_version: '21.0.25',
  current_version: {
    version: '3.1',
    full_version: '3.1.0',
    status: 'current',
    swagger_url: 'https://self-signed.looker.com:19999/api/3.1/swagger.json',
  },
  supported_versions: [
    {
      version: '2.99',
      full_version: '2.99.0',
      status: 'internal_test',
      swagger_url: 'https://self-signed.looker.com:19999/api/2.99/swagger.json',
    },
    {
      version: '3.0',
      full_version: '3.0.0',
      status: 'legacy',
      swagger_url: 'https://self-signed.looker.com:19999/api/3.0/swagger.json',
    },
    {
      version: '3.1',
      full_version: '3.1.0',
      status: 'current',
      swagger_url: 'https://self-signed.looker.com:19999/api/3.1/swagger.json',
    },
    {
      version: '4.0',
      full_version: '4.0.21.0',
      status: 'experimental',
      swagger_url: 'https://self-signed.looker.com:19999/api/4.0/swagger.json',
    },
    {
      version: '4.0',
      full_version: '4.0.21.0',
      status: 'undocumented',
      swagger_url: 'https://self-signed.looker.com:19999/api/4.0/undoc.json',
    },
  ],
  api_server_url: 'https://self-signed.looker.com:19999',
};

describe.skip('utils', () => {
  jest.mock('fs');
  beforeAll(() => {
    jest.spyOn(fs, 'readFileSync').mockImplementation((path, _options) => {
      path = path.toString();
      if (path.match(/looker\.ini/)) return mockIni;
      if (path.match(/\.env/)) return '';
      return JSON.stringify(mockVersions);
    });
    jest.spyOn(fs, 'existsSync').mockImplementation((_path) => {
      return true;
    });
  });

  describe('doArgs', () => {
    test('no args', () => {
      const expLangs = codeGenerators
        .filter((l) => l.factory !== undefined)
        .map((l) => l.language);

      const actual = doArgs([]);
      expect(actual).toBeDefined();
      expect(actual.versions).toBeUndefined();
      expect(actual.languages).toEqual(expLangs);
    });
    test('ts,python,cs,typescript', () => {
      const expected = ['TypeScript', 'Python', 'Csharp'];

      const actual = doArgs(['ts,python,cs,typescript']);
      expect(actual).toBeDefined();
      expect(actual.versions).toBeUndefined();
      expect(actual.languages).toEqual(expected);
    });
    test('-v foo.json kotlin', () => {
      const expected = ['Kotlin'];
      const actual = doArgs('-v foo.json kotlin'.split(' '));
      expect(actual).toBeDefined();
      expect(actual.languages).toEqual(expected);
      expect(actual.versions).toEqual(mockVersions);
    });
    test('ts,py --versions foo.json kotlin', () => {
      const expected = ['TypeScript', 'Python', 'Kotlin'];
      const actual = doArgs('ts,py --versions foo.json kotlin'.split(' '));
      expect(actual).toBeDefined();
      expect(actual.languages).toEqual(expected);
      expect(actual.versions).toEqual(mockVersions);
    });
  });

  describe('prepGen', () => {
    test('default prepGen', async () => {
      const expLangs = codeGenerators
        .filter((l) => l.factory !== undefined)
        .map((l) => l.language);
      const release = mockVersions.looker_release_version
        .split('.', 2)
        .join('.');
      const actual = await prepGen([]);
      expect(actual).toBeDefined();
      expect(actual.languages).toEqual(expLangs);
      expect(actual.lookerVersion).toEqual(release);
      expect(actual.lookerVersions).toEqual(mockVersions);
      expect(actual.apis).toEqual(['3.1', '4.0']);
      expect(actual.name).toEqual('Looker');
      expect(actual.lastApi).toEqual('4.0');
      expect(actual.props.base_url).toEqual(
        'https://self-signed.looker.com:19999'
      );
    });
    test('prepGen ts', async () => {
      const expLangs = codeGenerators
        .filter((l) => l.factory !== undefined)
        .map((l) => l.language);
      const release = mockVersions.looker_release_version
        .split('.', 2)
        .join('.');
      const actual = await prepGen(['ts']);
      expect(actual).toBeDefined();
      expect(actual.languages).toEqual(expLangs);
      expect(actual.lookerVersion).toEqual(release);
      expect(actual.lookerVersions).toEqual(mockVersions);
      expect(actual.apis).toEqual(['3.1', '4.0']);
      expect(actual.name).toEqual('Looker');
      expect(actual.lastApi).toEqual('4.0');
      expect(actual.props.base_url).toEqual(
        'https://self-signed.looker.com:19999'
      );
    });
    test('-v foo.json ts', async () => {
      const langs = ['TypeScript'];
      const release = mockVersions.looker_release_version
        .split('.', 2)
        .join('.');
      const actual = await prepGen('-v foo.json ts'.split(' '));
      expect(actual).toBeDefined();
      expect(actual.languages).toEqual(langs);
      expect(actual.lookerVersion).toEqual(release);
      expect(actual.lookerVersions).toEqual(mockVersions);
      expect(actual.apis).toEqual(['3.1', '4.0']);
      expect(actual.name).toEqual('Looker');
      expect(actual.lastApi).toEqual('4.0');
      expect(actual.props.base_url).toEqual(
        'https://self-signed.looker.com:19999'
      );
    });
  });

  describe('loadSpecs', () => {
    test('load mockVersions', async () => {
      const config = await prepGen('-v foo.json'.split(' '));
      expect(config).toBeDefined();
      const actual = await loadSpecs(config, false);
      expect(actual).toBeDefined();
      expect(config.apis).toEqual(['3.1', '4.0', '4.0u']);
    });
    test('no version, with ts', async () => {
      const config = await prepGen(['ts']);
      expect(config).toBeDefined();
      const actual = await loadSpecs(config, false);
      expect(actual).toBeDefined();
      expect(config.apis).toEqual(['3.1', '4.0']);
    });
  });
});
