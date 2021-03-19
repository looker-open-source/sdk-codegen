/*

 MIT License

 Copyright (c) 2021 Looker Data Sciences, Inc.

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

import {
  Arg,
  ArgValues,
  EnumType,
  IMethod,
  IParameter,
  IProperty,
  isSpecialName,
  IType,
  strBody,
} from './sdkModels'
import {
  CodeAssignment,
  CodeGen,
  IMappedType,
  trimInputs,
  commentBlock,
} from './codeGen'

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
  willItStream = true
  useNamedParameters = false
  useNamedArguments = false

  sdkFileName(baseFileName: string) {
    return this.fileName(`${this.versions?.spec.key}/${baseFileName}`)
  }

  methodsPrologue(_indent: string) {
    return `
import { APIMethods, DelimArray, IAuthSession, ITransportSettings, encodeParam } from '@looker/sdk-rtl'
/**
 * ${this.warnEditing()}
 *
 */
import { sdkVersion } from '../constants'
import { IDictionary, ${this.typeNames().join(', ')} } from './models'

export class ${this.packageName} extends APIMethods {
  static readonly ApiVersion = '${this.apiVersion}'
  constructor(authSession: IAuthSession) {
    super(authSession, sdkVersion)
    this.apiVersion = ${this.packageName}.ApiVersion
    this.apiPath =
      authSession.settings.base_url === ''
        ? ''
        : authSession.settings.base_url + '/api/' + this.apiVersion
  }

`
  }

  streamsPrologue(_indent: string): string {
    return `
import { Readable } from 'readable-stream'
import { APIMethods, IAuthSession, DelimArray, ITransportSettings, encodeParam } from '@looker/sdk-rtl'
/**
 * ${this.warnEditing()}
 *
 */
import { sdkVersion } from '../constants'
import { IDictionary, ${this.typeNames(false).join(', ')} } from './models'

export class ${this.packageName}Stream extends APIMethods {
  static readonly ApiVersion = '${this.apiVersion}'
  constructor(authSession: IAuthSession) {
    super(authSession, sdkVersion)
    this.apiVersion = ${this.packageName}Stream.ApiVersion
    this.apiPath =
      authSession.settings.base_url === ''
        ? ''
        : authSession.settings.base_url + '/api/' + this.apiVersion
  }
`
  }

  methodsEpilogue(_indent: string) {
    return '\n}'
  }

  modelsPrologue(_indent: string) {
    return `
import { DelimArray, Url } from '@looker/sdk-rtl'

/*
 * ${this.warnEditing()}
 */

export interface IDictionary<T> {
  [key: string]: T
}

`
  }

  modelsEpilogue(_indent: string) {
    return ''
  }

  commentHeader(indent: string, text: string | undefined, commentStr = ' * ') {
    if (!text) return ''
    const commentPrefix =
      text.includes(' License') && text.includes('Copyright (c)') ? '/*' : '/**'
    if (commentStr === ' ') {
      return `${indent}${commentPrefix}\n\n${commentBlock(
        text,
        indent,
        commentStr
      )}\n\n${indent} */\n`
    }
    return `${indent}${commentPrefix}\n${commentBlock(
      text,
      indent,
      commentStr
    )}\n${indent} */\n`
  }

  beginRegion(indent: string, description: string): string {
    return `${indent}//#region ${description}`
  }

  endRegion(indent: string, description: string): string {
    return `${indent}//#endregion ${description}`
  }

  declareProperty(indent: string, property: IProperty) {
    const optional = !property.required ? '?' : ''
    if (property.name === strBody) {
      // TODO refactor this hack to track context when the body parameter is created for the request type
      property.type.refCount++
      return (
        this.commentHeader(
          indent,
          property.description ||
            'body parameter for dynamically created request type'
        ) +
        `${indent}${property.name}${optional}: ${this.typeName(property.type)}`
      )
    }
    const mapped = this.typeMap(property.type)
    return (
      this.commentHeader(indent, this.describeProperty(property)) +
      `${indent}${this.reserve(property.name)}${optional}: ${mapped.name}`
    )
  }

  paramComment(param: IParameter, mapped: IMappedType) {
    // TODO remove mapped name type signature?
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
      `${indent}${this.reserve(param.name)}${pOpt}: ${mapped.name}` +
      (param.required ? '' : mapped.default ? ` = ${mapped.default}` : '')
    )
  }

  makeTheCall(method: IMethod, inputs: ArgValues): string {
    inputs = trimInputs(inputs)
    const resp = `let response = await sdk.ok(sdk.${method.name}(`
    const args = this.assignParams(method, inputs)
    return `${resp}${args}))`
  }

  methodHeaderDeclaration(indent: string, method: IMethod, streamer = false) {
    const mapped = this.typeMap(method.type)
    const head = method.description?.trim()
    let headComment =
      (head ? `${head}\n\n` : '') +
      `${method.httpMethod} ${method.endpoint} -> ${mapped.name}`
    let fragment: string
    const requestType = this.requestTypeName(method)
    const bump = this.bumper(indent)

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
    const callback = `callback: (readable: Readable) => Promise<${mapped.name}>,`
    const header =
      this.commentHeader(indent, headComment) +
      `${indent}async ${method.name}(` +
      (streamer ? `\n${bump}${callback}` : '')

    return (
      header +
      fragment +
      (fragment ? ', ' : '') +
      'options?: Partial<ITransportSettings>) {\n'
    )
  }

  methodSignature(indent: string, method: IMethod) {
    return this.methodHeaderDeclaration(indent, method, false)
  }

  encodePathParams(indent: string, method: IMethod) {
    const bump = indent + this.indentStr
    let encodings = ''
    if (method.pathParams.length > 0) {
      const prefix = this.useRequest(method) ? 'request' : ''
      for (const param of method.pathParams) {
        if (param.doEncode()) {
          const name = this.accessor(param.name, prefix)
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
      this.encodePathParams(indent, method) +
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

  reserve(name: string): string {
    if (!isSpecialName(name)) return name
    return `'${name}'`
  }

  private typeName(type: IType) {
    if (type.customType && !(type instanceof EnumType)) {
      return this.reserve(`I${type.name}`)
    }
    return this.reserve(type.name)
  }

  typeSignature(indent: string, type: IType) {
    const meta = type instanceof EnumType ? 'enum' : 'interface'
    return (
      this.commentHeader(indent, type.description) +
      `${indent}export ${meta} ${this.typeName(type)} ${this.typeOpen}\n`
    )
  }

  errorResponses(_indent: string, method: IMethod) {
    const results: string[] = method.errorResponses.map(
      (r) => `${this.typeName(r.type)}`
    )
    return results.join(' | ')
  }

  httpPath(path: string, prefix?: string) {
    prefix = prefix || ''
    if (path.indexOf('{') >= 0)
      return `\`${path.replace(/{/gi, '${' + prefix)}\``
    return `'${path}'`
  }

  argGroup(_indent: string, args: Arg[], prefix?: string) {
    if (!args || args.length === 0) return this.nullStr
    const hash: string[] = []
    for (const arg of args) {
      const reserved = this.reserve(arg)
      if (prefix) {
        hash.push(`${reserved}: ${this.accessor(arg, prefix)}`)
      } else {
        hash.push(reserved)
      }
    }
    return `{${hash.join(this.argDelimiter)}}`
  }

  /**
   * Determine the type of accessor needed for the symbol name
   *
   * If the prefix is defined:
   *   If the name is special, use array accessor
   *   If the name is simple, use dotted notation
   *
   * With no prefix, return the "reserved" version of the name, which may be the same as name
   *
   * @param name variable to access
   * @param prefix optional prefix for accessor
   * @returns one of 4 possible accessor patterns
   */
  accessor(name: string, prefix?: string) {
    const reserved = this.reserve(name)
    if (!prefix) return reserved
    if (reserved === name) return `${prefix}.${name}`
    return `${prefix}[${reserved}]`
  }

  argList(indent: string, args: Arg[], prefix?: string) {
    prefix = prefix || ''
    const bits = args.map((a) => this.accessor(a, prefix))

    return args && args.length !== 0
      ? `\n${indent}${bits.join(this.argDelimiter)}`
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
    const request = this.useRequest(method) ? 'request' : ''
    // add options at the end of the request calls. this will cause all other arguments to be
    // filled in but there's no way to avoid this for passing in the last optional parameter.
    // Fortunately, this code bloat is minimal and also hidden from the consumer.
    let result = this.argFill('', 'options')
    // let result = this.argFill('', this.argGroup(indent, method.cookieArgs, request))
    // result = this.argFill(result, this.argGroup(indent, method.headerArgs, request))
    result = this.argFill(
      result,
      method.bodyArg ? this.accessor(method.bodyArg, request) : this.nullStr
    )
    result = this.argFill(
      result,
      this.argGroup(indent, method.queryArgs, request)
    )
    return result
  }

  httpCall(indent: string, method: IMethod) {
    const request = this.useRequest(method) ? 'request.' : ''
    const mapped = this.typeMap(method.type)
    const bump = this.bumper(indent)
    const args = this.httpArgs(bump, method)
    const errors = this.errorResponses(indent, method)
    return (
      `${indent}return ${this.it(method.httpMethod.toLowerCase())}` +
      `<${mapped.name}, ${errors}>(` +
      this.httpPath(method.endpoint, request) +
      `${args ? ', ' + args : ''})`
    )
  }

  streamCall(indent: string, method: IMethod) {
    const request = this.useRequest(method) ? 'request.' : ''
    const mapped = this.typeMap(method.type)
    const bump = indent + this.indentStr
    const args = this.httpArgs(bump, method)
    // const errors = this.errorResponses(indent, method)
    return `${indent}return ${this.it('authStream')}<${
      mapped.name
    }>(callback, '${method.httpMethod.toUpperCase()}', ${this.httpPath(
      method.endpoint,
      request
    )}${args ? ', ' + args : ''})`
  }

  summary(indent: string, text: string | undefined) {
    return this.commentHeader(indent, text)
  }

  // TODO avoid duplicate code
  typeNames(countError = true) {
    const names: string[] = []
    if (!this.api) return names
    if (countError) {
      this.api.types.Error.refCount++
    } else {
      this.api.types.Error.refCount = 0
    }
    const types = this.api.types
    Object.values(types)
      .filter((type) => type.refCount > 0 && !type.intrinsic)
      .forEach((type) => names.push(this.typeName(type)))
    return names
  }

  typeMap(type: IType): IMappedType {
    super.typeMap(type)
    const mt = ''

    const asString: CodeAssignment = (_, v) => `'${v}'`
    const tsTypes: Record<string, IMappedType> = {
      any: { default: mt, name: 'any' },
      boolean: { default: mt, name: 'boolean' },
      // TODO can we use blob for binary somehow? https://developer.mozilla.org/en-US/docs/Web/API/Blob
      byte: { default: mt, name: 'binary' },
      date: { default: mt, name: 'Date' },
      datetime: { default: mt, name: 'Date' },
      double: { default: mt, name: 'number' },
      float: { default: mt, name: 'number' },
      int32: { default: mt, name: 'number' },
      int64: { default: mt, name: 'number' },
      integer: { default: mt, name: 'number' },
      number: { default: mt, name: 'number' },
      object: { default: mt, name: 'any' },
      password: { default: mt, name: 'Password', asVal: asString },
      string: { default: mt, name: 'string', asVal: asString },
      uri: { default: mt, name: 'Url', asVal: asString },
      url: { default: mt, name: 'Url', asVal: asString },
      void: { default: mt, name: 'void', asVal: (_i, _v: any) => '' },
    }

    if (type.elementType) {
      // This is a structure with nested types
      const map = this.typeMap(type.elementType)
      switch (type.className) {
        case 'ArrayType':
          return {
            default: '[]',
            name: `${map.name}[]`,
          }
        case 'HashType':
          return {
            default: '{}',
            name: `IDictionary<${map.name}>`,
          }
        case 'DelimArrayType':
          return {
            default: '',
            name: `DelimArray<${map.name}>`,
            asVal: (_, v) => `new DelimArray<${map.name}>([${v}])`,
          }
        case 'EnumType':
          return {
            default: '',
            name: this.typeName(type),
            asVal: (_, v) => `${type.name}.${v}`,
          }
      }
      throw new Error(`Don't know how to handle: ${JSON.stringify(type)}`)
    }

    if (type.name) {
      return tsTypes[type.name] || { default: '', name: this.typeName(type) } // No null default for complex types
    } else {
      throw new Error('Cannot output a nameless type.')
    }
  }
}
