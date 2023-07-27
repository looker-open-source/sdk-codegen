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

import cond from 'lodash/fp/cond'
import type {
  Arg,
  ArgValues,
  IMethod,
  IParameter,
  IProperty,
  IType,
} from './sdkModels'
import {
  camelCase,
  titleCase,
  describeParam,
  EnumType,
  isSpecialName,
  strBody,
} from './sdkModels'
import type { CodeAssignment, IMappedType } from './codeGen'
import { CodeGen, commentBlock } from './codeGen'

/**
 * TypeScript code generator
 */
export class TypescriptGen extends CodeGen {
  /**
   * special case for TypeScript output path due to mono repository
   */
  codePath = './packages/'
  /**
   * special case for TypeScript output path due to mono repository
   */
  useFunctions = true
  useSlices = true
  useInterfaces = true
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
  /** Track special imports of sdk-rtl */
  rtlNeeds = new Set<string>()

  reset() {
    this.rtlNeeds = new Set<string>()
  }

  sdkFileName(baseFileName: string) {
    return this.fileName(`${this.versions?.spec.key}/${baseFileName}`)
  }

  /** lists all special sdk-rtl import types encountered */
  rtlImports() {
    let rtl = Array.from(this.rtlNeeds).join(', ')
    if (rtl) {
      rtl += ', '
    }
    return rtl
  }

  /** creates a full @looker/sdk-rtl import statement if one is required */
  rtlImportStatement() {
    const rtl = this.rtlImports()
    return rtl ? `\nimport type { ${rtl} } from '@looker/sdk-rtl'\n` : ''
  }

  methodsPrologue(_indent: string) {
    return `
import type { ${this.rtlImports()}IAuthSession, ITransportSettings, SDKResponse } from '@looker/sdk-rtl'
import { APIMethods, encodeParam } from '@looker/sdk-rtl'
/**
 * ${this.warnEditing()}
 *
 */
import { sdkVersion } from '../constants'
import type { I${this.packageName} } from './methodsInterface'
import type { ${this.typeNames().join(', ')} } from './models'

export class ${this.packageName} extends APIMethods implements I${
      this.packageName
    } {
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

  functionsPrologue(_indent: string) {
    return `
import type { ${this.rtlImports()}IAPIMethods, IAuthSession, ITransportSettings, SDKResponse } from '@looker/sdk-rtl'
import { encodeParam, functionalSdk } from '@looker/sdk-rtl'

/**
 * ${this.warnEditing()}
 *
 */

import { sdkVersion } from '../constants'
import type { ${this.typeNames().join(', ')} } from './models'

/**
 * Creates a "functional sdk" that knows the API and Looker release version
 * @param authSession authentication session
 */
export const functionalSdk${this.apiRef} = (
  authSession: IAuthSession,
) => {
  return functionalSdk(authSession, '${this.apiVersion}', sdkVersion)
}

`
  }

  interfacesPrologue(_indent: string) {
    return `
import type { ${this.rtlImports()} IAPIMethods, ITransportSettings, SDKResponse } from '@looker/sdk-rtl'
/**
 * ${this.warnEditing()}
 *
 */
import type { ${this.typeNames().join(', ')} } from './models'

export interface I${this.packageName} extends IAPIMethods {

`
  }

  streamsPrologue(_indent: string): string {
    return `
import type { Readable } from 'readable-stream'
import type { ${this.rtlImports()}IAuthSession, ITransportSettings } from '@looker/sdk-rtl'
import { APIMethods, encodeParam } from '@looker/sdk-rtl'

/**
 * ${this.warnEditing()}
 *
 */
import { sdkVersion } from '../constants'
import type { ${this.typeNames().join(', ')} } from './models'

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
    return `${this.rtlImportStatement()}
/*
 * ${this.warnEditing()}
 */

`
  }

  modelsEpilogue(_indent: string) {
    return ''
  }

  commentHeader(indent: string, text: string | undefined, commentStr = ' * ') {
    if (this.noComment || !text) return ''
    const commentPrefix =
      text.includes(' License') && text.includes('Copyright (c)') ? '/*' : '/**'
    if (commentStr === ' ') {
      return `${indent}${commentPrefix}\n\n${commentBlock(
        text,
        indent,
        commentStr
      )}\n${indent} */\n`
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
    const nullify = property.nullable ? ' | null' : ''
    if (property.name === strBody) {
      // TODO refactor this hack to track context when the body parameter is created for the request type
      property.type.refCount++
      return (
        this.commentHeader(
          indent,
          property.description ||
            'body parameter for dynamically created request type'
        ) +
        `${indent}${property.name}${optional}: ${this.typeName(
          property.type
        )}${nullify}`
      )
    }
    const mapped = this.typeMap(property.type)
    return (
      this.commentHeader(indent, this.describeProperty(property)) +
      `${indent}${this.reserve(property.name)}${optional}: ${
        mapped.name
      }${nullify}`
    )
  }

  /**
   * Detect need for Partial<T> vs T for a parameter type
   * @param param to cast (or not)
   * @param mapped type to cast
   */
  impartial(param: IParameter, mapped: IMappedType) {
    if (param.type.intrinsic || param.location !== strBody) return mapped.name
    return `Partial<${mapped.name}>`
  }

  paramComment(param: IParameter, mapped: IMappedType) {
    // Don't include mapped type name for Typescript param comments in headers
    let desc = param.description || param.type.description
    if (!desc) {
      desc = this.impartial(param, mapped)
    }

    return `@param ${param.name} ${describeParam({
      ...param,
      ...{ description: desc },
    })}`
  }

  declareParameter(indent: string, method: IMethod, param: IParameter) {
    const type =
      param.location === strBody
        ? this.writeableType(param.type, method) || param.type
        : param.type
    const mapped = this.typeMap(type)
    let pOpt = ''
    mapped.name = this.impartial(param, mapped)
    if (!param.required) {
      pOpt = mapped.default ? '' : '?'
    }
    return (
      `${indent}${this.reserve(param.name)}${pOpt}: ${mapped.name}` +
      (param.required ? '' : mapped.default ? ` = ${mapped.default}` : '')
    )
  }

  makeTheCall(method: IMethod, inputs: ArgValues): string {
    const args = this.assignParams(method, inputs)
    const fun = `// functional SDK syntax is recommended for minimizing browser payloads
let response = await sdk.ok(${method.name}(sdk${args ? ',' : ''}`
    const mono = `// monolithic SDK syntax can also be used for Node apps
let response = await sdk.ok(sdk.${method.name}(`
    return `${fun}${args}))\n${mono}${args}))`
  }

  methodHeaderComment(method: IMethod, params: string[] = []) {
    if (this.noComment) return ''
    const lines: string[] = []

    const desc = method.description?.trim()
    if (desc) {
      lines.push(desc)
      lines.push('')
    }

    const resultType = this.typeMap(method.type).name
    lines.push(`${method.httpMethod} ${method.endpoint} -> ${resultType}`)
    lines.push('')

    if (method.deprecated) {
      lines.push('@deprecated')
      lines.push('')
    }

    if (method.responseIsBoth()) {
      lines.push('@remarks')
      lines.push('**NOTE**: Binary content may be returned by this function.')
      lines.push('')
    } else if (method.responseIsBinary()) {
      lines.push('@remarks')
      lines.push('**NOTE**: Binary content is returned by this function.')
      lines.push('')
    }

    params.forEach((p) => lines.push(`@param ${p}`))

    const args = method.allParams
    if (args.length) {
      let requestType = this.requestTypeName(method)

      if (requestType) {
        requestType =
          method.httpMethod === 'PATCH'
            ? `Partial<I${requestType}>`
            : `I${requestType}`
        lines.push(
          `@param request composed interface "${requestType}" for complex method parameters`
        )
      } else {
        args.forEach((p) =>
          lines.push(this.paramComment(p, this.paramMappedType(p, method)))
        )
      }
    }
    lines.push('@param options one-time API call overrides')
    lines.push('')

    return lines.join('\n')
  }

  methodHeaderDeclaration(
    indent: string,
    method: IMethod,
    streamer = false,
    params: string[] = []
  ) {
    const mapped = this.typeMap(method.type)
    let fragment: string
    const requestType = this.requestTypeName(method)
    const bump = this.bumper(indent)
    const headComment = streamer
      ? this.methodHeaderComment(method, ['callback streaming output function'])
      : this.methodHeaderComment(method, params)
    if (requestType) {
      // use the request type that will be generated in models.ts
      // No longer using Partial<T> by default here because required and optional are supposed to be accurate
      // However, for update methods (iow, patch) Partial<T> is still necessary since only the delta gets set
      fragment =
        method.httpMethod === 'PATCH'
          ? `request: Partial<I${requestType}>`
          : `request: I${requestType}`
      params.push(fragment)
      fragment = params.join(', ')
    } else {
      const args = method.allParams // get the params in signature order
      if (args && args.length > 0)
        args.forEach((p) => params.push(this.declareParameter(bump, method, p)))
      fragment =
        params.length > 0 ? `\n${params.join(this.paramDelimiter)}` : ''
    }
    const callback = `callback: (readable: Readable) => Promise<${mapped.name}>,`
    const header =
      this.commentHeader(indent, headComment) +
      `${indent}async ${method.name}(` +
      (streamer ? `\n${bump}${callback}` : '')
    const returns = streamer ? '' : `: ${this.returnType(indent, method)}`

    return (
      header +
      fragment +
      (fragment ? ', ' : '') +
      `options?: Partial<ITransportSettings>)${returns} {\n`
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

  /**
   * Return type declaration for the method
   * @param indent
   * @param method
   */
  returnType(indent: string, method: IMethod): string {
    const mapped = this.typeMap(method.type)
    const errors = this.errorResponses(indent, method)
    return `Promise<SDKResponse<${mapped.name}, ${errors}>>`
  }

  captainHookFactory(method: IMethod) {
    const testExp = (regex: RegExp) => (method: IMethod) =>
      regex.test(method.name)
    return cond([
      [testExp(/^all_/), () => 'createReadAllDataSliceHooks'],
      [testExp(/^create_/), () => 'createCreateDataSliceHooks'],
      [testExp(/^delete_/), () => 'createDeleteDataSliceHooks'],
      [testExp(/^update_/), () => 'createUpdateDataSliceHooks'],
      [() => true, () => 'createReadDataSliceHooks'],
    ])(method)
  }

  customHeaderComment(term: string, method: IMethod, params: string[] = []) {
    if (this.noComment) return ''
    const lines: string[] = []

    lines.push(`${method.description?.trim() || method.name} ${term}`)
    lines.push('')

    const resultType = this.typeMap(method.type).name
    lines.push(`${method.httpMethod} ${method.endpoint} -> ${resultType}`)
    lines.push('')

    if (method.deprecated) {
      lines.push('@deprecated')
      lines.push('')
    }

    params.forEach((p) => lines.push(`@param ${p}`))

    const args = method.allParams
    if (args.length) {
      let requestType = this.requestTypeName(method)

      if (requestType) {
        requestType =
          method.httpMethod === 'PATCH'
            ? `Partial<I${requestType}>`
            : `I${requestType}`
        lines.push(
          `@param request composed interface "${requestType}" for complex method parameters`
        )
      } else {
        args.forEach((p) =>
          lines.push(this.paramComment(p, this.paramMappedType(p, method)))
        )
      }
    }
    lines.push('@param options one-time API call overrides')
    lines.push('')

    return lines.join('\n')
  }

  hookSignature(indent: string, method: IMethod): string {
    let fragment: string
    const bump = this.bumper(indent)
    const requestType = this.requestTypeName(method)
    const params: string[] = []

    const headComment = this.customHeaderComment('hook', method)

    // const args = method.allParams // get the params in signature order

    if (requestType) {
      fragment =
        method.httpMethod === 'PATCH'
          ? `request: Partial<I${requestType}>`
          : `request: I${requestType}`
      params.push(fragment)
      fragment = params.join('; ')
    } else {
      const args = method.allParams
      if (args && args.length > 0)
        args.forEach((p) => {
          params.push(this.declareParameter('', method, p))
        })
      fragment = params.length > 0 ? `${params.join('; ')}` : ''
    }
    const mapped = this.typeMap(method.type)
    const dataType = `${mapped.name},`
    const hookName = this.captainHookFactory(method)

    return `
${this.commentHeader(indent, headComment)}
${indent}export const use${titleCase(method.name)} = ${hookName}<
${bump}${dataType}
${bump}{ ${fragment}${
      fragment ? ';' : ''
    } options?: Partial<ITransportSettings> }
${indent}>(${camelCase(method.name)}Slice)
`
  }

  sliceSignature(indent: string, method: IMethod): string {
    let fragment: string
    const bump = this.bumper(indent)
    const requestType = this.requestTypeName(method)
    const params: string[] = []

    const headComment = this.customHeaderComment('custom slice', method)

    // const args = method.allParams // get the params in signature order

    if (requestType) {
      // use the request type that will be generated in models.ts
      // No longer using Partial<T> by default here because required and
      // optional are supposed to be accurate. However, for update methods
      // (iow, patch) Partial<T> is still necessary since only the delta gets
      // set
      fragment =
        method.httpMethod === 'PATCH'
          ? `request: Partial<I${requestType}>`
          : `request: I${requestType}`
      params.push(fragment)
      fragment = params.join('; ')
    } else {
      const args = method.allParams // get the params in signature order
      if (args && args.length > 0)
        args.forEach((p) => {
          params.push(this.declareParameter('', method, p))
        })
      fragment = params.length > 0 ? `${params.join('; ')}` : ''
    }
    const mapped = this.typeMap(method.type)
    const dataType = `${mapped.name},`

    // create a name factory for the hooks
    // map method.httpMethod
    const hookName = this.captainHookFactory(method)

    return `
${this.commentHeader(indent, headComment)}
${indent}export const use${titleCase(method.name)} = ${hookName}<
${bump}${dataType}
${bump}{ ${fragment}${
      fragment ? ';' : ''
    } options?: Partial<ITransportSettings> }
${indent}>(${camelCase(method.name)}Slice)
`
  }

  declareSlice(indent: string, method: IMethod): string {
    return this.sliceSignature(indent, method)
  }

  declareHook(indent: string, method: IMethod): string {
    return this.hookSignature(indent, method)
  }

  functionSignature(indent: string, method: IMethod): string {
    let fragment: string
    const requestType = this.requestTypeName(method)
    const bump = this.bumper(indent)
    const params = ['sdk: IAPIMethods']

    const headComment = this.methodHeaderComment(method, [
      'sdk IAPIMethods implementation',
    ])
    if (requestType) {
      // use the request type that will be generated in models.ts
      // No longer using Partial<T> by default here because required and optional are supposed to be accurate
      // However, for update methods (iow, patch) Partial<T> is still necessary since only the delta gets set
      fragment =
        method.httpMethod === 'PATCH'
          ? `request: Partial<I${requestType}>`
          : `request: I${requestType}`
      params.push(fragment)
      fragment = params.join(', ')
    } else {
      const args = method.allParams // get the params in signature order
      if (args && args.length > 0)
        args.forEach((p) => params.push(this.declareParameter(bump, method, p)))
      fragment =
        params.length > 0 ? `\n${params.join(this.paramDelimiter)}` : ''
    }
    const header =
      this.commentHeader(indent, headComment) +
      `${indent}export const ${method.name} = async (`
    const returns = this.returnType(indent, method)

    return (
      header +
      fragment +
      (fragment ? ', ' : '') +
      `options?: Partial<ITransportSettings>): ${returns} => {\n`
    )
  }

  declareFunction(indent: string, method: IMethod): string {
    const bump = this.bumper(indent)
    // horribly hacky tweak to httpCall
    this.itself = 'sdk'
    const result =
      this.functionSignature(indent, method) +
      this.encodePathParams(indent, method) +
      this.httpCall(bump, method) +
      `\n${indent}}`
    this.itself = 'this'
    return result
  }

  declareInterface(indent: string, method: IMethod): string {
    let sig = this.methodSignature(indent, method).trimRight()
    sig = sig.replace(/^\s*async /gm, '')
    sig = sig.substr(0, sig.length - 2)
    return `${sig}\n`
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

  /**
   * Get the language's type name for generation
   *
   * Also refcounts the type
   *
   * @param type to name
   * @private
   */
  private typeName(type: IType) {
    type.refCount++
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
  typeNames() {
    const names: string[] = []
    if (!this.api) return names
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
          this.rtlNeeds.add('IDictionary')
          return {
            default: '',
            name: `IDictionary<${map.name}>`,
          }
        case 'DelimArrayType':
          this.rtlNeeds.add('DelimArray')
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
      const mapped = tsTypes[type.name]
      if (mapped && mapped.name === 'Url') this.rtlNeeds.add(mapped.name)
      return mapped || { default: '', name: this.typeName(type) } // No null default for complex types
    } else {
      throw new Error('Cannot output a nameless type.')
    }
  }
}
