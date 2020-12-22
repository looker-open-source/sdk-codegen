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
 * Every "cleaned" type from the API specification will contain these values
 */
export interface ICleanType {
  /** Name of the type */
  name: string
  /** Description of either the type property or the type */
  description: string
  /** List of properties for the type */
  properties: KeyedCollection<any>
}

/**
 * Omit unwanted properties from a given property object
 * @param val Property object
 * @param depth is the current level of the hierarchy
 * @param expand is the depth to expanded nested types. 0 = all, 1 = no expansion
 *
 */
const cleanProperty = (val: IProperty, depth = 0, expand = 1) => {
  if (val.type.customType && (expand === 0 || expand > depth)) {
    const desc = val.description ? val.description : val.type.description
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return cleanType(val.type, expand, desc, depth)
  }
  return val.type.name
}

/**
 * Omit unwanted metadata from a given type object
 * @param val Type object
 * @param expand is the depth to expanded nested types. 0 = all, 1 = no expansion
 * @oaram desc is a default value to use for the description
 * @param depth is the current level of the hierarchy
 */
const cleanType = (
  val: IType,
  expand = 1,
  desc = '',
  depth = 0
): ICleanType => {
  let props
  switch (val.className) {
    case 'ArrayType':
    case 'HashType':
    case 'DelimArrayType':
    case 'EnumType':
      props = val.elementType!.properties
      break
    default:
      props = val.properties
      break
  }

  const result = {
    name: val.name,
    description: val.description ? val.description : desc,
    properties: {},
  }
  if (!isEmpty(props)) {
    Object.entries(props).forEach(
      ([name, property]) =>
        (result.properties[name] = cleanProperty(property, depth + 1, expand))
    )
  }
  return result
}

/**
 * Given a response object, return a copy stripped of unwanted metadata
 * @param val A method response object
 * @param expand is the depth to expanded nested types. 0 = all, 1 = no expansion
 */
export const copyAndCleanResponse = (val: IMethodResponse, expand = 1) => {
  return cleanType(cloneDeep(val.type), expand, val.description)
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
