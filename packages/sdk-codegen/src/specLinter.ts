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
import {
  IMethod,
  IType,
  KeyedCollection,
  SearchCriterion,
  TagList,
  IApiModel,
} from './sdkModels'

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
 * Compares two types and returns an object of non-matching entries
 * @param lMethod
 * @param rMethod
 */
export const compareMethods = (lMethod: IMethod, rMethod: IMethod) => {
  const lSignature = lMethod.signature()
  const rSignature = rMethod.signature()

  if (lSignature === rSignature) return

  return {
    lhs: lSignature,
    rhs: rSignature,
  }
}

const allMethods = (tags: TagList): Array<IMethod> => {
  const result: Array<IMethod> = []
  Object.entries(tags).forEach(([, methods]) => {
    Object.entries(methods).forEach(([, method]) => {
      result.push(method)
    })
  })
  return result
}

const csvHeaderRow =
  'method name,path,left status,right status,typeDiff,paramDiff'

const csvLintRow = (
  lMethod: IMethod,
  rMethod?: IMethod,
  typeChanges?: string,
  paramChanges?: string
) => `
${lMethod.name},${lMethod.endpoint},${lMethod.status},${
  rMethod?.status || ''
},${typeChanges},${paramChanges}`

// const mdHeaderRow = `
// | method name  | path | 3.1 | 4.0 | typeDiff
// | ------------ | ---- | --- | --- | ------------`

// const mdLintRow = (
//   method31: IMethod,
//   method40?: IMethod,
//   typeChanges?: string
// ) => `
//   | ${method31.name} | ${method31.endpoint} | ${method31.status} | ${
//   method40?.status || ''
// } | ${typeChanges} || '' |`

const diffToString = (diff: any) =>
  `"${JSON.stringify(diff, null, 2).replace(/"/g, "'")}."`

/**
 * Given two specs, compares each method's params and response type, and returns
 * a string representing representing a csv containing the difference if any
 * @param lSpec
 * @param rSpec
 */
export const compareSpecs = (lSpec: IApiModel, rSpec: IApiModel) => {
  const criteria = new Set<SearchCriterion>([SearchCriterion.status])
  const lBeta = lSpec.search('beta', criteria)
  const lMethods = allMethods(lBeta.tags)
  const rMethods = Object.values(rSpec.methods)

  let result = csvHeaderRow
  lMethods.forEach((lMethod) => {
    const found = rMethods.find((rMethod) => lMethod.id === rMethod.id)
    let typeChanges = ''
    let paramChanges = ''
    if (found) {
      const typeDelta = compareTypes(lMethod.type, found.type)
      typeChanges = typeDelta ? diffToString(typeDelta) : ''
      const paramDelta = compareMethods(lMethod, found)
      paramChanges = paramDelta ? diffToString(paramDelta) : ''
    }
    result += csvLintRow(lMethod, found, typeChanges, paramChanges)
  })

  return result
}
