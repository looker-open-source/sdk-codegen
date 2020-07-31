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
import { cloneDeep, isEmpty } from 'lodash'
import {
  IMethodResponse,
  IProperty,
  IType,
  KeyedCollection,
} from '@looker/sdk-codegen'

/**
 * Omit unwanted properties from a given property object
 * @param val Property object
 */
const cleanProperty = (val: IProperty) => {
  if (val.type.customType) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return cleanType(val.type).properties
  }
  return val.type.name
}

interface CleanType {
  name: string
  description: string
  properties: KeyedCollection<any>
}

/**
 * Omit unwanted metadata from a given type object
 * @param val Type object
 */
const cleanType = (val: IType): CleanType => {
  const result = {
    name: val.name,
    description: val.description,
    properties: {},
  }
  if (!isEmpty(val.properties)) {
    Object.entries(val.properties).forEach(
      ([name, property]) => (result.properties[name] = cleanProperty(property))
    )
  }
  return result
}

/**
 * Given a response object, return a copy stripped of unwanted metadata
 * @param val A method response object
 */
export const copyAndCleanResponse = (val: IMethodResponse) => {
  switch (val.type.className) {
    case 'ArrayType':
    case 'HashType':
    case 'DelimArrayType':
    case 'EnumType':
      return cleanType(cloneDeep(val.type.elementType!)).properties
    default:
      return cleanType(cloneDeep(val.type)).properties
  }
}

/**
 * Given an array of method responses, group them by statusCode. The value of each status code is a collection of
 * media types (keys) and responses (values)
 * @param responses An array of method responses
 */
export const buildResponseTree = (
  responses: IMethodResponse[]
): KeyedCollection<KeyedCollection<IMethodResponse>> => {
  const tree = {}
  Object.values(responses).forEach((response) => {
    const node = `${response.statusCode}: ${response.description}`
    if (!(node in tree)) tree[node] = {}
    tree[node][response.mediaType] = response
  })
  return tree
}
