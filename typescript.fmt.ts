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

import {Arg, IMappedType, IMethod, IParameter, IProperty, IType, IntrinsicType, RequestType} from "./sdkModels"
import {CodeFormatter, warnEditing} from "./codeFormatter"

// tslint:disable-next-line: variable-name
const Request_ = 'Request_'
// tslint:disable-next-line: variable-name
const Default_ = 'Default_'
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

  declareProperty(indent: string, property: IProperty) {
    const type = this.typeMap(property.type)
    const optional = property.nullable ? '?' : ''
    return this.commentHeader(indent, property.description)
      + `${indent}${property.name}${optional}: ${type.name}`
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
      + `${indent}export class ${Request_}${method.name} {\n`
      + defaults.join(this.propDelimiter)
      + `${indent}}\n\n`
  }

  methodSignature(indent: string, method: IMethod) {
    const type = this.typeMap(method.type)
    const header = this.commentHeader(indent, `${method.httpMethod} ${method.endpoint} -> ${type.name}`)
      + `${indent}async ${method.name}(`
    let fragment = ''
    const requestType = this.requestTypeName(method)

    if (requestType) {
      // use the request type that will be generated in models.ts
      fragment = `request: Partial<I${requestType}>`
    } else {
      const bump = indent + this.indentStr
      let params: string[] = []
      const args = method.allParams // get the params in signature order
      if (args && args.length > 0) args.forEach(p => params.push(this.declareParameter(bump, p)))
        fragment = `\n${params.join(this.paramDelimiter)}`
    }
    return header + fragment + ') {\n'
  }

  declareParameter(indent: string, param: IParameter) {
    const type = this.typeMap(param.type)
    return this.commentHeader(indent, param.description)
      + `${indent}${param.name}: ${type.name}`
      + (param.required ? '' : (type.default ? ` = ${type.default}` : ''))
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
    const bump = this.bumper(indent)
    // const request = this.requestTypeName(method)
    // const defaultName = request ? `${Default_}${request.substring(Request_.length)}` : ''
    // const defaulter = defaultName? `${bump}request = { ...${defaultName}, ...request}\n` : ''
    const defaulter = ''
    return this.methodSignature(indent, method)
      + defaulter
      + this.httpCall(bump, method)
      + `\n${indent}}`
  }

  generateDefaults(indent: string, type: IType) {
    let result = ''
    if (!(type instanceof RequestType)) return result
    const bump = this.bumper(indent)
    result += this.commentHeader(indent, `Default constants for optional properties of I${type.name}`)
    const name = `${Default_}${type.name.substring(Request_.length)}`
    result += `${indent}export const ${name} = {\n`
    let options: string[] = []
    Object.entries(type.properties).forEach(([name, prop]) => {
      const mapped = this.typeMap(prop.type)
      if (prop.nullable && mapped.default) {
        options.push(`${bump}${name}: ${mapped.default}`)
      }
    })
    return result
      + options.join(this.paramDelimiter)
      + `${indent}}\n\n`
  }

  typeSignature(indent: string, type: IType) {
    // return this.generateDefaults(indent, type) +
    return this.commentHeader(indent, type.description) +
      `${indent}export interface I${type.name}{\n`
  }

  // @ts-ignore
  errorResponses(indent: string, method: IMethod) {
    const results: string[] = method.errorResponses
      .map(r => `I${r.type.name}`)
    return results.join(' | ')
  }

  httpPath(path : string, prefix?: string) {
    prefix = prefix || ''
    if (path.indexOf('{') >= 0) return '`' + path.replace(/{/gi, '${'+prefix) + '`'
    return `'${path}'`
  }

  // @ts-ignore
  argGroup(indent: string, args: Arg[], prefix?: string) {
    if ((!args) || args.length === 0) return this.nullStr
    let hash: string[] = []
    for (let arg of args) {
      if (prefix) {
        hash.push(`${arg}: ${prefix}${arg}`)
      } else {
        hash.push(arg)
      }
    }
    return `\n${indent}{${hash.join(this.argDelimiter)}}`
  }

  // @ts-ignore
  argList(indent: string, args: Arg[], prefix?: string) {
    prefix = prefix || ''
    return args && args.length !== 0
          ? `\n${indent}${prefix}${args.join(this.argDelimiter+prefix)}`
          : this.nullStr
  }

  // this is a builder function to produce arguments with optional null place holders but no extra required optional arguments
  argFill(current: string, args: string) {
      if ((!current) && args.trim() === this.nullStr) {
          // Don't append trailing optional arguments if none have been set yet
          return ''
      }
      return `${args}${current ? this.argDelimiter : ''}${current}`
  }

  useRequest(method: IMethod) {
    return method.optionalParams.length > 1
  }

  // build the http argument list from back to front, so trailing undefined arguments
  // can be omitted. Path arguments are resolved as part of the path parameter to general
  // purpose API method call
  // e.g.
  //   {queryArgs...}, bodyArg, {headerArgs...}, {cookieArgs...}
  //   {queryArgs...}, null, null, {cookieArgs...}
  //   null, bodyArg
  //   {queryArgs...}
  httpArgs(indent: string, method: IMethod) {
      const request = this.useRequest(method) ? 'request.' : ''
      let result = this.argFill('', this.argGroup(indent, method.cookieArgs, request))
      result = this.argFill(result, this.argGroup(indent, method.headerArgs, request))
      result = this.argFill(result, method.bodyArg ? `${request}${method.bodyArg}` : this.nullStr)
      result = this.argFill(result, this.argGroup(indent, method.queryArgs, request))
      return result
  }

  httpCall(indent: string, method: IMethod) {
    const request = this.useRequest(method) ? 'request.' : ''
    const type = this.typeMap(method.type)
    const bump = indent + this.indentStr
    const args = this.httpArgs(bump, method)
    const errors = this.errorResponses(indent, method)
    return `${indent}return ${this.it(method.httpMethod.toLowerCase())}<${type.name}, ${errors}>(${this.httpPath(method.endpoint, request)}${args ? ", " +args: ""})`
  }

  summary(indent: string, text: string | undefined) {
    return this.commentHeader(indent, text)
  }

  typeNames() {
    let names : string[] = []
    if (!this.api) return names
    // include Error in the import
    this.api.types['Error'].refCount++
    const types = this.api.sortedTypes()
    Object.values(types)
      .filter(type => (type.refCount > 0) && ! (type instanceof IntrinsicType))
      .forEach(type => names.push(`I${type.name}`))
    // TODO import default constants if necessary
    // Object.values(types)
    //   .filter(type => type instanceof RequestType)
    //   .forEach(type => names.push(`${Default_}${type.name.substring(Request_.length)}`))
    return names
  }

  typeMap(type: IType): IMappedType {
    // TODO why doesn't this work? Or does it now?
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
      'datetime': {name: 'Date', default: ''}, // TODO is there a default expression for datetime?
      'date': {name: 'Date', default: ''}, // TODO is there a default expression for date?
      'object': {name: 'any', default: ''},
      'void': {name: 'void', default: ''}
    }

    if (type.elementType) {
      const map  = this.typeMap(type.elementType)
      return {name: `${map.name}[]`, default: '[]'}
    }

    if (type.name) {
      return tsTypes[type.name] || {name: `I${type.name}`, default: '' } // No null default for complex types
    } else {
      throw new Error('Cannot output a nameless type.')
    }
  }
}
