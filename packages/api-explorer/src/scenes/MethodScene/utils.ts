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
  ArrayType,
  DelimArrayType,
  HashType,
  IApiModel,
  IntrinsicType,
  IType,
  IMethod,
  IProperty,
  IMethodResponse,
} from '@looker/sdk-codegen'
import { RunItInput } from '@looker/run-it'

// TODO: use potential equivalent from sdk-codegen, confirm formats
export const getTypeDefault = (type: string) => {
  switch (type) {
    case 'boolean':
      return false
    case 'int64':
    case 'integer':
      return 0
    case 'float':
    case 'double':
      return 0.0
    case 'hostname':
    case 'ipv4':
    case 'ipv6':
    case 'uuid':
    case 'uri':
    case 'string':
    case 'email':
      return ''
    case 'string[]':
      return []
    case 'object':
      return {}
    case 'datetime':
      return ''
    default:
      return ''
  }
}

const createSampleBody = (spec: IApiModel, type: IType) => {
  /* eslint-disable @typescript-eslint/no-use-before-define */
  const getSampleValue = (type: IType) => {
    if (type instanceof IntrinsicType) return getTypeDefault(type.name)
    if (type instanceof ArrayType)
      return type.customType
        ? [recurse(spec.types[type.customType])]
        : getTypeDefault(type.name)
    if (type instanceof HashType)
      // TODO: populate Hash[] types
      return type.customType ? recurse(spec.types[type.customType]) : {}
    if (type instanceof DelimArrayType) return ''

    return recurse(type)
  }
  /* eslint-enable @typescript-eslint/no-use-before-define */

  const recurse = (type: IType) => {
    const sampleBody: { [key: string]: any } = {}
    for (const prop of type.writeable) {
      const sampleValue = getSampleValue(prop.type)
      if (sampleValue !== undefined) {
        sampleBody[prop.name] = sampleValue
      }
    }
    return sampleBody
  }
  return recurse(type)
}

export const createInputs = (spec: IApiModel, method: IMethod): RunItInput[] =>
  method.allParams.map((param) => ({
    name: param.name,
    location: param.location,
    type:
      param.type instanceof IntrinsicType
        ? param.type.name
        : createSampleBody(spec, param.type),
    required: param.required,
    description: param.description,
  }))

/**
 * Given a list of properties names, check if they exist in the source and copy them to the destination
 * @param source A source object
 * @param destination A destination object
 * @param propNames A list of property names
 */
const conditionalAdd = (
  source: object,
  destination: object,
  propNames: string[]
) => {
  for (const prop in propNames) {
    if (prop in source && source[prop]) destination[prop] = source[prop]
  }
  return destination
}

/**
 * Omit unwanted properties from a given property object
 * @param val Property object
 */
export const cleanProperty = (val: IProperty) => ({
  name: val.name,
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  type: cleanType(val.type) as IType,
  ...conditionalAdd(val, {}, [
    'description',
    'readOnly',
    'required',
    'nullable',
    'deprecated',
    'values',
  ]),
})

/**
 * Omit unwanted metadata from a given type object
 * @param val Type object
 */
export const cleanType = (val: IType) => {
  const result = {
    name: val.name,
    description: val.description,
  }
  if (!isEmpty(val.properties)) {
    // eslint-disable-next-line dot-notation
    result['properties'] = {}
    Object.entries(val.properties).forEach(
      ([name, property]) =>
        // eslint-disable-next-line dot-notation
        (result['properties'][name] = cleanProperty(property))
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
      return cleanType(cloneDeep(val.type.elementType!))
    default:
      return cleanType(cloneDeep(val.type))
  }
}
