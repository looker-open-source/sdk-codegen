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

import { commentBlock } from '@looker/sdk-codegen-utils'
import {
  Arg,
  IMappedType,
  IMethod,
  IParameter,
  IProperty,
  IType,
  strBody,
} from './sdkModels'
import { CodeGen } from './codeGen'

/**
 * TypeScript code generator
 */
export class TypescriptGen extends CodeGen {
  /**
   * special case for Typescript output path due to mono repository
   */
  codePath = './packages/'
  /**
   * special case for Typescript output path due to mono repository
   */
  packagePath = 'sdk/src'
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
  willItStream = true

  // @ts-ignore
  methodsPrologue(indent: string) {
    // TODO get the rtl path alias to work correctly in all scenarios! !!
    return `
// ${this.warnEditing()}
import { APIMethods } from '../../rtl/apiMethods'
import { IAuthSession } from '../../rtl/authSession'
import { ITransportSettings, encodeParam } from '../../rtl/transport'
/**
 * DelimArray is primarily used as a self-documenting format for csv-formatted array parameters
 */
import { DelimArray } from '../../rtl/delimArray'
import { ${this.packageName}Stream } from './streams'
import { IDictionary, ${this.typeNames().join(', ')} } from './models'

export class ${this.packageName} extends APIMethods {

  public stream: ${this.packageName}Stream
  
  constructor(authSession: IAuthSession) {
    super(authSession, '${this.apiVersion}')
    this.stream = new ${this.packageName}Stream(authSession)  
  }
  
`
  }

  // @ts-ignore
  streamsPrologue(indent: string): string {
    return `
// ${this.warnEditing()}
import { Readable } from 'readable-stream'
import { APIMethods } from '../../rtl/apiMethods'
import { IAuthSession } from '../../rtl/authSession'
import { ITransportSettings, encodeParam } from '../../rtl/transport'
/**
 * DelimArray is primarily used as a self-documenting format for csv-formatted array parameters
 */
import { DelimArray } from '../../rtl/delimArray'
import { IDictionary, ${this.typeNames(false).join(', ')} } from './models'

export class ${this.packageName}Stream extends APIMethods {
  constructor(authSession: IAuthSession) {
    super(authSession, '${this.apiVersion}')
  }
`
  }

  // @ts-ignore
  methodsEpilogue(indent: string) {
    return '\n}'
  }

  // @ts-ignore
  modelsPrologue(indent: string) {
    return `
// ${this.warnEditing()}

import { Url } from '../../rtl/constants'
import { DelimArray } from '../../rtl/delimArray'

export interface IDictionary<T> {
  [key: string]: T
}

`
  }

  // @ts-ignore
  modelsEpilogue(indent: string) {
    return ''
  }

  commentHeader(indent: string, text: string | undefined) {
    return text
      ? `${indent}/**\n${commentBlock(text, indent, ' * ')}\n${indent} */\n`
      : ''
  }

  declareProperty(indent: string, property: IProperty) {
    const optional = !property.required ? '?' : ''
    if (property.name === strBody) {
      // TODO refactor this hack to track context when the body parameter is created for the request type
      property.type.refCount++
      // No longer using Partial<T> because required and optional are supposed to be accurate
      return (
        this.commentHeader(
          indent,
          property.description ||
            'body parameter for dynamically created request type'
        ) + `${indent}${property.name}${optional}: I${property.type.name}`
      )
    }
    const type = this.typeMap(property.type)
    return (
      this.commentHeader(indent, this.describeProperty(property)) +
      `${indent}${property.name}${optional}: ${type.name}`
    )
  }

  paramComment(param: IParameter, mapped: IMappedType) {
    return `@param {${mapped.name}} ${param.name} ${param.description}`
  }

  declareParameter(indent: string, method: IMethod, param: IParameter) {
    const type =
      param.location === strBody
        ? this.writeableType(param.type, method) || param.type
        : param.type
    const mapped = this.typeMap(type)
    let pOpt = ''
    if (param.location === strBody) {
      mapped.name = `Partial<${mapped.name}>`
    }
    if (!param.required) {
      pOpt = mapped.default ? '' : '?'
    }
    return (
      this.commentHeader(indent, this.paramComment(param, mapped)) +
      `${indent}${param.name}${pOpt}: ${mapped.name}` +
      (param.required ? '' : mapped.default ? ` = ${mapped.default}` : '')
    )
  }

  // @ts-ignore
  initArg(indent: string, property: IProperty) {
    return ''
  }

  // @ts-ignore
  construct(indent: string, type: IType) {
    return ''
  }

  methodHeaderDeclaration(indent: string, method: IMethod, streamer = false) {
    const type = this.typeMap(method.type)
    const head = method.description?.trim()
    let headComment =
      (head ? `${head}\n\n` : '') +
      `${method.httpMethod} ${method.endpoint} -> ${type.name}`
    let fragment = ''
    const requestType = this.requestTypeName(method)
    const bump = indent + this.indentStr

    if (requestType) {
      // use the request type that will be generated in models.ts
      // No longer using Partial<T> by default here because required and optional are supposed to be accurate
      // However, for update methods (iow, patch) Partial<T> is still necessary since only the delta gets set
      fragment =
        method.httpMethod === 'PATCH'
          ? `request: Partial<I${requestType}>`
          : `request: I${requestType}`
    } else {
      const params: string[] = []
      const args = method.allParams // get the params in signature order
      if (args && args.length > 0)
        args.forEach((p) => params.push(this.declareParameter(bump, method, p)))
      fragment =
        params.length > 0 ? `\n${params.join(this.paramDelimiter)}` : ''
    }
    if (method.responseIsBoth()) {
      headComment += `\n\n**Note**: Binary content may be returned by this method.`
    } else if (method.responseIsBinary()) {
      headComment += `\n\n**Note**: Binary content is returned by this method.\n`
    }
    const callback = `callback: (readable: Readable) => Promise<${type.name}>,`
    const header =
      this.commentHeader(indent, headComment) +
      `${indent}async ${method.name}(` +
      (streamer ? `\n${bump}${callback}` : '')

    return (
      header +
      fragment +
      `${
        fragment ? ',' : ''
      }\n${bump}options?: Partial<ITransportSettings>) {\n`
    )
  }

  methodSignature(indent: string, method: IMethod) {
    return this.methodHeaderDeclaration(indent, method, false)
  }

  encodePathParams(indent: string, method: IMethod) {
    const bump = indent + this.indentStr
    let encodings = ''
    if (method.pathParams.length > 0) {
      for (const param of method.pathParams) {
        if (param.doEncode()) {
          const name = this.useRequest(method)
            ? `request.${param.name}`
            : param.name
          encodings += `${bump}${name} = encodeParam(${name})\n`
        }
      }
    }
    return encodings
  }

  declareMethod(indent: string, method: IMethod) {
    const bump = this.bumper(indent)
    return (
      this.methodSignature(indent, method) +
      this.encodePathParams(bump, method) +
      this.httpCall(bump, method) +
      `\n${indent}}`
    )
  }

  streamerSignature(indent: string, method: IMethod) {
    return this.methodHeaderDeclaration(indent, method, true)
  }

  declareStreamer(indent: string, method: IMethod) {
    const bump = this.bumper(indent)
    return (
      this.streamerSignature(indent, method) +
      this.encodePathParams(bump, method) +
      this.streamCall(bump, method) +
      `\n${indent}}`
    )
  }

  typeSignature(indent: string, type: IType) {
    return (
      this.commentHeader(indent, type.description) +
      `${indent}export interface I${type.name}{\n`
    )
  }

  // @ts-ignore
  errorResponses(indent: string, method: IMethod) {
    const results: string[] = method.errorResponses.map(
      (r) => `I${r.type.name}`
    )
    return results.join(' | ')
  }

  httpPath(path: string, prefix?: string) {
    prefix = prefix || ''
    if (path.indexOf('{') >= 0)
      return `\`${path.replace(/{/gi, '${' + prefix)}\``
    return `'${path}'`
  }

  // @ts-ignore
  argGroup(indent: string, args: Arg[], prefix?: string) {
    if (!args || args.length === 0) return this.nullStr
    const hash: string[] = []
    for (const arg of args) {
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
    if (!current && args.trim() === this.nullStr) {
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
    const request = this.useRequest(method) ? 'request.' : ''
    // add options at the end of the request calls. this will cause all other arguments to be
    // filled in but there's no way to avoid this for passing in the last optional parameter.
    // Fortunately, this code bloat is minimal and also hidden from the consumer.
    let result = this.argFill('', 'options')
    // let result = this.argFill('', this.argGroup(indent, method.cookieArgs, request))
    // result = this.argFill(result, this.argGroup(indent, method.headerArgs, request))
    result = this.argFill(
      result,
      method.bodyArg ? `${request}${method.bodyArg}` : this.nullStr
    )
    result = this.argFill(
      result,
      this.argGroup(indent, method.queryArgs, request)
    )
    return result
  }

  httpCall(indent: string, method: IMethod) {
    const request = this.useRequest(method) ? 'request.' : ''
    const type = this.typeMap(method.type)
    const bump = indent + this.indentStr
    const args = this.httpArgs(bump, method)
    const errors = this.errorResponses(indent, method)
    return `${indent}return ${this.it(method.httpMethod.toLowerCase())}<${
      type.name
    }, ${errors}>(${this.httpPath(method.endpoint, request)}${
      args ? ', ' + args : ''
    })`
  }

  streamCall(indent: string, method: IMethod) {
    const request = this.useRequest(method) ? 'request.' : ''
    const type = this.typeMap(method.type)
    const bump = indent + this.indentStr
    const args = this.httpArgs(bump, method)
    // const errors = this.errorResponses(indent, method)
    return `${indent}return ${this.it('authStream')}<${
      type.name
    }>(callback, '${method.httpMethod.toUpperCase()}', ${this.httpPath(
      method.endpoint,
      request
    )}${args ? ', ' + args : ''})`
  }

  summary(indent: string, text: string | undefined) {
    return this.commentHeader(indent, text)
  }

  typeNames(countError = true) {
    const names: string[] = []
    if (!this.api) return names
    if (countError) {
      this.api.types.Error.refCount++
    } else {
      this.api.types.Error.refCount = 0
    }
    const types = this.api.sortedTypes()
    Object.values(types)
      .filter((type) => type.refCount > 0 && !type.intrinsic)
      .forEach((type) => names.push(`I${type.name}`))
    // TODO import default constants if necessary
    // Object.values(types)
    //   .filter(type => type instanceof RequestType)
    //   .forEach(type => names.push(`${strDefault}${type.name.substring(strRequest.length)}`))
    return names
  }

  typeMap(type: IType): IMappedType {
    super.typeMap(type)
    const mt = ''

    const tsTypes: Record<string, IMappedType> = {
      boolean: { default: mt, name: 'boolean' },
      // TODO can we use blob for binary somehow? https://developer.mozilla.org/en-US/docs/Web/API/Blob
      byte: { default: mt, name: 'binary' },

      // TODO is there a default expression for datetime?
      date: { default: mt, name: 'Date' },

      datetime: { default: mt, name: 'Date' },

      double: { default: mt, name: 'number' },

      float: { default: mt, name: 'number' },

      int32: { default: mt, name: 'number' },

      int64: { default: mt, name: 'number' },

      integer: { default: mt, name: 'number' },

      number: { default: mt, name: 'number' },

      // TODO is there a default expression for date?
      object: { default: mt, name: 'any' },

      password: { default: mt, name: 'Password' },

      string: { default: mt, name: 'string' },

      uri: { default: mt, name: 'Url' },
      url: { default: mt, name: 'Url' },
      void: { default: mt, name: 'void' },
    }

    if (type.elementType) {
      // This is a structure with nested types
      const map = this.typeMap(type.elementType)
      switch (type.className) {
        case 'ArrayType':
          return { default: '[]', name: `${map.name}[]` }
        case 'HashType':
          return { default: '{}', name: `IDictionary<${map.name}>` }
        case 'DelimArrayType':
          return { default: '', name: `DelimArray<${map.name}>` }
      }
      throw new Error(`Don't know how to handle: ${JSON.stringify(type)}`)
    }

    if (type.name) {
      return tsTypes[type.name] || { default: '', name: `I${type.name}` } // No null default for complex types
    } else {
      throw new Error('Cannot output a nameless type.')
    }
  }
}
