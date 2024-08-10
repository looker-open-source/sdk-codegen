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

import { findGenerator, getCodeGenerator } from './codeGenerators';
import { TestConfig } from '@looker/sdk-codegen-utils';
const config = TestConfig();

describe('generator factory', () => {
  describe('findGenerator', () => {
    const typeScript = 'TypeScript';
    const kotlin = 'Kotlin';
    const csharp = 'C#';
    it('returns undefined for invalid language', () => {
      const actual = findGenerator('not here');
      expect(actual).not.toBeDefined();
    });
    it('returns undefined for empty target', () => {
      const actual = findGenerator('');
      expect(actual).not.toBeDefined();
    });
    it('returns generator by language name', () => {
      const actual = findGenerator('csharp');
      expect(actual).toBeDefined();
      expect(actual?.language).toEqual(csharp);
    });
    it('returns generator with language name in any casing', () => {
      let actual = findGenerator(kotlin);
      expect(actual).toBeDefined();
      expect(actual?.language).toEqual(kotlin);
      actual = findGenerator('kotlin');
      expect(actual).toBeDefined();
      expect(actual?.language).toEqual(kotlin);
      actual = findGenerator('KOTLIN');
      expect(actual).toBeDefined();
      expect(actual?.language).toEqual(kotlin);
    });
    it('returns generator by language label', () => {
      const actual = findGenerator('c#');
      expect(actual).toBeDefined();
      expect(actual?.language).toEqual(csharp);
    });
    it('returns generator by file extension', () => {
      let actual = findGenerator('.ts');
      expect(actual).toBeDefined();
      expect(actual?.language).toEqual(typeScript);
      actual = findGenerator('.TSX');
      expect(actual).toBeDefined();
      expect(actual?.language).toEqual(typeScript);
    });
    it('returns generator by implicit file extension', () => {
      let actual = findGenerator('ts');
      expect(actual).toBeDefined();
      expect(actual?.language).toEqual(typeScript);
      actual = findGenerator('TSX');
      expect(actual).toBeDefined();
      expect(actual?.language).toEqual(typeScript);
    });
  });

  describe('getCodeGenerator', () => {
    it('creates a code generator for a valid language name', () => {
      const actual = getCodeGenerator('csharp', config.apiTestModel);
      expect(actual).toBeDefined();
      expect(actual?.fileExtension).toEqual('.cs');
    });
    it('creates a code generator for a valid language label', () => {
      const actual = getCodeGenerator('c#', config.apiTestModel);
      expect(actual).toBeDefined();
      expect(actual?.fileExtension).toEqual('.cs');
    });
    it('returns undefined for an invalid language name', () => {
      const actual = getCodeGenerator('not here', config.apiTestModel);
      expect(actual).not.toBeDefined();
    });
  });
});
