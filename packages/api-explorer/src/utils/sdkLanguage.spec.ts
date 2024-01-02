/*

 MIT License

 Copyright (c) 2022 Looker Data Sciences, Inc.

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

import { codeGenerators } from '@looker/sdk-codegen';
import { allSdkLanguages, findSdk } from '../utils';
import { sdkLanguageMapping } from '../test-data';

describe('SDK Language Utils', () => {
  test('allSdkLanguages gets all sdk languages', () => {
    const actual = allSdkLanguages();
    const aliases = Object.keys(actual);
    expect(Object.keys(actual)).toHaveLength(codeGenerators.length + 1);
    aliases.forEach((alias) =>
      expect(actual[alias]).toEqual((sdkLanguageMapping as any)[alias])
    );
  });

  describe('findSdk', () => {
    test('it is not case sensitive', () => {
      const actual = findSdk('pY');
      expect(actual.language).toEqual('Python');
    });

    test("it returns 'All' option if provided bogus input", () => {
      const actual = findSdk('random');
      expect(actual.language).toEqual('All');
      expect(actual.alias).toEqual('all');
    });

    test.each(Object.entries(sdkLanguageMapping))(
      `it finds language for alias %s`,
      (alias, language) => {
        const actual = findSdk(alias);
        expect(actual.language).toEqual(language);
      }
    );

    test.each(Object.entries(sdkLanguageMapping))(
      `it finds alias for language %s`,
      (alias, language) => {
        const actual = findSdk(language);
        expect(actual.alias).toEqual(alias);
      }
    );
  });
});
