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

import { getInitialRouteEntries } from './get_initial_route_entries';

describe('getInitialRouteEntries', () => {
  it('returns undefined when no initial route', () => {
    expect(getInitialRouteEntries()).toBeUndefined();
  });

  it('returns pathname', () => {
    expect(getInitialRouteEntries({ route: '/abcd/wxyz' })).toEqual([
      { pathname: '/abcd/wxyz', search: '', hash: '', state: undefined },
    ]);
  });

  it('returns pathname and query string', () => {
    expect(getInitialRouteEntries({ route: '/abcd/wxyz?test=1234' })).toEqual([
      {
        pathname: '/abcd/wxyz',
        search: '?test=1234',
        hash: '',
        state: undefined,
      },
    ]);
  });

  it('returns pathname, query string and state', () => {
    expect(
      getInitialRouteEntries({
        route: '/abcd/wxyz?test=1234',
        routeState: { hello: 'world' },
      })
    ).toEqual([
      {
        pathname: '/abcd/wxyz',
        search: '?test=1234',
        hash: '',
        state: { hello: 'world' },
      },
    ]);
  });
});
