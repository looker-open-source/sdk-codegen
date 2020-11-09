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
import { cloneDeep } from 'lodash'
import { OperationObject } from 'openapi3-ts'

import { compareMethods, compareTypes } from './specLinter'
import { TestConfig } from './testUtils'
import { PropertyList, Type, Method, Parameter } from './sdkModels'

const config = TestConfig()
const apiTestModel = config.apiTestModel

/**
 * Returns an array contain the key and the value of the first enumerable object property
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
 * Returns a copy of the given method with changes to the name, first method
 * param and first type property
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

describe('spec linter', () => {
  describe('compareTypes', () => {
    const lType = apiTestModel.types.Dashboard

    it('should return undefined if types are identical', () => {
      const actual = compareTypes(lType, lType)
      expect(actual).toBeUndefined()
    })

    it('should return an object containing all non matching entries', () => {
      const [key] = firstProperty(lType.properties)
      const rType = changeType(lType as Type)
      const actual = compareTypes(lType, rType)
      expect(actual).toBeDefined()
      if (actual) {
        expect(actual[key]).toBeDefined()
        expect(actual[key].lhs).toBeDefined()
        expect(actual[key].rhs).toBeDefined()
        expect(actual[key].rhs).toContain(`${lType.owner}.${key}`)
      }
    })
  })

  describe('compareMethods', () => {
    const lMethod = apiTestModel.methods.create_look

    it('should return undefined if methods are identical', () => {
      const actual = compareMethods(lMethod, lMethod)
      expect(actual).toBeUndefined()
    })

    it('should return an object containing all non matching entries', () => {
      const rMethod = changeMethod(lMethod as Method)
      const actual = compareMethods(lMethod, rMethod)
      expect(actual).toBeDefined()
      if (actual) {
        const key = Object.keys(actual)[0]
        expect(actual[key].lhs).toBeDefined()
        expect(actual[key].rhs).toBeDefined()
        expect(actual[key].rhs).toContain(`${lMethod.name}.${key}`)
      }
    })
  })
})
