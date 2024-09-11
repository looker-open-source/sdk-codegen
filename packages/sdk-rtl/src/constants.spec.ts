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
import { boolDefault, isFalse, isTrue, unquote } from './constants';
import { ResponseMode, responseMode } from './transport';

const config = TestConfig();
const contentTypes = config.testData.content_types;
const binaryTypes: string[] = contentTypes.binary;
const stringTypes: string[] = contentTypes.string;

describe('Constants functions', () => {
  it('isTrue', () => {
    expect(isTrue('y')).toEqual(true);
    expect(isTrue('Y')).toEqual(true);
    expect(isTrue('yes')).toEqual(true);
    expect(isTrue('Yes')).toEqual(true);
    expect(isTrue('YeS')).toEqual(true);
    expect(isTrue('Yes sir')).toEqual(false);
    expect(isTrue('YES')).toEqual(true);
    expect(isTrue('true')).toEqual(true);
    expect(isTrue('True')).toEqual(true);
    expect(isTrue('True dat')).toEqual(false);
    expect(isTrue('TRUE')).toEqual(true);
    expect(isTrue('t')).toEqual(true);
    expect(isTrue('T')).toEqual(true);
    expect(isTrue('1')).toEqual(true);
    expect(isTrue('')).toEqual(false);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(isTrue(undefined)).toEqual(false);
  });

  it('isFalse', () => {
    expect(isFalse('f')).toEqual(true);
    expect(isFalse('F')).toEqual(true);
    expect(isFalse('no')).toEqual(true);
    expect(isFalse('NO')).toEqual(true);
    expect(isFalse('NOPE')).toEqual(false);
    expect(isFalse('false')).toEqual(true);
    expect(isFalse('False')).toEqual(true);
    expect(isFalse('FALSE')).toEqual(true);
    expect(isFalse('f')).toEqual(true);
    expect(isFalse('F')).toEqual(true);
    expect(isFalse('0')).toEqual(true);
    expect(isFalse('')).toEqual(false);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(isFalse(undefined)).toEqual(false);
  });

  it('boolDefault', () => {
    expect(boolDefault('f', true)).toEqual(false);
    expect(boolDefault('t', false)).toEqual(true);
    expect(boolDefault('f')).toEqual(false);
    expect(boolDefault('t')).toEqual(true);
    expect(boolDefault('')).toEqual(false);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(boolDefault(undefined, false)).toEqual(false);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(boolDefault(undefined, true)).toEqual(true);
  });

  it('unquote', () => {
    expect(unquote('`foo`')).toEqual('foo');
    expect(unquote('foo`')).toEqual('foo`');
    expect(unquote('`foo')).toEqual('`foo');
    expect(unquote("'foo'")).toEqual('foo');
    expect(unquote("foo'")).toEqual("foo'");
    expect(unquote("'foo")).toEqual("'foo");
    expect(unquote('"foo"')).toEqual('foo');
    expect(unquote('foo"')).toEqual('foo"');
    expect(unquote('"foo')).toEqual('"foo');
  });

  it('string types match', () => {
    stringTypes.forEach(t => {
      const mode = responseMode(t);
      expect(mode).toEqual(ResponseMode.string);
    });
  });

  it('binary types match', () => {
    binaryTypes.forEach(t => {
      const mode = responseMode(t);
      expect(mode).toEqual(ResponseMode.binary);
    });
  });
});
