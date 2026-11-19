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

import { deepEqual, shallowClone } from './object_utils';

describe('object_utils', () => {
  describe('deepEqual', () => {
    it('compares primitives including NaN and signed zeros', () => {
      expect(deepEqual(1, 1)).toBe(true);
      expect(deepEqual(+0, -0)).toBe(true);
      expect(deepEqual(NaN, NaN)).toBe(true);
      expect(deepEqual('a', 'b')).toBe(false);
      expect(deepEqual(null, undefined)).toBe(false);
    });

    it('compares nested objects, symbol keys, arrays, dates, regexps, and errors', () => {
      const sym = Symbol('k');
      expect(
        deepEqual(
          { a: [1, { b: 2 }], [sym]: 'v' },
          { [sym]: 'v', a: [1, { b: 2 }] }
        )
      ).toBe(true);
      expect(deepEqual({ a: undefined }, { b: 1 })).toBe(false);
      expect(deepEqual(new Date(1000), new Date(1000))).toBe(true);
      expect(deepEqual(new Date(NaN), new Date(NaN))).toBe(true);
      expect(deepEqual(/abc/gi, /abc/gi)).toBe(true);
      expect(deepEqual(/abc/g, /abc/i)).toBe(false);
      expect(deepEqual(new TypeError('boom'), new TypeError('boom'))).toBe(
        true
      );
      expect(deepEqual(new TypeError('boom'), new RangeError('boom'))).toBe(
        false
      );
    });

    it('compares Maps, Sets, ArrayBuffers, DataViews, and TypedArrays', () => {
      const m1 = new Map<any, any>([
        [{ k: 1 }, 'a'],
        [{ k: 2 }, 'b'],
      ]);
      const m2 = new Map<any, any>([
        [{ k: 2 }, 'b'],
        [{ k: 1 }, 'a'],
      ]);
      expect(deepEqual(m1, m2)).toBe(true);

      const s1 = new Set([{ id: 1 }, { id: 2 }]);
      const s2 = new Set([{ id: 2 }, { id: 1 }]);
      expect(deepEqual(s1, s2)).toBe(true);

      const u1 = new Uint8Array([1, 2, 3]);
      const u2 = new Uint8Array([1, 2, 3]);
      const u3 = new Uint8Array([1, 2, 4]);
      expect(deepEqual(u1, u2)).toBe(true);
      expect(deepEqual(u1, u3)).toBe(false);
      expect(deepEqual(u1.buffer, u2.buffer)).toBe(true);
      expect(
        deepEqual(new DataView(u1.buffer, 1, 2), new DataView(u2.buffer, 1, 2))
      ).toBe(true);
    });

    it('handles circular references and custom constructors', () => {
      const a: any = { x: 1 };
      a.self = a;
      const b: any = { x: 1 };
      b.self = b;
      expect(deepEqual(a, b)).toBe(true);

      class Foo {
        v = 1;
      }
      class Bar {
        v = 1;
      }
      expect(deepEqual(new Foo(), new Foo())).toBe(true);
      expect(deepEqual(new Foo(), new Bar())).toBe(false);
    });
  });

  describe('shallowClone', () => {
    it('clones primitives, arrays, plain/custom objects, and symbol keys shallowly', () => {
      expect(shallowClone(42)).toBe(42);
      expect(shallowClone(null)).toBeNull();

      const inner = { nested: true };
      const sym = Symbol('tag');
      const src = { inner, [sym]: 99 };
      const copy = shallowClone(src);
      expect(copy).not.toBe(src);
      expect(copy).toEqual(src);
      expect(copy.inner).toBe(inner);
      expect(copy[sym]).toBe(99);

      const arr = [inner, 2];
      const arrCopy = shallowClone(arr);
      expect(arrCopy).not.toBe(arr);
      expect(arrCopy[0]).toBe(inner);

      const match = /a(b)/.exec('cab')!;
      const matchCopy = shallowClone(match);
      expect(matchCopy.index).toBe(1);
      expect(matchCopy.input).toBe('cab');
    });

    it('clones Dates, RegExps, Maps, Sets, Buffers, TypedArrays, and uncloneables', () => {
      const d = new Date(12345);
      const dCopy = shallowClone(d);
      expect(dCopy).not.toBe(d);
      expect(dCopy.getTime()).toBe(12345);

      const re = /test/gi;
      re.lastIndex = 3;
      const reCopy = shallowClone(re);
      expect(reCopy).not.toBe(re);
      expect(reCopy.source).toBe('test');
      expect(reCopy.flags).toBe('gi');
      expect(reCopy.lastIndex).toBe(3);

      const map = new Map([['a', { v: 1 }]]);
      const mapCopy = shallowClone(map);
      expect(mapCopy).not.toBe(map);
      expect(mapCopy.get('a')).toBe(map.get('a'));

      const set = new Set([{ v: 1 }]);
      const setCopy = shallowClone(set);
      expect(setCopy).not.toBe(set);
      expect(Array.from(setCopy)[0]).toBe(Array.from(set)[0]);

      const ta = new Uint16Array([10, 20]);
      const taCopy = shallowClone(ta);
      expect(taCopy).not.toBe(ta);
      expect(taCopy.buffer).toBe(ta.buffer);
      expect(Array.from(taCopy)).toEqual([10, 20]);

      expect(shallowClone(new Error('nope'))).toEqual({});
      expect(shallowClone(new WeakMap())).toEqual({});
      expect(shallowClone(() => 1)).toEqual({});
    });
  });
});
