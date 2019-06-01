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
import { OpenAPIObject, OpenApiBuilder, PathItemObject, PathsObject, ParameterObject, SchemaObject } from 'openapi3-ts'
import { logConvert } from './convert'
import { fail, quit, utf8 } from './utils'
import * as Mustache from 'mustache'

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
  argCloseList: string
}

const methodTemplate = fs.readFileSync('./method.mst', utf8)

const code = {
  commentString : '# ',
  paramIndent: '    ',
  paramSeparator: ",",
  paramDeclaration: '{{paramIndent}}{{name}} : {{type}}',
  paramEmptyList: "():",
  paramOpenList: "(",
  paramCloseList: "):",
  argEmptyList: "()",
  argSeparator: ", ",
  argOpenList: "(",
  argCloseList: ")"
} as ICodePattern

// const httpMethod = (props: PathItemObject) => {
//   if (props.get) return 'get'
//   else if (props.post) return 'post'
//   else if (props.put) return 'put'
//   else if (props.patch) return 'patch'
//   else if (props.delete) return 'delete'
//   return fail('httpMethod', 'Unrecognized http method')
// }

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
// this:
// - needs to be expanded if we think more types are necessary
// - abstracted into a typemap declaration system for each language we'll support
// - the values in the ICodePattern interface should also be part of the yaml config for each language
const typeMap = (type?: string, format?: string) => {
  if (!type) return fail('typeMap', 'Schema type was not defined')
  const typeFormat = type + (format ? `.${format}` : '')
  switch (typeFormat) {
    case 'number': return 'double'
    case 'number.float': return 'float'
    case 'number.double': return 'double'
    case 'integer': return 'int'
    case 'integer.int32': return 'int'
    case 'integer.int64': return 'long'
    case 'string': return 'str'
    case 'string.date': return 'date'
    case 'string.date-time': return 'datetime'
    case 'string.password': return 'password'
    case 'string.byte': return 'base64'
    case 'string.binary': return 'binary'
    case 'string.email': return 'email'
    case 'string.uuid': return 'uuid'
    case 'string.uri': return 'uri'
    case 'string.hostname': return 'hostname'
    case 'string.ipv4': return 'ipv4'
    case 'string.ipv6': return 'ipv6'
    case 'boolean': return 'boolean'
    case 'array': return 'array'
    case 'object': return 'object'
    default: return type
  }
}

// const isParam = (ambiguous : ParameterObject | ReferenceObject) => {
//   return ambiguous.hasOwnProperty('name')
// }

const paramList = (params: ParameterObject[]) => {
  if (!params) return code.paramEmptyList
  const paramTemplate = `{{#description}}{{{description}}}\n{{/description}}${code.paramDeclaration}`
  const declarations: any[] = []
  params.forEach(param => {
    const schema = param.schema as SchemaObject
    const view = {
      name: param.name,
      paramIndent: code.paramIndent,
      type: typeMap(schema.type, schema.format),
      description: commentBlock(param.description, code.paramIndent)
    }
    declarations.push(Mustache.render(paramTemplate, view))
  })
  return `${code.paramOpenList}\n${declarations.join(code.paramSeparator + "\n")}\n${code.paramCloseList}`
}

const argList = (params: ParameterObject[]) => {
  if (!params) return code.argEmptyList
  const names = params
    .map((p: ParameterObject) => p.name)
  return `${code.argOpenList}${names.join(code.argSeparator)}${code.argCloseList}`
}

// need to process body, query, and path requests
const declareMethod = (endpoint: string, http: string, props: PathItemObject) => {
  const params = props.parameters as ParameterObject[]
  const view = {
    endpoint: endpoint,
    http: http,
    operationId: props.operationId,
    description: commentBlock(props.description || ''),
    summary: props.summary,
    params: paramList(params),
    args: argList(params)
  }
  return Mustache.render(methodTemplate, view)
}

const processEndpoint = (endpoint: string, path: PathsObject) => {
  let result = ''
  Object.entries(path).forEach(([http, props]) => result += declareMethod(endpoint, http, props))
  return result
}

const processSpec = async (name: string, props: SDKConfigProps) => {
  const specFile = await logConvert(name, props)
  const specContent = fs.readFileSync(specFile, utf8)
  const json = JSON.parse(specContent)
  const api: OpenAPIObject = new OpenApiBuilder(json).getSpec()
  let result = ''
  Object.entries(api.paths).forEach(([endpoint, path]) => result += processEndpoint(endpoint, path))
  return result
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