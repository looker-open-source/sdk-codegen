#!/usr/bin/env node

/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2019 Looker Data Sciences, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import { ParameterStyle, SchemaObject, ExampleObject, ContentObject, OperationObject, ReferenceObject, RequestBodyObject } from "openapi3-ts"
import { code, typeMap, commentBlock, dump, quit } from "./utils"
import { getSchemaRef, isRefObject, jsonPath } from "./specSupport";

export declare type MethodParameterLocation = 'path' | 'body' | 'query' | 'header' | 'cookie'

export interface IMethodParameter {
  [ key: string ]: any
  name: string
  in: MethodParameterLocation
  schema: SchemaObject

  readOnly?: boolean
  description?: string
  required?: boolean
  deprecated?: boolean
  allowEmptyValue?: boolean
  style?: ParameterStyle
  explode?: boolean
  allowReserved?: boolean
  examples?: {
      [param: string]: ExampleObject
  }
  example?: any
  content?: ContentObject
}

/*
export interface SchemaObject extends ISpecificationExtension {
    nullable?: boolean;
    discriminator?: DiscriminatorObject;
    readOnly?: boolean;
    writeOnly?: boolean;
    xml?: XmlObject;
    externalDocs?: ExternalDocumentationObject;
    example?: any;
    examples?: any[];
    deprecated?: boolean;
    type?: string;
    allOf?: (SchemaObject | ReferenceObject)[];
    oneOf?: (SchemaObject | ReferenceObject)[];
    anyOf?: (SchemaObject | ReferenceObject)[];
    not?: SchemaObject | ReferenceObject;
    items?: SchemaObject | ReferenceObject;
    properties?: {
        [propertyName: string]: (SchemaObject | ReferenceObject);
    };
    additionalProperties?: (SchemaObject | ReferenceObject | boolean);
    description?: string;
    format?: string;
    default?: any;
    title?: string;
    multipleOf?: number;
    maximum?: number;
    exclusiveMaximum?: boolean;
    minimum?: number;
    exclusiveMinimum?: boolean;
    maxLength?: number;
    minLength?: number;
    pattern?: string;
    maxItems?: number;
    minItems?: number;
    uniqueItems?: boolean;
    maxProperties?: number;
    minProperties?: number;
    required?: string[];
    enum?: any[];
}
*/

const noMeth = () => {
  return {
  } as IMethodParameter
}

export const asParams = (list : any[] | undefined) : IMethodParameter[] => {
  let results : IMethodParameter[] = []
  if (!list) return results
  for (let item of list) {
    let value = new MethodParameter(item)
    let defined = (value.name && value.schema && value.in)
    if (defined) {
      results.push(value)
    }
  }
  return results
}

// coerce a SchemaObject to a ParameterObject
export const schemaToParam = (name: string, schema: SchemaObject | null) : IMethodParameter => {
  let result = noMeth()
  if (schema) {
    result = {
      name: name,
      in: 'body',
      schema: {
        type: schema.type,
        format: schema.format,
        default: schema.default
      },
      readOnly : schema.readOnly,
      description: schema.description,
      // "x-looker-nullable": schema["x-looker-nullable"]
    }
    // console.log({name, schema, result})
  }
  return result
}

// order parameters in location priority
const locationSorter = (p1: IMethodParameter, p2: IMethodParameter) => {
  const remain = 0
  const before = -1
  // const after = 1
  // note: "body" is an injected location for simplifying method declarations
  // parameters should be sorted in the following location order:
  const locations = ['path', 'body', 'query', 'header', 'cookie']
  if (p1.in === p2.in) return remain // no need to re-order

  for (let location of locations) {
    if (p1.in === location) {
      return remain // first parameter should stay first
    }
    if (p2.in === location) {
      return before // second parameter should move up
    }
  }
  return remain
}

export class MethodParameter implements IMethodParameter {
  static propNames = ['name','schema','in','readOnly','description','comment','required','deprecated',
    'allowEmptyValue', 'style','explode', 'allowReserved','examples','example','content']

  name: string = '';
  schema: SchemaObject = {};
  in: MethodParameterLocation = 'query'

  readOnly?: boolean
  description?: string
  comment?: string
  required?: boolean
  deprecated?: boolean
  allowEmptyValue?: boolean
  style?: ParameterStyle
  explode?: boolean
  allowReserved?: boolean
  examples?: {
      [param: string]: ExampleObject
  }
  example?: any
  content?: ContentObject

  constructor (param?: any) {
    this.name = ''
    this.schema = {} as SchemaObject
    this.in = 'query'
    this.assignProps(param)
  }

  assignProps = (param?: any) => {
    if (param) {
      for (let name of MethodParameter.propNames) {
        if (param.hasOwnProperty(name)) {
          // @ts-ignore
          this[name] = param[name]
        }
      }
      if (param.schema) {
        const schema = param.schema as SchemaObject
        const typeDef = typeMap(schema.type, schema.format)

        this.name = this.name || param.name;
        this.schema = schema
        this.schema.type = typeDef.type
        this.schema.default = this.schema.default || typeDef.default;
        this.comment = commentBlock(this.description || param.description, code.paramIndent)
      }
    }
  }
}

const getRequestParam = (op: OperationObject) => {
  const upPrefix = 'Write'
  if (!op.requestBody) return null
  let path
  if (isRefObject(op.requestBody)) {
    path = (op.requestBody as ReferenceObject).$ref
  }
  else {
    const request = op.requestBody as RequestBodyObject
    const key = Object.keys(request.content)[0]
    const media = request.content[key]
    if (isRefObject(media.schema)) {
      path = (media.schema as ReferenceObject).$ref
    } else {
      const schema = media.schema as SchemaObject
      let newType = typeMap(schema.type)
      if (schema.additionalProperties && schema.additionalProperties.hasOwnProperty('type')) {
        const addSchema = schema.additionalProperties as SchemaObject
        newType = typeMap(addSchema.type, addSchema.format)
      }
      return {
        name: 'body',
        // @ts-ignore
        required: !!op.requestBody.required,
        schema: {
          type: newType
        },
        in: 'body',
        // @ts-ignore
        description: op.requestBody.description || newType
      } as IMethodParameter
    }
  }
  let typeName
  try {
    typeName = path.substr(path.lastIndexOf("/")+1)
  } catch (e) {
    console.log(dump(op))
    quit(e)
  }

  const result : IMethodParameter = {
    name: 'body',
    // @ts-ignore
    required: !!op.requestBody.required,
    schema: {
      type: `${upPrefix}${typeName}`
    },
    in: 'body',
    // @ts-ignore
    description: op.requestBody.description || typeName,
    // @ts-ignore
    comment: commentBlock(op.requestBody.description || typeName, code.paramIndent)
  }
  return result
}

const getResponse = (op: OperationObject) => {
  if (!op.responses) {
    dump(op)
    quit(new Error('responses not found'))
  }
  const responses = op.responses
  let obj
  let path
  if (responses.default) {
    obj = responses.default
  } else {
    obj = responses["200"]
  }
  if (isRefObject(obj)) {
    path = obj.$ref
  } else {
    path = jsonPath(['application/json', 'schema', '$ref'], obj.content)
    if (!path) {
      dump(op)
      quit(new Error('response path not found'))
    }
  }
  const schema = getSchemaRef(path)
  return schema
}

// - list items in precedence order as defined in paramSorter
// - inject body parameter from request object if it exists
// - exclude readOnly parameters
export class MethodParameters {

  items: IMethodParameter[] = []
  response: SchemaObject | null;
  operation: OperationObject

  constructor(op: OperationObject) {
    this.operation = op
    const list = asParams(op.parameters)
    const request = getRequestParam(op)
    if (request) list.push(request)
    this.response = getResponse(op)
    this.items = list
      .filter(p => !p.readOnly)
      .sort((p1, p2) => locationSorter(p1, p2))
  }

  writeable = (list? : IMethodParameter[]) => {
    if (!list) list = this.items
    return list
      .filter(p => !p.readOnly)
  }

  sort = (list? : IMethodParameter[]) => {
    if (!list) list = this.items
    return list
      .sort((p1, p2) => locationSorter(p1, p2))
  }

  // return the list of required, writeable parameters, optionally for a specific location
  required = (location?: MethodParameterLocation) => {
    let list = this.items
      .filter((i) => (!i.readOnly) && (i.required))
    if (location) {
      list = list.filter((i) => i.in === location)
    }
    return list
  }

  // return the list of optional, writeable parameters, optionally for a specific location
  optional = (location?: MethodParameterLocation) => {
    let list = this.items
      .filter((i) => (!i.readOnly) && (!i.required))
    if (location) {
      list = list.filter((i) => i.in === location)
    }
    return list
  }

  // all required parameters ordered by location declaration order
  get requiredParams() {
    return this.required('path')
      .concat(
        this.required('body'),
        this.required('query'),
        this.required('header'),
        this.required('cookie')
      )
  }

  // all required parameters ordered by location declaration order
  get optionalParams() {
    return this.optional('path')
      .concat(
        this.optional('body'),
        this.optional('query'),
        this.optional('header'),
        this.optional('cookie')
      )
  }

  // all parameters ordered by required, then optional, location declaration order
  get allParams() {
    return this.requiredParams.concat(this.optionalParams)
  }

  params = (location?: MethodParameterLocation) => {
    if (location) {
      return this.items.filter((i) => i.in === location)
    }
    return this.items
  }

  get pathParams(){
    return this.params('path')
  }

  get bodyParams() {
    return this.params('body')
  }

  get queryParams() {
    return this.params('query')
  }

  get headerParams() {
    return this.params('header')
  }

  get cookieParams() {
    return this.params('cookie')
  }

  names = (location?: MethodParameterLocation) => {
    return this
      .params(location)
      .map(p => p.name)
  }

  args = (location?: MethodParameterLocation) => {
    return this
      .names(location)
      .join(code.argSeparator)
  }

  get pathArgs(){
    return this.args('path')
  }

  get bodyArgs() {
    return this.args('body')
  }

  get queryArgs() {
    return this.args('query')
  }

  get headerArgs() {
    return this.args('header')
  }

  get cookieArgs() {
    return this.args('cookie')
  }

}