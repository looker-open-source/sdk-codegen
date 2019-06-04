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
import { SDKConfig, SDKConfigProps } from './sdkConfig'
import { OpenAPIObject, OpenApiBuilder, PathItemObject, PathsObject, SchemaObject, OperationObject, RequestBodyObject, ReferenceObject } from 'openapi3-ts'
import { logConvert } from './convert'
import { fail, quit, utf8 } from './utils'
import * as Mustache from 'mustache'
import * as yaml from 'js-yaml'
import { MethodParameter, writeParams } from './methodParam';

export interface ITypeMapItem {
  type: string,
  default: string
}

export interface ITypeMap {
  [typeformat: string] : ITypeMapItem
}

export interface ICodePattern {
  commentString : string,
  paramIndent: string,
  paramSeparator: string,
  paramDeclaration: string,
  paramEmptyList: string,
  paramOpenList: string,
  paramCloseList: string,
  argEmptyList: string,
  argSeparator: string,
  argOpenList: string,
  argCloseList: string,
  typeMap: ITypeMap[]
}

let api: OpenAPIObject
let typeDict: { [name: string]: SchemaObject } = {}

const methodTemplate = fs.readFileSync('./method.mst', utf8)

const code = yaml.safeLoad(fs.readFileSync('./python.yml', utf8)) as ICodePattern

const commentBlock = (text: string | undefined, indent: string = '') => {
  if (!text) return ''
  text = text.trim()
  if (!text) return
  const indenter = indent + code.commentString
  return indenter + text.split("\n").join("\n" + indenter)
}

// handy refs
// https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#schema-object
// https://swagger.io/docs/specification/data-models/data-types/
const typeMap = (type?: string, format?: string) => {
  if (!type) return fail('typeMap', 'Schema type was not defined')
  const typeFormat : keyof ITypeMap = type + (format ? `.${format}` : '')
  // @ts-ignore
  const result = code.typeMap[typeFormat]
  if (!result) {
    return type
  }
  return result
}

// const isParam = (ambiguous : ParameterObject | ReferenceObject) => {
//   return ambiguous.hasOwnProperty('name')
// }

// omit read-only values
// list all required params first
// list optional params second with default values for languages that support default named params
const paramList = (params: MethodParameter[]) => {
  if (!params) return code.paramEmptyList
  // this should use a partial?
  const paramTemplate = `{{#description}}{{{description}}}\n{{/description}}${code.paramDeclaration}`
  const declarations: any[] = []
  params.forEach(param => {
    const schema = param.schema // as SchemaObject
    if (!schema.type) {
      console.log("** not found **",JSON.stringify(param, null, 2))
      console.log("**debug**", JSON.stringify(params, null, 2))
    }
    const typeDef = typeMap(schema.type, schema.format)
    const view = {
      name: param.name,
      paramIndent: code.paramIndent,
      type: typeDef.type,
      default: typeDef.default,
      description: commentBlock(param.description, code.paramIndent)
    }
    declarations.push(Mustache.render(paramTemplate, view))
  })
  return `${code.paramOpenList}\n${declarations.join(code.paramSeparator + "\n")}\n${code.paramCloseList}`
}

const argList = (params: MethodParameter[]) => {
  if (!params) return code.argEmptyList
  const names = params
    .map((p) => p.name)
  return `${code.argOpenList}${names.join(code.argSeparator)}${code.argCloseList}`
}

// Retrieve an api object from the JSON path
const jsonPath = (path: string | string[], item: any = api, splitter: string = "/") => {
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

const isRefObject = (obj: any) => obj && obj.hasOwnProperty('$ref')

const getSchemaRef = (path: string | string[], splitter: string = "/") : SchemaObject | null => {
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
const getRequestSchema = (op: OperationObject) => {
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

// - generate parameter declarations, including default named values for optional parameters
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
// - return result
const processMethod = (endpoint: string, http: string, props: PathItemObject, requestSchema: SchemaObject | null) => {
  const params = writeParams(props, requestSchema)
  const data = {
    endpoint: endpoint,
    http: http,
    operationId: props.operationId,
    description: commentBlock(props.description || ''),
    summary: props.summary,
    params: paramList(params),
    args: argList(params)
  }
  return data
}

const processEndpoint = (endpoint: string, path: PathsObject) => {
  let methods: any[] = []
  Object.entries(path).forEach(([http, props]) => {
    const body = getRequestSchema(path[http])
    methods.push(processMethod(endpoint, http, props, body))
  })
  return methods
}

// Put all schema types into a dictionary for quick retrieval during generation
const loadSchema = (spec: OpenAPIObject = api) => {
  if (!spec.components) return
  if (!spec.components.schemas) return
  Object.entries(spec.components.schemas).forEach(([name, item]) => {
    let schema = item as SchemaObject
    typeDict[name] = schema
  })
}

const processSpec = async (name: string, props: SDKConfigProps) => {
  const specFile = await logConvert(name, props)
  const specContent = fs.readFileSync(specFile, utf8)
  const json = JSON.parse(specContent)
  api = new OpenApiBuilder(json).getSpec()
  loadSchema(api)
  let methods: any[] = []
  Object.entries(api.paths).forEach(([endpoint, path]) => methods.push(processEndpoint(endpoint, path)))
  const view = {
    methods: methods
  }
  return Mustache.render(methodTemplate, view)
}


(async () => {
  try {
    const config = SDKConfig()
    for (let [name, props] of Object.entries(config) ) {
      const sdk = await processSpec(name, props)
      await fs.writeFileSync('./sdk_generated.py', sdk)
      break
    }
    } catch (e) {
    quit(e)
  }
  })()
