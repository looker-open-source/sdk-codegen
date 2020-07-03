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

import { omit } from 'lodash'
import {
  ArrayType,
  DelimArrayType,
  HashType,
  IApiModel,
  IntrinsicType,
  IType,
  IMethod,
} from '@looker/sdk-codegen'
import { TryItInput } from '@looker/try-it'

// TODO: use potential equivalent from sdk-codegen, confirm formats
export const getTypeDefault = (type: string) => {
  switch (type) {
    case 'boolean':
      return true
    case 'int64':
    case 'integer':
      return 1
    case 'float':
    case 'double':
      return 1.0
      break
    case 'hostname':
    case 'ipv4':
    case 'ipv6':
    case 'uuid':
    case 'uri':
    case 'string':
      return type
    case 'string[]':
      return ['string']
    case 'email':
      return 'user@foo.com'
    case 'object':
      return {}
    case 'datetime':
      return new Date(Date.now())
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

export const createInputs = (
  spec: IApiModel,
  method: IMethod
): TryItInput[] => {
  return method.allParams.map((param) => ({
    name: param.name,
    location: `${param.location}`,
    type:
      param.type instanceof IntrinsicType
        ? param.type.name
        : createSampleBody(spec, param.type),
    required: param.required,
    description: param.description,
  }))
}

export const responsePropsToOmit = [
  'properties',
  'methodRefs',
  'refs',
  'customType',
  'customTypes',
  'refCount',
  'types',
  'schema',
]

const cleanResponse = (val: object) => {
  val = omit(val, responsePropsToOmit)
  Object.keys(val).forEach((key) => {
    const v = val[key]
    if (v instanceof Object) {
      val[key] = cleanResponse(v)
    }
  })
  return val
}

export const copyAndCleanResponse = (val: object) => {
  const copy = { ...val }
  return cleanResponse(copy)
}
