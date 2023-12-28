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

import { DelimArray } from './delimArray';

describe('DelimArray', () => {
  it('empty values work', () => {
    const values = new DelimArray<number>();
    const actual = values.toString();
    const expected = '';
    expect(actual).toEqual(expected);
  });

  it('integers', () => {
    const numbers = [1, 2, 3, 4];
    let values = new DelimArray<number>(numbers);
    const expected = '1,2,3,4';
    let actual = values.toString();
    const normal = `${numbers}`;
    expect(normal).toEqual(expected);
    expect(actual).toEqual(expected);
    values = new DelimArray<number>(numbers, ' ', '{', '}');
    actual = values.toString();
    expect(actual).toEqual('{1 2 3 4}');
  });

  it('integer', () => {
    const numbers = [2];
    let values = new DelimArray<number>(numbers);
    const expected = '2';
    let actual = values.toString();
    const normal = `${numbers}`;
    expect(normal).toEqual(expected);
    expect(actual).toEqual(expected);
    values = new DelimArray<number>(numbers, ' ', '{', '}');
    actual = values.toString();
    expect(actual).toEqual('{2}');
  });

  it('strings', () => {
    const strings = ['a', 'b', 'c', 'd'];
    let values = new DelimArray<string>(strings);
    const expected = 'a,b,c,d';
    let actual = values.toString();
    const normal = `${strings}`;
    expect(normal).toEqual(expected);
    expect(actual).toEqual(expected);
    values = new DelimArray<string>(strings, '|', '{', '}');
    actual = values.toString();
    expect(actual).toEqual('{a|b|c|d}');
  });
});
