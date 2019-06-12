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
import { OpenAPIObject, OpenApiBuilder, PathsObject, SchemaObject, OperationObject, RequestBodyObject, ReferenceObject, ResponseObject, MediaTypeObject } from 'openapi3-ts'
import { logConvert } from './convert'
import { utf8, commentBlock, code, ICodePattern, dump, debug, quit, typeMap } from './utils'
import { MethodParameters, IResponseSchema } from './methodParam'
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

export const isResponseObject = (obj: any) => {
  return obj && obj.hasOwnProperty('description') &&
    (obj.hasOwnProperty('headers')
    ||obj.hasOwnProperty('content')
    ||obj.hasOwnProperty('links')
    )
}

export const isRequestBodyObject = (obj: any) => {
  return obj && obj.hasOwnProperty('content')
}

export const schemaType = (schema: SchemaObject) => {
  const typeDef = typeMap(schema.type, schema.format)
  let itemSchema = null
  let itemType = ''
  if (schema.items) {
    // This can probably reuse some other code
    itemSchema = resolveSchema(schema.items)
  } else if (schema.additionalProperties) {
    itemSchema = resolveSchema(schema.additionalProperties)
  }
  if (itemSchema) {
    const itemDef = typeMap(itemSchema.type, itemSchema.format)
    itemType = itemDef.type
    // TODO need to handle more reference types?
    switch (typeDef.type) {
      case "array": typeDef.type = itemType + '[]'; break
      case "object": typeDef.type = `Dict[${itemType}]`; break
    }
  }
  return typeDef
}

export const resolveSchema = (schema: SchemaObject | ReferenceObject | any) => {
  if (isRefObject(schema)) {
    return getSchemaRef(schema.$ref)
  }
  if (schema.type) {
    return schemaType(schema)
  }
  return schemaType({
    type: schema.type,
    format: schema.format,
    items: schema.items,
    additionalProperties: schema.additionalProperties
  })
}

export const getSchemasFromMedia = (type: string, obj: MediaTypeObject) => {
  return {
    name: `_as${type.substr(type.lastIndexOf("/")+1)}`,
    schema: resolveSchema(obj.schema)
  }
}

export const getRequestBodySchema = (obj: RequestBodyObject | ReferenceObject) => {
  let responses: IResponseSchema[] = []
  if (isRefObject(obj)) {
    responses.push(getSchemaRef((obj as ReferenceObject).$ref) as IResponseSchema)
  } else if (isRequestBodyObject(obj) && (obj as RequestBodyObject).content) {
    const content = obj as RequestBodyObject
    // TODO need to understand headers or links
    Object.keys(content).forEach(key => {
      let schema = resolveSchema(content[key])
      schema.required = schema.required || content.required
      if (schema) {
        responses.push({name: content.description, schema: schema } as IResponseSchema)
      }
    })
  } else {
    // must be "any", cast to schema
  }
  return responses
}

export const getResponseSchema = (obj: ResponseObject | ReferenceObject | any) => {
  // TODO need to populate description for all schema
  let responses: IResponseSchema[] = []
  if (isRefObject(obj)) {
    responses.push(getSchemaRef(obj.$ref) as IResponseSchema)
  } else if (isResponseObject(obj) && obj.content) {
    // TODO need to understand headers or links
    Object.keys(obj.content).forEach(key => {
      const media = obj.content[key]
      const response = getSchemasFromMedia(key, media)
      responses.push(response)
    })
  } else {
    // must be "any", cast to schema
  }
  return responses
}

// responses are a http code-keyed collection that can be:
// - ResponseObject
// - ReferenceObject
// - any (directly defined type)
export const getResponses = (op: OperationObject) => {
  if (!op.responses) {
    dump(op)
    quit('No responses found for operation')
  }
  let responses : IResponseSchema[] = []
  Object.entries(op.responses).forEach(([key, response]) => {
    const code = parseInt(key, 10)
    if (code >= 200 && code <= 208) {
      const responseSchema = getResponseSchema(response)
      for (let rs of responseSchema) {
        responses.push(rs)
      }
    }
  })
  return responses
}

export const getSchemaRef = (path: string | string[], splitter: string = "/") : SchemaObject | null => {
  let reference = jsonPath(path)
  if (!reference) return null
  // Is this a ContentObject?
  if (reference.content) {
    // may not be able to assume application/json
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
    debug(`${path} not found`)
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
  code: ICodePattern,
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
    code: code,
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
  Object.entries(api.paths).forEach(([endpoint, path]) => {
    for (let method of processEndpoint(endpoint, path).methods) methods.push(method)
  })
  // debug('methods[0]', methods[0])
  const view = {
    methods: methods,
    code: code
  }
  return template(view)
}
