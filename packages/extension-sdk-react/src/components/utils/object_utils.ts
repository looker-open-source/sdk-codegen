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

declare const Buffer:
  | {
      isBuffer?: (val: unknown) => boolean;
      from: (val: Uint8Array) => Uint8Array;
    }
  | undefined;

const toStringTag = (val: unknown): string =>
  Object.prototype.toString.call(val);

const hasOwn = (obj: object, key: PropertyKey): boolean =>
  Object.prototype.hasOwnProperty.call(obj, key);

const isObjectLike = (val: unknown): val is Record<PropertyKey, any> =>
  val !== null && typeof val === 'object';

const isObject = (val: unknown): val is Record<PropertyKey, any> =>
  val !== null && (typeof val === 'object' || typeof val === 'function');

const isNodeBuffer = (val: unknown): val is Uint8Array =>
  typeof Buffer !== 'undefined' && Boolean(Buffer?.isBuffer?.(val));

const isTypedArray = (val: unknown): boolean =>
  ArrayBuffer.isView(val) && !(val instanceof DataView) && !isNodeBuffer(val);

const getAllEnumerableKeys = (obj: object): Array<string | symbol> => [
  ...Object.keys(obj),
  ...Object.getOwnPropertySymbols(obj).filter(s =>
    Object.prototype.propertyIsEnumerable.call(obj, s)
  ),
];

const sameValueZero = (a: unknown, b: unknown): boolean =>
  a === b || (Number.isNaN(a) && Number.isNaN(b));

const equalArrays = (
  arrA: ArrayLike<unknown>,
  arrB: ArrayLike<unknown>,
  unordered: boolean,
  stack: Map<object, object>
): boolean => {
  if (arrA.length !== arrB.length) return false;

  const objA = arrA as unknown as object;
  const objB = arrB as unknown as object;
  if (stack.get(objA) && stack.get(objB)) {
    return stack.get(objA) === objB && stack.get(objB) === objA;
  }

  stack.set(objA, objB);
  stack.set(objB, objA);

  let result = true;
  const matched = unordered ? new Set<number>() : undefined;
  const listB = unordered ? Array.from(arrB) : undefined;

  for (let i = 0; i < arrA.length; i++) {
    const valA = arrA[i];
    if (matched && listB) {
      const idx = listB.findIndex(
        (valB, j) =>
          !matched.has(j) && (valA === valB || baseIsEqual(valA, valB, stack))
      );
      if (idx === -1) {
        result = false;
        break;
      }
      matched.add(idx);
    } else if (!(valA === arrB[i] || baseIsEqual(valA, arrB[i], stack))) {
      result = false;
      break;
    }
  }

  stack.delete(objA);
  stack.delete(objB);
  return result;
};

const equalByTag = (
  a: any,
  b: any,
  tag: string,
  stack: Map<object, object>
): boolean => {
  switch (tag) {
    case '[object DataView]':
      return (
        a.byteLength === b.byteLength &&
        a.byteOffset === b.byteOffset &&
        equalByTag(a.buffer, b.buffer, '[object ArrayBuffer]', stack)
      );
    case '[object ArrayBuffer]':
      return (
        a.byteLength === b.byteLength &&
        equalArrays(new Uint8Array(a), new Uint8Array(b), false, stack)
      );
    case '[object Boolean]':
    case '[object Date]':
    case '[object Number]':
      return sameValueZero(+a, +b);
    case '[object Error]':
      return a.name === b.name && a.message === b.message;
    case '[object RegExp]':
    case '[object String]':
      return `${a}` === `${b}`;
    case '[object Map]':
    case '[object Set]': {
      if (a.size !== b.size) return false;
      if (stack.get(a)) return stack.get(a) === b;
      stack.set(a, b);
      const isMap = tag === '[object Map]';
      const res = equalArrays(
        isMap ? Array.from(a.entries()) : Array.from(a),
        isMap ? Array.from(b.entries()) : Array.from(b),
        true,
        stack
      );
      stack.delete(a);
      return res;
    }
    case '[object Symbol]':
      return (
        Symbol.prototype.valueOf.call(a) === Symbol.prototype.valueOf.call(b)
      );
    default:
      return false;
  }
};

const equalObjects = (
  a: Record<PropertyKey, any>,
  b: Record<PropertyKey, any>,
  stack: Map<object, object>
): boolean => {
  const keysA = getAllEnumerableKeys(a);
  if (keysA.length !== getAllEnumerableKeys(b).length) return false;
  if (!keysA.every(k => hasOwn(b, k))) return false;

  if (stack.get(a) && stack.get(b)) {
    return stack.get(a) === b && stack.get(b) === a;
  }

  stack.set(a, b);
  stack.set(b, a);

  const result = keysA.every(
    k => a[k] === b[k] || baseIsEqual(a[k], b[k], stack)
  );
  const ctorA = a.constructor;
  const ctorB = b.constructor;
  const ctorMismatch =
    result &&
    !keysA.includes('constructor') &&
    ctorA !== ctorB &&
    'constructor' in a &&
    'constructor' in b &&
    !(
      typeof ctorA === 'function' &&
      ctorA instanceof ctorA &&
      typeof ctorB === 'function' &&
      ctorB instanceof ctorB
    );

  stack.delete(a);
  stack.delete(b);
  return result && !ctorMismatch;
};

const baseIsEqual = (
  a: unknown,
  b: unknown,
  stack?: Map<object, object>
): boolean => {
  if (a === b) return true;
  if (a == null || b == null || (!isObjectLike(a) && !isObjectLike(b))) {
    return Number.isNaN(a) && Number.isNaN(b);
  }

  const normalizeTag = (v: unknown): string => {
    if (Array.isArray(v)) return '[object Array]';
    const t = toStringTag(v);
    return t === '[object Arguments]' ? '[object Object]' : t;
  };

  const tagA = normalizeTag(a);
  const tagB = normalizeTag(b);
  if (tagA !== tagB) return false;

  const activeStack = stack ?? new Map<object, object>();
  const bufA = isNodeBuffer(a);
  if (bufA && !isNodeBuffer(b)) return false;

  if (bufA || Array.isArray(a) || isTypedArray(a)) {
    return equalArrays(
      a as unknown as ArrayLike<unknown>,
      b as unknown as ArrayLike<unknown>,
      false,
      activeStack
    );
  }
  if (tagA !== '[object Object]') {
    return equalByTag(a, b, tagA, activeStack);
  }
  return equalObjects(
    a as Record<PropertyKey, any>,
    b as Record<PropertyKey, any>,
    activeStack
  );
};

export const deepEqual = (a: unknown, b: unknown): boolean => baseIsEqual(a, b);

const isPrototype = (val: object): boolean => {
  const Ctor = (val as any).constructor;
  return (
    val === ((typeof Ctor === 'function' && Ctor.prototype) || Object.prototype)
  );
};

const copyOwnEnumerableProps = (
  source: Record<PropertyKey, any>,
  target: Record<PropertyKey, any>,
  indexLimit = 0
): void => {
  for (const key of getAllEnumerableKeys(source)) {
    if (
      indexLimit > 0 &&
      typeof key === 'string' &&
      /^(?:0|[1-9]\d*)$/.test(key) &&
      Number(key) < indexLimit
    ) {
      continue;
    }
    target[key] = source[key];
  }
};

export const shallowClone = <T>(value: T): T => {
  if (!isObject(value)) return value;

  if (Array.isArray(value)) {
    const result: any = new (value.constructor as ArrayConstructor)(
      value.length
    );
    if (
      value.length &&
      typeof value[0] === 'string' &&
      hasOwn(value, 'index')
    ) {
      result.index = (value as any).index;
      result.input = (value as any).input;
    }
    for (let i = 0; i < value.length; i++) result[i] = value[i];
    return result;
  }

  if (isNodeBuffer(value) && typeof Buffer !== 'undefined' && Buffer) {
    return Buffer.from(value) as unknown as T;
  }

  const tag = toStringTag(value);
  const isFunc = typeof value === 'function';

  if (tag === '[object Object]' || tag === '[object Arguments]' || isFunc) {
    const obj = value as unknown as Record<PropertyKey, any>;
    const result: Record<PropertyKey, any> =
      isFunc || tag === '[object Arguments]'
        ? {}
        : typeof obj.constructor === 'function' && !isPrototype(obj)
        ? Object.create(Object.getPrototypeOf(obj))
        : {};
    copyOwnEnumerableProps(obj, result);
    return result as T;
  }

  const Ctor = (value as any).constructor;
  let result: any;
  let indexLimit = 0;

  switch (tag) {
    case '[object ArrayBuffer]': {
      const buf = value as unknown as ArrayBuffer;
      result = new Ctor(buf.byteLength);
      new Uint8Array(result).set(new Uint8Array(buf));
      break;
    }
    case '[object Boolean]':
    case '[object Date]':
      result = new Ctor(+(value as any));
      break;
    case '[object DataView]': {
      const dv = value as unknown as DataView;
      result = new Ctor(dv.buffer, dv.byteOffset, dv.byteLength);
      break;
    }
    case '[object Number]':
      result = new Ctor(value);
      break;
    case '[object String]':
      result = new Ctor(value);
      indexLimit = (value as unknown as string).length;
      break;
    case '[object RegExp]': {
      const re = value as unknown as RegExp;
      result = new Ctor(re.source, /\w*$/.exec(String(re))?.[0] ?? '');
      result.lastIndex = re.lastIndex;
      break;
    }
    case '[object Symbol]':
      result = Object(Symbol.prototype.valueOf.call(value));
      break;
    case '[object Map]':
    case '[object Set]':
      result = new Ctor(value);
      break;
    default:
      if (isTypedArray(value)) {
        const ta = value as any;
        result = new Ctor(ta.buffer, ta.byteOffset, ta.length);
        indexLimit = ta.length;
      } else {
        return {} as T;
      }
  }

  copyOwnEnumerableProps(value as any, result, indexLimit);
  return result as T;
};
