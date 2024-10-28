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

import { api } from '../test-data';
import {
  buildMethodPath,
  buildPath,
  buildTypePath,
  getSceneType,
  isValidFilter,
} from './path';

describe('path utils', () => {
  const testParam = 's=test';
  describe('buildMethodPath', () => {
    test('it builds a method path', () => {
      const path = buildMethodPath('3.1', 'Dashboard', 'create_dashboard');
      expect(path).toEqual('/3.1/methods/Dashboard/create_dashboard');
    });
    test('it builds a method path with params', () => {
      const path = buildMethodPath(
        '3.1',
        'Dashboard',
        'create_dashboard',
        testParam
      );
      expect(path).toEqual(
        `/3.1/methods/Dashboard/create_dashboard?${testParam}`
      );
    });
  });

  describe('buildTypePath', () => {
    test('it builds a type path', () => {
      const path = buildTypePath('3.1', 'Dashboard', 'WriteDashboard');
      expect(path).toEqual('/3.1/types/Dashboard/WriteDashboard');
    });
    test('it builds a type path with params', () => {
      const path = buildTypePath(
        '3.1',
        'Dashboard',
        'create_dashboard',
        testParam
      );
      expect(path).toEqual(
        `/3.1/types/Dashboard/create_dashboard?${testParam}`
      );
    });
  });

  describe('buildPath', () => {
    test('given a method it builds a method path', () => {
      const path = buildPath(api, api.methods.create_dashboard, '3.1');
      expect(path).toEqual('/3.1/methods/Dashboard/create_dashboard');
    });

    test('given a type it creates a type path', () => {
      const path = buildPath(api, api.types.Dashboard, '3.1');
      expect(path).toEqual('/3.1/types/Dashboard/Dashboard');
    });
  });

  describe('getSceneType', () => {
    test('returns correct scene type given location with pathname', () => {
      const methodPath = '/3.1/methods/RandomMethod';
      const typePath = '/3.1/types/RandomType';
      expect(getSceneType(methodPath)).toEqual('methods');
      expect(getSceneType(typePath)).toEqual('types');
    });
    test('returns empty string if there is no scene type', () => {
      const noSceneTypePath = '/';
      expect(getSceneType(noSceneTypePath)).toEqual('');
    });
  });

  describe('isValidFilter', () => {
    const methodPath = '/3.1/methods/RandomMethod';
    const typePath = '/3.1/types/RandomType';

    test("validates 'all' as a valid filter for methods and types", () => {
      expect(isValidFilter(methodPath, 'ALL')).toBe(true);
      expect(isValidFilter(typePath, 'ALL')).toBe(true);
    });

    const methodFilters = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
    const typeFilters = ['SPECIFICATION', 'WRITE', 'REQUEST', 'ENUMERATED'];

    test.each(methodFilters)(
      'validates %s as a valid method filter',
      filter => {
        expect(isValidFilter(methodPath, filter)).toBe(true);
      }
    );

    test.each(methodFilters)(
      'invalidates %s when containing extra characters',
      filter => {
        expect(isValidFilter(methodPath, filter + 'x')).toBe(false);
      }
    );

    test.each(typeFilters)('validates %s as a valid type filter', filter => {
      expect(isValidFilter(typePath, filter)).toBe(true);
    });

    test.each(typeFilters)(
      'invalidates %s when containing extra characters',
      filter => {
        expect(isValidFilter(typePath, filter + 'x')).toBe(false);
      }
    );

    test('invalidates wrong parameter for methods and types', () => {
      expect(isValidFilter(methodPath, 'INVALID')).toBe(false);
      expect(isValidFilter(typePath, 'INVALID')).toBe(false);
    });

    test.each(typeFilters)('validates %s as a valid type filter', filter => {
      expect(isValidFilter(typePath, filter)).toBe(true);
    });
  });
});
