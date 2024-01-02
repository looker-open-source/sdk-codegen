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

import { TestConfig } from './testUtils';
import { ResponseMode, encodeParam, responseMode } from './transport';
import { DelimArray } from './delimArray';

const config = TestConfig();
const binaryTypes = config.testData.content_types.binary as [string];
const textTypes = config.testData.content_types.string as [string];

describe('Transport', () => {
  describe('Content Type mode', () => {
    it('binary', () => {
      binaryTypes.forEach((x) => {
        const actual = responseMode(x);
        if (actual !== ResponseMode.binary) {
          console.log(`${x} is not binary`);
        }
        expect(actual).toEqual(ResponseMode.binary);
      });
    });

    it('text or string', () => {
      textTypes.forEach((x) => {
        const actual = responseMode(x);
        if (actual !== ResponseMode.string) {
          console.log(`${x} is not text/string`);
        }
        expect(actual).toEqual(ResponseMode.string);
      });
    });
  });

  it('encodeParam', () => {
    const today = new Date('01 January 2020 14:48 UTC');
    const ra = new DelimArray([1, 2, 3]);
    expect(encodeParam(ra)).toEqual('1%2C2%2C3');
    expect(encodeParam(today)).toEqual('2020-01-01T14%3A48%3A00.000Z');
    expect(encodeParam('foo%2Fbar')).toEqual('foo%2Fbar');
    expect(encodeParam('foo/bar')).toEqual('foo%2Fbar');
    expect(encodeParam(true)).toEqual('true');
    expect(encodeParam(2.3)).toEqual('2.3');
    expect(encodeParam({ created_date: 'this year to second' })).toEqual(
      '{"created_date":"this year to second"}'
    );
  });
});
