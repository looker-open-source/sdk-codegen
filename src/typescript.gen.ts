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

import {
  Arg,
  IMappedType,
  IMethod,
  IParameter,
  IProperty,
  IType,
  IntrinsicType,
  ArrayType,
  HashType,
  strBody,
} from './sdkModels'
import { CodeGen, warnEditing } from './codeGen'
import * as fs from 'fs'
import * as prettier from 'prettier'
import { warn, isFileSync, utf8, success } from './utils'

// const strDefault = 'Default'

export class TypescriptGen extends CodeGen {
  codePath = './typescript/'
  packagePath = 'looker'
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

  static useRequest(method: IMethod) {
    return method.optionalParams.length > 1
  }

  // @ts-ignore
  methodsPrologue(indent: string) {
    return `
// ${warnEditing}
import { APIMethods } from '../rtl/apiMethods'
import { ITransportSettings } from '../rtl/transport'
import { IDictionary, ${this.typeNames().join(', ')} } from './models'

export class ${this.packageName} extends APIMethods {
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

export interface IDictionary<T> {
  [key: string]: T
}

`
  }

  // @ts-ignore
  modelsEpilogue(indent: string) {
    return ''
  }

  declareProperty(indent: string, property: IProperty) {
    const optional = property.nullable ? '?' : ''
    if (property.name === strBody) {
      // TODO refactor this hack to track context when the body parameter is created for the request type
      property.type.refCount++
      return this.commentHeader(indent, property.description || 'body parameter for dynamically created request type')
        + `${indent}${property.name}${optional}: Partial<I${property.type.name}>`
    }
    const type = this.typeMap(property.type)
    return this.commentHeader(indent, property.description)
      + `${indent}${property.name}${optional}: ${type.name}`
  }

  methodSignature(indent: string, method: IMethod) {
    const type = this.typeMap(method.type)
    const header = this.commentHeader(indent, `${method.httpMethod} ${method.endpoint} -> ${type.name}`)
      + `${indent}async ${method.name}(`
    let fragment = ''
    const requestType = this.requestTypeName(method)
    const bump = indent + this.indentStr

    if (requestType) {
      // use the request type that will be generated in models.ts
      fragment = `request: Partial<I${requestType}>`
    } else {
      let params: string[] = []
      const args = method.allParams // get the params in signature order
      if (args && args.length > 0) args.forEach(p => params.push(this.declareParameter(bump, p)))
      fragment = params.length > 0 ? `\n${params.join(this.paramDelimiter)}` : ''
    }
    return header + fragment + `${fragment? ',' : ''}\n${bump}options?: Partial<ITransportSettings>) {\n`
  }

  declareParameter(indent: string, param: IParameter) {
    let type = (param.location === strBody)
      ? this.writeableType(param.type) || param.type
      : param.type
    const mapped = this.typeMap(type)
    if (param.location === strBody) mapped.name = `Partial<${mapped.name}>`
    return this.commentHeader(indent, param.description)
      + `${indent}${param.name}: ${mapped.name}`
      + (param.required ? '' : (mapped.default ? ` = ${mapped.default}` : ''))
  }

  // @ts-ignore
  initArg(indent: string, property: IProperty) {
    return ''
  }

  // @ts-ignore
  construct(indent: string, type: IType) {
    return ''
  }

  declareMethod(indent: string, method: IMethod) {
    const bump = this.bumper(indent)
    // const request = this.requestTypeName(method)
    // const defaultName = request ? `${strDefault}${request.substring(strRequest.length)}` : ''
    // const defaulter = defaultName? `${bump}request = { ...${defaultName}, ...request}\n` : ''
    const defaulter = ''
    return this.methodSignature(indent, method)
      + defaulter
      + this.httpCall(bump, method)
      + `\n${indent}}`
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

  httpPath(path: string, prefix?: string) {
    prefix = prefix || ''
    if (path.indexOf('{') >= 0) return 'encodeURI(`' + path.replace(/{/gi, '${' + prefix) + '`)'
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
      ? `\n${indent}${prefix}${args.join(this.argDelimiter + prefix)}`
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

  // build the http argument list from back to front, so trailing undefined arguments
  // can be omitted. Path arguments are resolved as part of the path parameter to general
  // purpose API method call
  // e.g.
  //   {queryArgs...}, bodyArg, {headerArgs...}, {cookieArgs...}
  //   {queryArgs...}, null, null, {cookieArgs...}
  //   null, bodyArg

  //   {queryArgs...}
  httpArgs(indent: string, method: IMethod) {
    const request = TypescriptGen.useRequest(method) ? 'request.' : ''
    // add options at the end of the request calls. this will cause all other arguments to be
    // filled in but there's no way to avoid this for passing in the last optional parameter.
    // Fortunately, this code bloat is minimal and also hidden from the consumer.
    let result = this.argFill('', 'options')
    // let result = this.argFill('', this.argGroup(indent, method.cookieArgs, request))
    // result = this.argFill(result, this.argGroup(indent, method.headerArgs, request))
    result = this.argFill(result, method.bodyArg ? `${request}${method.bodyArg}` : this.nullStr)
    result = this.argFill(result, this.argGroup(indent, method.queryArgs, request))
    return result
  }

  httpCall(indent: string, method: IMethod) {
    const request = TypescriptGen.useRequest(method) ? 'request.' : ''
    const type = this.typeMap(method.type)
    const bump = indent + this.indentStr
    const args = this.httpArgs(bump, method)
    const errors = this.errorResponses(indent, method)
    return `${indent}return ${this.it(method.httpMethod.toLowerCase())}<${type.name}, ${errors}>(${this.httpPath(method.endpoint, request)}${args ? ', ' + args : ''})`
  }

  summary(indent: string, text: string | undefined) {
    return this.commentHeader(indent, text)
  }

  typeNames() {
    let names: string[] = []
    if (!this.api) return names
    // include Error in the import
    this.api.types['Error'].refCount++
    const types = this.api.sortedTypes()
    Object.values(types)
      .filter(type => (type.refCount > 0) && !(type instanceof IntrinsicType))
      .forEach(type => names.push(`I${type.name}`))
    // TODO import default constants if necessary
    // Object.values(types)
    //   .filter(type => type instanceof RequestType)
    //   .forEach(type => names.push(`${strDefault}${type.name.substring(strRequest.length)}`))
    return names
  }

  versionStamp() {
    if (this.versions) {
      const stampFile = this.fileName('rtl/versions')
      if (!isFileSync(stampFile)) {
        warn(`${stampFile} was not found. Skipping version update.`)
      }
      let content = fs.readFileSync(stampFile, utf8)
      const lookerPattern = /lookerVersion = ['"].*['"]/i
      const apiPattern = /apiVersion = ['"].*['"]/i
      const envPattern = /environmentPrefix = ['"].*['"]/i
      content = content.replace(lookerPattern, `lookerVersion = '${this.versions.lookerVersion}'`)
      content = content.replace(apiPattern, `apiVersion = '${this.versions.apiVersion}'`)
      content = content.replace(envPattern, `environmentPrefix = '${this.packageName.toUpperCase()}'`)
      fs.writeFileSync(stampFile, content, {encoding: utf8})
      success(`updated ${stampFile} to ${this.versions.apiVersion}.${this.versions.lookerVersion}`)
    } else {
      warn('Version information was not retrieved. Skipping SDK version updating.')
    }
    return this.versions
  }

  typeMap(type: IType): IMappedType {
    super.typeMap(type)

    const tsTypes: Record<string, IMappedType> = {
      'number': {name: 'number', default: '0.0'},
      'float': {name: 'number', default: '0.0'},
      'double': {name: 'number', default: '0.0'},
      'integer': {name: 'number', default: '0'},
      'int32': {name: 'number', default: '0'},
      'int64': {name: 'number', default: '0'},
      'string': {name: 'string', default: '""'},
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
      // This is a structure with nested types
      const map = this.typeMap(type.elementType)
      if (type instanceof ArrayType) {
        return {name: `${map.name}[]`, default: '[]'}
      } else if (type instanceof HashType) {
        // must be HashType
        return {name: `IDictionary<${map.name}>`, default: '{}'}
      }
      throw new Error(`Don't know how to handle: ${JSON.stringify(type)}`)
    }

    if (type.name) {
      return tsTypes[type.name] || {name: `I${type.name}`, default: ''} // No null default for complex types
    } else {
      throw new Error('Cannot output a nameless type.')
    }
  }

  reformatFile(fileName: string) {
    const formatOptions: prettier.Options = {
      semi: false,
      trailingComma: 'all',
      bracketSpacing: true,
      parser: 'typescript',
      singleQuote: true,
      proseWrap: 'preserve',
      quoteProps: 'as-needed',
      endOfLine: 'auto'
    }
    const name = super.reformatFile(fileName)
    if (name) {
      const source = prettier.format(fs.readFileSync(name, utf8), formatOptions)
      if (source) {
        fs.writeFileSync(name, source, {encoding: utf8})
        return name
      }
    }
    return ''
  }
}
