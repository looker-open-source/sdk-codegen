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
  ArrayType,
  DelimArrayType,
  HashType,
  IApiModel,
  IntrinsicType,
  IType,
  IMethod,
} from '@looker/sdk-codegen'
import { RunItInput } from '@looker/run-it'

/**
 * Return a default value for a given type name
 * @param type A type name
 */
const getTypeDefault = (type: string) => {
  // TODO: use potential equivalent from sdk-codegen, confirm formats
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

/**
 * Given a type object reduce it to its writeable intrinsic and/or custom type properties and their default values
 * @param spec Api spec
 * @param type A type object
 */
const createSampleBody = (spec: IApiModel, type: IType) => {
  /* eslint-disable @typescript-eslint/no-use-before-define */
  const getSampleValue = (type: IType) => {
    if (type instanceof IntrinsicType) return getTypeDefault(type.name)
    if (type instanceof ArrayType)
      return type.customType
        ? [recurse(spec.types[type.customType])]
        : getTypeDefault(type.name)
    if (type instanceof HashType)
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

/**
 * Given an SDK method create and return an array of inputs for the run-it form
 * @param spec Api spec
 * @param method A method object
 */
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
