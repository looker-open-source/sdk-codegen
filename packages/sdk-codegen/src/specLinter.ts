/*

 MIT License

 Copyright (c) 2020 Looker Data Sciences, Inc.

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
import { IMethod, IType, KeyedCollection, IApiModel } from './sdkModels'

interface ITypeDelta {
  lhs: string
  rhs: string
}

export type TypeDelta = KeyedCollection<ITypeDelta>

/**
 * Compares two types and returns an object of non-matching entries
 * @param lType
 * @param rType
 */
export const compareTypes = (lType: IType, rType: IType) => {
  if (lType.asHashString() === rType.asHashString()) return

  const diff: TypeDelta = {}
  Object.entries(lType.properties).forEach(([key, lhsVal]) => {
    const rhsVal = rType.properties[key]
    if (rhsVal) {
      const lhs = lhsVal.summary()
      const rhs = rhsVal.summary()
      if (lhs !== rhs) {
        diff[key] = {
          lhs,
          rhs,
        }
      }
    }
  })
  if (Object.keys(diff).length === 0) return
  return diff
}

/**
 * Compares the params of two methods and returns the signature of both methods
 * if non matching.
 * @param lMethod
 * @param rMethod
 */
export const compareParams = (lMethod: IMethod, rMethod: IMethod) => {
  const lSignature = lMethod.signature()
  const rSignature = rMethod.signature()

  if (lSignature === rSignature) return

  return {
    lhs: lSignature,
    rhs: rSignature,
  }
}

export const csvHeaderRow =
  'method name,"Op + URI",left status,right status,typeDiff,paramDiff'

export const csvDiffRow = (diff: DiffRow) => `
${diff.name},${diff.id},${diff.lStatus},${diff.rStatus},${diff.typeDiff},${diff.paramsDiff}`

export const mdHeaderRow = `
| method name  | Op + URI | 3.1 | 4.0 | typeDiff
| ------------ | -------- | --- | --- | ------------`

export const mdDiffRow = (diff: DiffRow) => `
  | ${diff.name} | ${diff.id} | ${diff.lStatus} | ${diff.rStatus} | ${diff.typeDiff} | ${diff.paramsDiff} |`

const diffToString = (diff: any) =>
  diff ? `"${JSON.stringify(diff, null, 2).replace(/"/g, "'")}."` : ''

export interface ComputeDiffInputs {
  lMethod?: IMethod
  rMethod?: IMethod
}

interface DiffRow {
  /** Method name */
  name: string
  /** Method operation and path */
  id: string
  /** Method status in both specs */
  lStatus: string
  rStatus: string
  /** Method type diff if any */
  typeDiff: string
  /** Method params diff if any */
  paramsDiff: string
}

/**
 * Computes the diff of two methods
 * @param lMethod
 * @param rMethod
 */
const computeDiff = (lMethod?: IMethod, rMethod?: IMethod) => {
  if (!lMethod && !rMethod) throw new Error('At least one method is required.')

  let result: DiffRow
  if (lMethod) {
    result = {
      name: lMethod.name,
      id: lMethod.id,
      lStatus: lMethod.status,
      rStatus: rMethod ? rMethod.status : '',
      typeDiff: rMethod
        ? diffToString(compareTypes(lMethod.type, rMethod.type))
        : '',
      paramsDiff: rMethod ? diffToString(compareParams(lMethod, rMethod)) : '',
    }
  } else if (!lMethod && rMethod) {
    result = {
      name: rMethod.name,
      id: rMethod.id,
      lStatus: '',
      rStatus: rMethod.status,
      typeDiff: '',
      paramsDiff: '',
    }
  }

  return result!
}

export type DiffFilter = (lMethod?: IMethod, rMethod?: IMethod) => boolean

const diffAll: DiffFilter = () => true
/**
 * Compares two specs and returns a diff object
 * @param lSpec
 * @param rSpec
 * @param filter
 */
export const compareSpecs = (
  lSpec: IApiModel,
  rSpec: IApiModel,
  filter: DiffFilter = diffAll
) => {
  const specSort = (a: IMethod, b: IMethod) => a.id.localeCompare(b.id)

  const lMethods = Object.values(lSpec.methods).sort(specSort)
  const rMethods = Object.values(rSpec.methods).sort(specSort)

  const lLength = lMethods.length
  const rLength = rMethods.length
  let lIndex = 0
  let rIndex = 0
  const diff: DiffRow[] = []

  while (lIndex < lLength || rIndex < rLength) {
    let lMethod: IMethod | undefined = lMethods[lIndex]
    let rMethod: IMethod | undefined = rMethods[rIndex]

    if (!lMethod) {
      rIndex++
    } else if (!rMethod) {
      lIndex++
    } else if (lMethod.id < rMethod.id) {
      rMethod = undefined
      lIndex++
    } else if (rMethod.id < lMethod.id) {
      lMethod = undefined
      rIndex++
    } else {
      lIndex++
      rIndex++
    }

    if (filter(lMethod, rMethod)) {
      const delta = computeDiff(lMethod, rMethod)
      diff.push(delta)
    }
  }
  return diff
}
