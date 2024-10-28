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

import type { DiffRow } from '@looker/sdk-codegen';
import { startCount } from '@looker/sdk-codegen';
import { api, api40 } from '../../test-data';
import { diffToSpec } from './diffUtils';

describe('diffUtils', () => {
  test('builds a psuedo spec from diff', () => {
    const delta: DiffRow[] = [
      {
        name: 'create_query',
        id: 'POST /create_query',
        diffCount: startCount(),
        bodyDiff: '',
        typeDiff: '',
        lStatus: 'stable',
        rStatus: 'beta',
        paramsDiff: '',
        responseDiff: '',
      },
      {
        name: 'search_dashboards',
        id: 'Get /search_dashboards',
        diffCount: startCount(),
        bodyDiff: '',
        typeDiff: '',
        lStatus: 'stable',
        rStatus: 'beta',
        paramsDiff: '',
        responseDiff: '',
      },
    ];
    const spec = diffToSpec(delta, api, api40);
    expect(Object.keys(spec.methods)).toEqual([
      'create_query',
      'search_dashboards',
    ]);
    expect(Object.keys(spec.tags)).toEqual(['Query', 'Dashboard']);
    expect(Object.keys(spec.types)).toEqual([]);
  });
});
