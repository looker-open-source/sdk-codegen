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

import { readFileSync } from 'fs'
import { cloneDeep, pick } from 'lodash'
import { OperationObject } from 'openapi3-ts'

import {
  compareParams,
  compareSpecs,
  compareTypes,
  DiffRow,
  includeDiffs,
} from './specDiff'
import { rootFile, TestConfig } from './testUtils'
import {
  PropertyList,
  Type,
  Method,
  Parameter,
  IApiModel,
  ApiModel,
  IMethod,
} from './sdkModels'

const config = TestConfig()
const apiTestModel = config.apiTestModel

/**
 * Returns an array containing the key and the value of the first enumerable object property
 * @param props A key/value collection of type properties
 */
const firstProperty = (props: PropertyList) =>
  cloneDeep(Object.entries(props)[0])

/**
 * Changes the name and inverts the required property of the given type
 * @param type
 */
const changeType = (type: Type) => {
  const result = new Type(type.schema, type.name)
  Object.entries(type.properties).forEach(([propKey, propVal]) => {
    result.properties[propKey] = propVal
  })
  const [name, value] = firstProperty(result.properties)
  value.required = !value.required
  result.properties[name] = value
  return result
}

/**
 * Inverts the required property for the first param of the given method
 * @param method
 */
const changeParams = (method: Method) => {
  const params = cloneDeep(method.params)
  const changedParams = []
  params.forEach((param) => {
    changedParams.push(new Parameter(param, param.type))
  })
  params[0].required = !params[0].required
  return params
}

/**
 * Returns a copy of the given method with changes to the first param and first
 * type property
 * @param method
 */
export const changeMethod = (method: Method) => {
  const params = changeParams(method)

  const result = new Method(
    apiTestModel,
    method.httpMethod,
    method.endpoint,
    method.schema as OperationObject,
    params,
    method.responses
  )
  result.type = changeType(result.type as Type)
  return result
}

describe('spec differ', () => {
  describe('compareTypes', () => {
    const lType = apiTestModel.types.Dashboard

    it('should return undefined if types are identical', () => {
      const actual = compareTypes(lType, lType)
      expect(actual).toBeUndefined()
    })

    it('should return an object containing all non matching entries', () => {
      const [key, lProp] = firstProperty(lType.properties)
      const rType = changeType(lType as Type)
      const actual = compareTypes(lType, rType)
      expect(actual).toBeDefined()
      if (actual) {
        expect(actual[key]).toBeDefined()
        expect(actual[key].lhs).toEqual(lProp.summary())
        expect(actual[key].rhs).toEqual(
          firstProperty(rType.properties)[1].summary()
        )
      }
    })
  })

  describe('compareParams', () => {
    const lMethod = apiTestModel.methods.create_look

    it('should return undefined if methods are identical', () => {
      const actual = compareParams(lMethod, lMethod)
      expect(actual).toBeUndefined()
    })

    it('should return an object containing all non matching entries', () => {
      const rMethod = changeMethod(lMethod as Method)
      const actual = compareParams(lMethod, rMethod)
      expect(actual).toBeDefined()
      if (actual) {
        expect(actual.lhs).toEqual(lMethod.signature())
        expect(actual.rhs).toEqual(rMethod.signature())
      }
    })
  })

  describe('compareSpecs', () => {
    let lSpec: IApiModel
    let rSpec: IApiModel
    beforeEach(() => {
      lSpec = cloneDeep(apiTestModel)
      rSpec = cloneDeep(apiTestModel)
    })

    it('should compare two identical specs', () => {
      const actual = compareSpecs(lSpec, lSpec)
      expect(actual).toBeDefined()
      expect(actual).toHaveLength(0)
    })

    it('should compare two specs with no overlap', () => {
      const lMethod = lSpec.methods.create_look
      const rMethod = rSpec.methods.create_query
      lSpec.methods = { create_look: lMethod }
      rSpec.methods = { create_query: rMethod }
      const actual = compareSpecs(lSpec, rSpec)
      expect(actual).toBeDefined()
      expect(actual).toHaveLength(2)
      // TODO get this working again
      expect(actual).toEqual(
        expect.arrayContaining([
          {
            bodyDiff: '',
            name: lMethod.name,
            id: lMethod.id,
            lStatus: lMethod.status,
            rStatus: '',
            responseDiff: '',
            typeDiff: '',
            paramsDiff: '',
          },
          {
            bodyDiff: '',
            name: rMethod.name,
            id: rMethod.id,
            lStatus: '',
            rStatus: rMethod.status,
            responseDiff: '',
            typeDiff: '',
            paramsDiff: '',
          },
        ])
      )
    })

    it('should work with internal matches', () => {
      // const match1 = lSpec.methods.create_look
      const match2 = lSpec.methods.create_query
      lSpec.methods = pick(lSpec.methods, [
        'create_dashboard',
        'create_look',
        'create_query',
        'user',
      ])
      rSpec.methods = pick(rSpec.methods, ['create_look', 'create_query'])
      rSpec.methods.create_query = changeMethod(match2 as Method)

      // const expected = [
      //   {
      //     name: match1.name,
      //     id: match1.id,
      //     lStatus: match1.status,
      //     rStatus: match1.status,
      //     typeDiff: '',
      //     paramsDiff: '',
      //   },
      //   {
      //     name: match2.name,
      //     id: match2.id,
      //     lStatus: match2.status,
      //     rStatus: match2.status,
      //     typeDiff: expect.stringContaining('lhs'),
      //     paramsDiff: expect.stringContaining('lhs'),
      //   },
      // ]
      let actual = compareSpecs(lSpec, rSpec)
      expect(actual).toHaveLength(3)
      // TODO correct this check
      // expect(actual).toEqual(expect.arrayContaining(expected))

      /** The left spec is now the shorter one */
      actual = compareSpecs(rSpec, lSpec)
      expect(actual).toHaveLength(3)
      // TODO correct this check
      // expect(actual).toEqual(expect.arrayContaining(expected))
    })

    it('should work with boundary matches', () => {
      // const match1 = lSpec.methods.create_dashboard
      const match2 = lSpec.methods.user
      lSpec.methods = pick(lSpec.methods, [
        'create_dashboard',
        'create_look',
        'create_query',
        'user',
      ])
      rSpec.methods = pick(rSpec.methods, ['create_dashboard', 'group', 'user'])
      rSpec.methods.user = changeMethod(match2 as Method)

      // const expected = [
      //   {
      //     name: match1.name,
      //     id: match1.id,
      //     lStatus: match1.status,
      //     rStatus: match1.status,
      //     typeDiff: '',
      //     paramsDiff: '',
      //   },
      //   {
      //     name: match2.name,
      //     id: match2.id,
      //     lStatus: match2.status,
      //     rStatus: match2.status,
      //     typeDiff: expect.stringContaining('lhs'),
      //     paramsDiff: expect.stringContaining('lhs'),
      //   },
      // ]
      let actual = compareSpecs(lSpec, rSpec)
      expect(actual).toHaveLength(4)
      // TODO fix this check
      // expect(actual).toEqual(expect.arrayContaining(expected))

      actual = compareSpecs(rSpec, lSpec)
      expect(actual).toHaveLength(4)
      // TODO fix this check
      // expect(actual).toEqual(expect.arrayContaining(expected))
    })

    it('should compare with filter', () => {
      const leftFile = rootFile('/spec/Looker.3.1.oas.json')
      const lSpec = ApiModel.fromString(readFileSync(leftFile, 'utf-8'))
      const rightFile = rootFile('/spec/Looker.4.0.oas.json')
      const rSpec = ApiModel.fromString(readFileSync(rightFile, 'utf-8'))

      const betaCompare = (
        delta: DiffRow,
        lMethod?: IMethod,
        rMethod?: IMethod
      ) => includeDiffs(delta, lMethod, rMethod) || lMethod?.status === 'beta'

      const actual = compareSpecs(lSpec, rSpec, betaCompare)
      expect(actual).toBeDefined()
      expect(actual.length).toBeGreaterThanOrEqual(
        Object.values(lSpec.methods).filter(
          (method) => method.status === 'beta'
        ).length
      )
    })
  })
})
