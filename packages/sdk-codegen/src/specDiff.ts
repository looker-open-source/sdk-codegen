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

import type {
  ArgValues,
  IApiModel,
  IMethod,
  IParameter,
  IType,
  KeyedCollection,
} from './sdkModels';
import { ArrayType, EnumType } from './sdkModels';

interface ITypeDelta {
  lhs: string;
  rhs: string;
}

enum DiffCompare {
  RightMissing = -1,
  Equal = 0,
  LeftMissing = 1,
}

export interface DiffCount {
  changed: number;
  added: number;
  removed: number;
}

export type TypeDelta = KeyedCollection<ITypeDelta>;

export type DiffTracker = (lKey: string, rKey: string) => number;

export const startCount = (): DiffCount => {
  return { changed: 0, added: 0, removed: 0 };
};

const diffCompare = (lKey: string, rKey: string) => {
  if (lKey && rKey) return lKey.localeCompare(rKey);
  if (lKey) return DiffCompare.RightMissing;
  return DiffCompare.LeftMissing;
};

export const countDiffs = (
  count: DiffCount,
  lKeys: string[],
  rKeys: string[],
  comparer: DiffTracker = diffCompare
) => {
  lKeys = lKeys.sort((a, b) => a.localeCompare(b));
  rKeys = rKeys.sort((a, b) => a.localeCompare(b));
  let l = 0;
  let r = 0;
  while (l < lKeys.length || r < rKeys.length) {
    const lk = lKeys[l];
    const rk = rKeys[r];
    const comp = comparer(lk, rk);
    switch (comp) {
      case DiffCompare.LeftMissing: {
        count.added++;
        r++;
        break;
      }
      case DiffCompare.RightMissing: {
        count.removed++;
        l++;
        break;
      }
      default: {
        l++;
        r++;
      }
    }
  }
  return count;
};

export const compareEnumTypes = (
  lType: IType,
  rType: IType,
  count: DiffCount
) => {
  const lNum = lType as EnumType;
  const rNum = rType as EnumType;
  const lKeys = lNum.values.map(v => v.toString());
  const rKeys = rNum.values.map(v => v.toString());
  countDiffs(count, lKeys, rKeys);
  const lVal = JSON.stringify(lKeys);
  const rVal = JSON.stringify(rKeys);
  if (lVal === rVal) return;
  return {
    lhs: lVal,
    rhs: rVal,
  };
};

/**
 * Compares two types and returns an object of non-matching entries
 * @param lType
 * @param rType
 * @param count change tracking
 */
export const compareTypes = (lType: IType, rType: IType, count: DiffCount) => {
  if (lType instanceof EnumType) {
    return compareEnumTypes(lType, rType, count);
  }

  if (lType instanceof ArrayType) {
    lType = lType.elementType;
  }

  if (rType instanceof ArrayType) {
    rType = rType.elementType;
  }

  if (lType.asHashString() === rType.asHashString()) return;

  const diff: TypeDelta = {};
  countDiffs(
    count,
    Object.keys(lType.properties),
    Object.keys(rType.properties),
    (lKey, rKey) => {
      const comp = diffCompare(lKey, rKey);
      switch (comp) {
        case DiffCompare.LeftMissing: {
          diff[rKey] = {
            lhs: '',
            rhs: rType.properties[rKey].summary(),
          };
          break;
        }
        case DiffCompare.RightMissing: {
          diff[lKey] = {
            lhs: lType.properties[lKey].summary(),
            rhs: '',
          };
          break;
        }
        default: {
          const lhsVal = lType.properties[lKey];
          const rhsVal = rType.properties[rKey];
          const lhs = lhsVal.summary();
          const rhs = rhsVal.summary();
          if (lhs !== rhs) {
            count.changed++;
            diff[lKey] = {
              lhs,
              rhs,
            };
          }
        }
      }
      return comp;
    }
  );
  if (Object.keys(diff).length === 0) return;
  return diff;
};

/**
 * Compares the params of two methods and returns the signature of both methods
 * if non matching.
 * @param lMethod
 * @param rMethod
 * @param count change tracking
 */
export const compareParams = (
  lMethod: IMethod,
  rMethod: IMethod,
  count: DiffCount
) => {
  const lParams: ArgValues = {};
  const rParams: ArgValues = {};
  lMethod.allParams.forEach((p: IParameter) => (lParams[p.name] = p));
  rMethod.allParams.forEach((p: IParameter) => (rParams[p.name] = p));
  // TODO typediff the matching body types?
  countDiffs(
    count,
    Object.keys(lParams),
    Object.keys(rParams),
    (lKey, rKey) => {
      const comp = diffCompare(lKey, rKey);
      if (comp === 0) {
        const lsh = lParams[lKey].signature();
        const rsh = rParams[rKey].signature();
        if (lsh !== rsh) {
          count.changed++;
        }
      }
      return comp;
    }
  );

  const lSignature = lMethod.signature();
  const rSignature = rMethod.signature();
  if (lSignature === rSignature) return;

  return {
    lhs: lSignature,
    rhs: rSignature,
  };
};

/**
 * Compares the bodies of two methods and returns diffs if there are any
 * @param lMethod
 * @param rMethod
 * @param count change tracking
 */
export const compareBodies = (
  lMethod: IMethod,
  rMethod: IMethod,
  count: DiffCount
) => {
  const lParams: ArgValues = {};
  const rParams: ArgValues = {};
  lMethod.bodyParams.forEach(p => (lParams[p.name] = p));
  rMethod.bodyParams.forEach(p => (rParams[p.name] = p));
  // TODO typediff the matching body types?
  countDiffs(count, Object.keys(lParams), Object.keys(rParams));

  const lSide = lMethod.bodyParams.map(p => {
    return {
      name: p.name,
      type: p.type.fullName,
      required: p.required,
    };
  });
  const rSide = rMethod.bodyParams.map(p => {
    return {
      name: p.name,
      type: p.type.fullName,
      required: p.required,
    };
  });

  if (JSON.stringify(lSide) === JSON.stringify(rSide)) return;

  count.changed++;
  return {
    lhs: lSide,
    rhs: rSide,
  };
};

/**
 * Compare two response lists, returning diff
 * @param lMethod
 * @param rMethod
 * @param count change tracking
 */
export const compareResponses = (
  lMethod: IMethod,
  rMethod: IMethod,
  count: DiffCount
) => {
  // TODO deep type comparison? Probably diff all types instead
  const lSide = lMethod.responses.map(r => {
    return {
      statusCode: r.statusCode,
      mediaType: r.mediaType,
      type: r.type.fullName,
    };
  });
  const rSide = rMethod.responses.map(r => {
    return {
      statusCode: r.statusCode,
      mediaType: r.mediaType,
      type: r.type.fullName,
    };
  });
  if (JSON.stringify(lSide) === JSON.stringify(rSide)) return;

  count.changed++;
  return {
    lhs: lSide,
    rhs: rSide,
  };
};

export const csvHeaderRow =
  'method name,"Op + URI",left status,right status,typeDiff,paramDiff,bodyDiff,responseDiff,diffCount';

export const csvDiffRow = (diff: DiffRow) => {
  const diffCount = JSON.stringify(diff.diffCount).replace(/"/g, `'`);
  return `
${diff.name},${diff.id},${diff.lStatus},${diff.rStatus},${diff.typeDiff},${diff.paramsDiff},${diff.bodyDiff},${diff.responseDiff},"${diffCount}"`;
};

export const mdHeaderRow = `
| method name  | Op + URI | 3.1 | 4.0 | typeDiff     | paramDiff | bodyDiff | responseDiff | diffCount |
| ------------ | -------- | --- | --- | ------------ | --------- | -------- | ------------ | --------- |`;

export const mdDiffRow = (diff: DiffRow) => `
| ${diff.name} | ${diff.id} | ${diff.lStatus} | ${diff.rStatus} | ${
  diff.typeDiff
} | ${diff.paramsDiff} | ${diff.bodyDiff} | ${
  diff.responseDiff
} | ${JSON.stringify(diff.diffCount)} |`;

const diffToString = (diff: any) => {
  if (!diff) return '';
  const result = JSON.stringify(diff, null, 2);
  if (result === '{}') return '';
  return `"${result.replace(/"/g, "'")}"`;
};

export interface ComputeDiffInputs {
  lMethod?: IMethod;
  rMethod?: IMethod;
}

export interface DiffRow {
  /** Method name */
  name: string;
  /** Method operation and path */
  id: string;
  /** Method status in both specs */
  lStatus: string;
  rStatus: string;
  /** Method type diff if any */
  typeDiff: string;
  /** Method params diff if any */
  paramsDiff: string;
  /** Body diff if any */
  bodyDiff: string;
  /** Response diff if any */
  responseDiff: string;
  /** Count of differences */
  diffCount: DiffCount;
}

/**
 * Computes the diff of two methods
 * @param lMethod
 * @param rMethod
 */
const computeDiff = (lMethod?: IMethod, rMethod?: IMethod): DiffRow => {
  if (!lMethod && !rMethod) throw new Error('At least one method is required.');

  const count = startCount();
  const countStatus = () => {
    if (!rMethod) {
      count.removed++;
    } else if (!lMethod) {
      count.added++;
    } else {
      if (lMethod.status !== rMethod.status) count.changed++;
    }
  };

  let result: DiffRow;
  countStatus();
  if (lMethod) {
    const typeDiff = rMethod
      ? diffToString(compareTypes(lMethod.type, rMethod.type, count))
      : '';
    const paramsDiff = rMethod
      ? diffToString(compareParams(lMethod, rMethod, count))
      : '';
    const bodyDiff = rMethod
      ? diffToString(compareBodies(lMethod, rMethod, count))
      : '';
    const responseDiff = rMethod
      ? diffToString(compareResponses(lMethod, rMethod, count))
      : '';
    result = {
      name: lMethod.name,
      id: lMethod.id,
      lStatus: lMethod.status,
      rStatus: rMethod ? rMethod.status : '',
      typeDiff,
      paramsDiff,
      bodyDiff,
      responseDiff,
      diffCount: count,
    };
  } else if (!lMethod && rMethod) {
    result = {
      name: rMethod.name,
      id: rMethod.id,
      lStatus: '',
      rStatus: rMethod.status,
      typeDiff: '',
      paramsDiff: '',
      bodyDiff: '',
      responseDiff: '',
      diffCount: count,
    };
  } else {
    result = {} as DiffRow;
  }

  return result;
};

export type DiffFilter = (
  delta: DiffRow,
  lMethod?: IMethod,
  rMethod?: IMethod
) => boolean;

/**
 * Include when:
 * - lMethod is missing
 * - rMethod is missing
 * - params differ
 * - types differ
 * @param delta
 * @param lMethod
 * @param rMethod
 */
export const includeDiffs: DiffFilter = (delta, lMethod, rMethod) =>
  !lMethod ||
  !rMethod ||
  delta.lStatus !== delta.rStatus ||
  !!delta.paramsDiff ||
  !!delta.typeDiff ||
  !!delta.bodyDiff ||
  !!delta.responseDiff;

/**
 * Compares two specs and returns a diff object
 * @param lSpec left-side spec
 * @param rSpec right-side spec
 * @param include evaluates to true if the comparison should be included
 */
export const compareSpecs = (
  lSpec: IApiModel,
  rSpec: IApiModel,
  include: DiffFilter = includeDiffs
) => {
  const specSort = (a: IMethod, b: IMethod) => a.id.localeCompare(b.id);

  const lMethods = Object.values(lSpec.methods).sort(specSort);
  const rMethods = Object.values(rSpec.methods).sort(specSort);

  const lLength = lMethods.length;
  const rLength = rMethods.length;
  let lIndex = 0;
  let rIndex = 0;
  const diff: DiffRow[] = [];

  while (lIndex < lLength || rIndex < rLength) {
    let lMethod: IMethod | undefined = lMethods[lIndex];
    let rMethod: IMethod | undefined = rMethods[rIndex];

    if (!lMethod) {
      rIndex++;
    } else if (!rMethod) {
      lIndex++;
    } else if (lMethod.id < rMethod.id) {
      rMethod = undefined;
      lIndex++;
    } else if (rMethod.id < lMethod.id) {
      lMethod = undefined;
      rIndex++;
    } else {
      lIndex++;
      rIndex++;
    }

    const delta = computeDiff(lMethod, rMethod);
    if (include(delta, lMethod, rMethod)) {
      diff.push(delta);
    }
  }
  return diff;
};
