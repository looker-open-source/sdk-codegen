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

import * as fs from 'fs'
// import { TargetLanguages, GeneratorSpec as LanguageSpec } from './targetLanguages'
import { SDKConfigProps } from './sdkConfig'
import { OpenAPIObject, OpenApiBuilder, PathsObject, SchemaObject, OperationObject, RequestBodyObject, ReferenceObject } from 'openapi3-ts'
import { logConvert } from './convert'
import { utf8, commentBlock, code } from './utils'
import { MethodParameters } from './methodParam'
import * as Handlebars from 'handlebars'

export let api: OpenAPIObject
export let typeDict: { [name: string]: SchemaObject } = {}

const methodTemplate = fs.readFileSync('./method.hbs', utf8)
export const template = Handlebars.compile(methodTemplate)
// template({methods:null})

// Retrieve an api object via its JSON path
// TODO replace this with get from underscore?
export const jsonPath = (path: string | string[], item: any = api, splitter: string = "/") => {
  let keys = path
  if (!(path instanceof Array)) {
    keys = path.split(splitter)
  }
  for (let key of keys) {
    if (key === '#') continue
    item = item[key]
    if (item == null) return null
  }
  return item
}

export const isRefObject = (obj: any) => obj && obj.hasOwnProperty('$ref')

export const getSchemaRef = (path: string | string[], splitter: string = "/") : SchemaObject | null => {
  let reference = jsonPath(path)
  if (!reference) return null
  // Is this a ContentObject?
  if (reference.content) {
    reference = jsonPath(["application/json", "schema"], reference.content)
    if (reference) {
      path = reference.$ref
    }
  }
  let keys = path
  if (!(path instanceof Array)) {
    keys = path.split(splitter)
  }
  let name = keys[keys.length - 1]
  const result = typeDict[name]
  if (!result) {
    console.log(path, "not found")
  }
  return result
}

// there's gotta be a better way to code this mess
export const getRequestSchema = (op: OperationObject) => {
  if (!op || !op.requestBody) return null
  let req = {} as RequestBodyObject
  if (isRefObject(op.requestBody)) {
    return getSchemaRef((op.requestBody as ReferenceObject).$ref)
  } else {
    req = op.requestBody as RequestBodyObject
    if (req.content) {
      Object.entries(req.content).forEach(([_, value]) => {
        return value.schema
      })
    }
  }
  return null
}

export interface IRestMethod {
  endpoint: string,
  httpMethod: string,
  operationId: string,
  description: string,
  summary: string,
  params: MethodParameters
}

// omit read-only values
// list all required items first
// list optional items second with default values for languages that support default named items
// - determine parameter declarations, including default named values for optional parameters
// - group method signature parameters into prioritized locations:
//  - required:
//    - path
//    - body
//    - query
//    - header
//    - cookie
//  - optional (should include default annotation values for default named parameters):
//    - path
//    - body
//    - query
//    - header
//    - cookie
// - invoke API method with provided param groups
// - determine return type for method
// - support async and generic syntax for those languages supporting it
export const processMethod = (endpoint: string, httpMethod: string, op: OperationObject) => {
  const data = {
    endpoint: endpoint,
    httpMethod: httpMethod,
    operationId: op.operationId,
    description: commentBlock(op.description || ''),
    summary: op.summary,
    params: new MethodParameters(op),
  } as IRestMethod
  return data
}

export interface IRestEndpoint {
  methods: IRestMethod[]
}

export const processEndpoint = (endpoint: string, path: PathsObject) => {
  let methods: any[] = []
  Object.entries(path).forEach(([httpMethod, op]) => {
    methods.push(processMethod(endpoint, httpMethod, op))
  })
  return {
    methods: methods
  } as IRestEndpoint
}

// Put all schema types into a dictionary for quick retrieval during generation
export const loadSchema = (spec: OpenAPIObject = api) => {
  if (!spec.components) return
  if (!spec.components.schemas) return
  Object.entries(spec.components.schemas).forEach(([name, item]) => {
    let schema = item as SchemaObject
    typeDict[name] = schema
  })
}

export const loadSpec = (specFile: string) => {
  const specContent = fs.readFileSync(specFile, utf8)
  const json = JSON.parse(specContent)
  api = new OpenApiBuilder(json).getSpec()
  loadSchema(api)
}

export const processSpec = async (name: string, props: SDKConfigProps) => {
  const specFile = await logConvert(name, props)
  loadSpec(specFile)
  let methods: any[] = []
  Object.entries(api.paths).forEach(([endpoint, path]) => methods.push(processEndpoint(endpoint, path)))
  const view = {
    methods: methods,
    code: code
  }
  return template(view)
}
