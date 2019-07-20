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

// TypeScript codeFormatter

import {Arg, IMappedType, IMethod, IParameter, IProperty, IType, IntrinsicType} from "./sdkModels"
import {CodeFormatter, warnEditing} from "./codeFormatter"

export class TypescriptFormatter extends CodeFormatter {
  codePath = './typescript/'
  package = 'looker'
  itself = 'this'
  fileExtension = '.ts'
  commentStr = '// '
  nullStr = 'null'
  transport = 'transport'

  argDelimiter = ', '
  paramDelimiter = ',\n'
  propDelimiter = '\n'

  indentStr = '  '
  endTypeStr = '\n}'
  needsRequestTypes = true

  // @ts-ignore
  methodsPrologue(indent: string) {
    return `
// ${warnEditing}
import { APIMethods } from '../rtl/apiMethods'
import { ${this.typeNames().join(', ')} } from './models'

export class LookerSDK extends APIMethods {
`
  }

  // @ts-ignore
  methodsEpilogue(indent: string) {
    return '\n}'
  }

  // @ts-ignore
  modelsPrologue(indent: string) {
    return `
// ${warnEditing}

import { URL } from 'url'
`
  }

  // @ts-ignore
  modelsEpilogue(indent: string) {
    return ''
  }

  // @ts-ignore
  argGroup(indent: string, args: Arg[]) {
    if ((!args) || args.length === 0) return this.nullStr
    let hash: string[] = []
    for (let arg of args) {
      hash.push(`${arg}`)
    }
    return `\n${indent}{${hash.join(this.argDelimiter)}}`
  }

  // @ts-ignore
  argList(indent: string, args: Arg[]) {
    return args && args.length !== 0
          ? `\n${indent}${args.join(this.argDelimiter)}`
          : this.nullStr
  }

  declareProperty(indent: string, property: IProperty) {
    const type = this.typeMap(property.type)
    return this.commentHeader(indent, property.description)
      + `${indent}${property.name}: ${type.name}`
  }

  // Looks like Partial<> is the way to go https://www.typescriptlang.org/docs/handbook/utility-types.html#partialt
  // but for now https://stackoverflow.com/a/54474807/74137 is the approach
  createRequester(indent: string, method: IMethod) {
    const bump = indent + this.indentStr
    const args = method.allParams // get the params in signature order
    let props: string[] = []
    let defaults: string[] = []
    if (args && args.length > 0) args.forEach(p => props.push(this.declareParameter(bump, p)))
    method.optional()
      .forEach(arg => {
        const type = this.typeMap(arg.type)
        defaults.push(`${bump}${arg.name}: ${type.default}`)
    })
    return this.commentHeader(indent, 'Request initialization for ${method.name}')
      + `${indent}export interface IRequest_${method.name} {\n`
      + props.join(this.propDelimiter)
      + `${indent}}\n\n`
      + `${indent}export class Request_${method.name} {\n`
      + defaults.join(this.propDelimiter)
      + `${indent}}\n\n`
  }

  methodSignature(indent: string, method: IMethod) {
    const type = this.typeMap(method.type)
    const header = this.commentHeader(indent, `${method.httpMethod} ${method.endpoint} -> ${type.name}`)
      + `${indent}async ${method.name}(`
    let fragment = ''

    // TODO unblock Brian for now
    // if (method.hasOptionalParams()) {
    //   // use the request type generated in models.ts
    //   fragment = `request: IRequest_${method.name}`
    // } else {
      const bump = indent + this.indentStr
      let params: string[] = []
      const args = method.allParams // get the params in signature order
      if (args && args.length > 0) args.forEach(p => params.push(this.declareParameter(bump, p)))
        fragment = `\n${params.join(this.paramDelimiter)}`
    // }
    return header + fragment + ') {\n'
  }

  declareParameter(indent: string, param: IParameter) {
    const type = this.typeMap(param.type)
    const optional = param.required ? '' : '?'
    return this.commentHeader(indent, param.description)
      + `${indent}${param.name}${optional}: ${type.name}`
      // + (param.required ? '' : (type.default ? ` = ${type.default}` : ''))
  }

  // @ts-ignore
  initArg(indent: string, property: IProperty) {
    return ''
  }

  // @ts-ignore
  construct(indent: string, properties: Record<string, IProperty>) {
    return ''
  }

  declareMethod(indent: string, method: IMethod) {
    return this.methodSignature(indent, method)
      + this.httpCall(this.bumper(indent), method)
      + `\n${indent}}`
  }

  typeSignature(indent: string, type: IType) {
    const bump = this.bumper(indent)
    const b2 = this.bumper(bump)
    const attrs: string[] = []
    Object.values(type.properties)
        .forEach((prop) => attrs.push(`${b2}${prop.name} : ${prop.description}`))

    return this.commentHeader(indent, type.description) +
      `${indent}export interface I${type.name}{\n`
  }

  // @ts-ignore
  errorResponses(indent: string, method: IMethod) {
    const results: string[] = method.errorResponses
      .map(r => `I${r.type.name}`)
    return results.join(' | ')
  }

  httpPath(path : string) {
    if (path.indexOf('{') >= 0) return '`' + path.replace(/{/gi, '${') + '`'
    return `'${path}'`
  }

  httpCall(indent: string, method: IMethod) {
    const type = this.typeMap(method.type)
    const bump = indent + this.indentStr
    const args = this.httpArgs(bump, method)
    const errors = this.errorResponses(indent, method)
    return `${indent}return ${this.it(method.httpMethod.toLowerCase())}<${type.name}, ${errors}>(${this.httpPath(method.endpoint)}${args ? ", " +args: ""})`
  }

  summary(indent: string, text: string | undefined) {
    return this.commentHeader(indent, text)
  }

  typeNames() {
    let names : string[] = []
    if (!this.api) return names
    // include Error in the import
    this.api.types['Error'].refCount++
    Object.values(this.api.sortedTypes())
      .filter((type) => (type.refCount > 0) && ! (type instanceof IntrinsicType))
      .forEach((type) => names.push(`I${type.name}`))
    return names
  }

  typeMap(type: IType): IMappedType {
    // TODO why doesn't this work?
    super.typeMap(type)
    // type.refCount++

    const tsTypes: Record<string, IMappedType> = {
      'number': { name: 'number', default: '0.0' },
      'float': { name: 'number', default: '0.0' },
      'double': { name: 'number', default: '0.0' },
      'integer': { name: 'number', default: '0' },
      'int32': { name: 'number', default: '0' },
      'int64': { name: 'number', default: '0' },
      'string': { name: 'string', default: '""' },
      'password': {name: 'Password', default: this.nullStr},
      'byte': {name: 'binary', default: this.nullStr},
      'boolean': {name: 'boolean', default: ''},
      'uri': {name: 'URL', default: this.nullStr},
      'url': {name: 'URL', default: this.nullStr},
      'datetime': {name: 'Date', default: ''},
      'date': {name: 'Date', default: ''},
      'object': {name: 'any', default: ''},
      'void': {name: 'void', default: ''}
    }

    if (type.elementType) {
      const map  = this.typeMap(type.elementType)
      return {name: `${map.name}[]`, default: '[]'}
    }

    if (type.name) {
      return tsTypes[type.name] || {name: `I${type.name}`, default: this.nullStr }
    } else {
      throw new Error('Cannot output a nameless type.')
    }
  }
}
