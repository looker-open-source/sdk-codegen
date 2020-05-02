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

// Swift code generator

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
  strBody, DelimArrayType,
} from './sdkModels'
import { CodeGen } from './codeGen'
import { commentBlock} from '@looker/sdk-codegen-utils'

export class SwiftGen extends CodeGen {
  codePath = './swift/'
  packagePath = 'looker'
  itself = 'self'
  fileExtension = '.swift'
  commentStr = '// '
  nullStr = 'nil'
  transport = 'transport'

  argDelimiter = ', '
  paramDelimiter = ',\n'
  propDelimiter = '\n'

  indentStr = '    '
  endTypeStr = `\n}`
  needsRequestTypes = false
  willItStream = true
  keywords = 'associatedtype,class,deinit,enum,extension,fileprivate,func,import,init,inout,internal,let,open,'
    + 'operator,private,protocol,public,static,struct,subscript,typealias,var,break,case,continue,default,'
    + 'defer,do,else,fallthrough,for,guard,if,in,repeat,return,switch,where,while,'
    + 'as,Any,catch,false,is,nil,rethrows,super,self,Self,throw,throws,true,try,'
    + '_,#available,#colorLiteral,#column,#else,#elseif,#endif,#file,#fileLiteral,#function,#if,#imageLiteral,'
    + '#line,#selector,and #sourceLocation,associativity,convenience,dynamic,didSet,final,get,infix,indirect,'
    + 'lazy,left,mutating,none,nonmutating,optional,override,postfix,precedence,prefix,Protocol,required,right,'
    + 'set,Type,unowned,weak,willSet'.split(',')

  supportsMultiApi(): boolean {
    return false
  }

  // @ts-ignore
  methodsPrologue(indent: string) {
    return `
/// ${this.warnEditing()}

import Foundation

@available(OSX 10.15, *)
class ${this.packageName}: APIMethods {

${this.indentStr}lazy var stream = ${this.packageName}Stream(authSession)
`
  }

  // @ts-ignore
  streamsPrologue(indent: string): string {
    return `
/// ${this.warnEditing()}

import Foundation

@available(OSX 10.15, *)
class ${this.packageName}Stream: APIMethods {
`
  }

  // @ts-ignore
  methodsEpilogue(indent: string) {
    return '\n}'
  }

  // @ts-ignore
  modelsPrologue(indent: string) {
    return `
/// ${this.warnEditing()}

import Foundation
`
  }

  // @ts-ignore
  modelsEpilogue(indent: string) {
    return '\n'
  }

  private reserve(name: string) {
    if (this.keywords.includes(name)) {
      return `\`${name}\``
    }
    return name
  }

  sdkFileName(baseFileName: string) {
    // return this.fileName(`sdk/${baseFileName}${this.apiRef}`)
    return this.fileName(`sdk/${baseFileName}`)
  }

  commentHeader(indent: string, text: string | undefined) {
    return text ? `${indent}/**\n${commentBlock(text, indent, ' * ')}\n${indent} */\n` : ''
  }

  declareProperty(indent: string, property: IProperty) {
    // const optional = (property.nullable || !property.required) ? '?' : ''
    const optional = property.required ? '' : '?'
    if (property.name === strBody) {
      // TODO refactor this hack to track context when the body parameter is created for the request type
      property.type.refCount++
      return this.commentHeader(indent, property.description || 'body parameter for dynamically created request type')
        + `${indent}var ${this.reserve(property.name)}: ${property.type.name}${optional}`
    }
    const type = this.typeMap(property.type)
    return this.commentHeader(indent, this.describeProperty(property))
      + `${indent}var ${this.reserve(property.name)}: ${type.name}${optional}`
  }

  paramComment(param: IParameter, mapped: IMappedType) {
    return `@param {${mapped.name}} ${param.name} ${param.description}`
  }

  declareParameter(indent: string, method: IMethod, param: IParameter) {
    let type = (param.location === strBody)
      ? this.writeableType(param.type, method) || param.type
      : param.type
    const mapped = this.typeMap(type)
    let pOpt = ''
    let line = ''
    if (param.location === strBody) {
      mapped.name = `${mapped.name}`
    }
    if (!param.required) {
      pOpt = '?'
    } else {
      line = '_ '
    }
    return this.commentHeader(indent, this.paramComment(param, mapped))
      + `${indent}${line}${this.reserve(param.name)}: ${mapped.name}${pOpt}`
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

  methodHeaderDeclaration(indent: string, method: IMethod, streamer: boolean = false) {
    const type = this.typeMap(method.type)
    const resultType = streamer ? 'Data' : type.name
    let returnType = type.name === 'Void' ? 'Voidable' : `SDKResponse<${resultType}, SDKError>`
    const head = method.description?.trim()
    let headComment = (head ? `${head}\n\n` : '')  +`${method.httpMethod} ${method.endpoint} -> ${type.name}`
    let fragment = ''
    const requestType = this.requestTypeName(method)
    const bump = indent + this.indentStr

    if (requestType) {
      // use the request type that will be generated in models.ts
      fragment = `request: I${requestType}`
    } else {
      let params: string[] = []
      const args = method.allParams // get the params in signature order
      if (args && args.length > 0) args.forEach(p => params.push(this.declareParameter(bump, method, p)))
      fragment = params.length > 0 ? `\n${params.join(this.paramDelimiter)}` : ''
    }
    if (method.responseIsBoth()) {
      headComment += `\n\n**Note**: Binary content may be returned by this method.`
    } else if (method.responseIsBinary()) {
      headComment += `\n\n**Note**: Binary content is returned by this method.\n`
    }
    const header = this.commentHeader(indent, headComment)
    + `${indent}func ${method.name}(`

    return header + fragment
      + `${fragment? ',' : ''}\n${bump}options: ITransportSettings? = nil\n${indent}) -> ${returnType} {\n`
  }

  methodSignature(indent: string, method: IMethod) {
    return this.methodHeaderDeclaration(indent, method, false)
  }

  encodePathParams(indent: string, method: IMethod) {
    let encodings: string = ''
    if (method.pathParams.length > 0) {
      for (const param of method.pathParams) {
        // For swift, just encode all path params because of awkward variable renames
        encodings += `${indent}let path_${param.name} = encodeParam(${param.name})\n`
      }
    }
    return encodings
  }

  declareMethod(indent: string, method: IMethod) {
    const bump = this.bumper(indent)
    return this.methodSignature(indent, method)
      + this.encodePathParams(bump, method)
      + this.httpCall(bump, method)
      + `\n${indent}}`
  }

  streamerSignature(indent: string, method: IMethod) {
    return this.methodHeaderDeclaration(indent, method, true)
  }

  declareStreamer(indent: string, method: IMethod) {
    const bump = this.bumper(indent)
    return this.streamerSignature(indent, method)
      + this.encodePathParams(bump, method)
      + this.streamCall(bump, method)
      + `\n${indent}}`
  }

  // declareType(indent: string, type: IType): string {
  //   return super.declareType(this.bumper(indent), type)
  // }

  typeSignature(indent: string, type: IType) {
    const recursive = type.isRecursive()
    const structOrClass = recursive ? 'class' : 'struct'
    const needClass = recursive ? "\nRecursive type references must use Class instead of Struct" : ''
    const mapped = this.typeMap(type)
    return this.commentHeader(indent, type.description + needClass) +
      `${indent}${structOrClass} ${mapped.name}: SDKModel {\n`
  }

  // @ts-ignore
  errorResponses(indent: string, method: IMethod) {
    // const results: string[] = method.errorResponses
    //   .map(r => `${r.type.name}`)
    // return results.join(' | ')
    // TODO figure out how to express OR'd error type responses
    return 'SDKError'
  }

  httpPath(path: string, prefix?: string) {
    prefix = prefix || ''
    if (path.indexOf('{') >= 0) {
      let tweak = path.replace(/{/gi, '\\(path_' + prefix)
      tweak = tweak.replace(/}/gi, ')')
      return `"${tweak}"`
    }
    return `"${path}"`
  }

  // @ts-ignore
  argGroup(indent: string, args: Arg[], prefix?: string) {
    if ((!args) || args.length === 0) return this.nullStr
    let hash: string[] = []
    for (let arg of args) {
      if (prefix) {
        hash.push(`"${arg}": ${prefix}${arg}`)
      } else {
        hash.push(`"${arg}": ${arg}`)
      }
    }
    return `\n${indent}[${hash.join(this.argDelimiter)}]`
  }

  queryGroup(indent: string, method: IMethod, prefix?: string) {
    let params = method.getParams('query')
    if ((!params) || params.length === 0) return this.nullStr
    let hash: string[] = []
    for (let param of params) {
      let arg = this.asAny(param)
      if (prefix) {
        hash.push(`"${param.name}": ${prefix}${arg}`)
      } else {
        hash.push(`"${param.name}": ${arg}`)
      }
    }
    return `\n${indent}[${hash.join(this.argDelimiter)}]`
  }

  asAny(param: IParameter) : Arg {
    let castIt = false
    if (param.type.elementType) {
      castIt = true
    } else {
      let mapped = this.typeMap(param.type)
      switch (mapped.name.toLowerCase()) {
        case 'date':
        case 'datetime':
        // case 'url':
        // case 'uri':
        case 'object':
        case 'bool': castIt = true; break;
        default: castIt = false; break;
      }
    }
    return param.name + (castIt ? ' as Any?' : '')
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
    const request = this.useRequest(method) ? 'request.' : ''
    // add options at the end of the request calls. this will cause all other arguments to be
    // filled in but there's no way to avoid this for passing in the last optional parameter.
    // Fortunately, this code bloat is minimal and also hidden from the consumer.
    let result = this.argFill('', 'options')
    // let result = this.argFill('', this.argGroup(indent, method.cookieArgs, request))
    // result = this.argFill(result, this.argGroup(indent, method.headerArgs, request))
    result = this.argFill(result, method.bodyArg ? `try! self.encode(${request}${method.bodyArg})` : this.nullStr)
    result = this.argFill(result, this.queryGroup(indent, method, request))
    return result
  }

  httpCall(indent: string, method: IMethod) {
    const request = this.useRequest(method) ? 'request.' : ''
    const type = this.typeMap(method.type)
    const bump = indent + this.indentStr
    const args = this.httpArgs(bump, method)
    const errors = this.errorResponses(indent, method)
    return `${indent}let result: SDKResponse<${type.name}, ${errors}> = ${this.it(method.httpMethod.toLowerCase())}(${this.httpPath(method.endpoint, request)}${args ? ', ' + args : ''})
${indent}return result`
  }

  streamCall(indent: string, method: IMethod) {
    const request = this.useRequest(method) ? 'request.' : ''
    // const type = this.typeMap(method.type)
    const bump = indent + this.indentStr
    const args = this.httpArgs(bump, method)
    const errors = this.errorResponses(indent, method)
    return `${indent}let result: SDKResponse<Data, ${errors}> = ${this.it(method.httpMethod.toLowerCase())}(${this.httpPath(method.endpoint, request)}${args ? ', ' + args : ''})
${indent}return result`
  }

  summary(indent: string, text: string | undefined) {
    return this.commentHeader(indent, text)
  }

  typeNames(countError: boolean = true) {
    let names: string[] = []
    if (!this.api) return names
    if (countError) {
      this.api.types['Error'].refCount++
    } else {
      this.api.types['Error'].refCount = 0
    }
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

  typeMap(type: IType): IMappedType {
    super.typeMap(type)
    // const ns = `api${this.apiRef}.`
    // const ns = `Looker.`
    const ns = 'Lk'

    const swiftTypes: Record<string, IMappedType> = {
      'number': {name: 'Double', default: this.nullStr},
      'float': {name: 'Float', default: this.nullStr},
      'double': {name: 'Double', default: this.nullStr},
      'integer': {name: 'Int', default: this.nullStr},
      'int32': {name: 'Int32', default: this.nullStr},
      'int64': {name: 'Int64', default: this.nullStr},
      'string': {name: 'String', default: this.nullStr},
      'password': {name: 'Password', default: this.nullStr},
      'byte': {name: 'binary', default: this.nullStr},
      'boolean': {name: 'Bool', default: this.nullStr},
      'uri': {name: 'URI', default: this.nullStr},
      'url': {name: 'URL', default: this.nullStr},
      'datetime': {name: 'Date', default: this.nullStr},
      'date': {name: 'Date', default: this.nullStr},
      'object': {name: 'Any', default: this.nullStr},
      'void': {name: 'Voidable', default: ''},
      'Error': {name: `${ns}Error`, default: ''},
      'Group': {name: `${ns}Group`, default: ''},
    }

    if (type.elementType) {
      // This is a structure with nested types
      const map = this.typeMap(type.elementType)
      if (type instanceof ArrayType) {
        return {name: `[${map.name}]`, default: '[]'}
      } else if (type instanceof HashType) {
        // return {name: `StringDictionary<${map.name}>`, default: 'nil'}
        return {name: `StringDictionary<AnyCodable>`, default: 'nil'}
      } else if (type instanceof DelimArrayType) {
        return {name: `DelimArray<${map.name}>`, default: 'nil'}
      }
      throw new Error(`Don't know how to handle: ${JSON.stringify(type)}`)
    }

    if (type.name) {
      return swiftTypes[type.name] || {name: `${type.name}`, default: ''} // No null default for complex types
    } else {
      throw new Error('Cannot output a nameless type.')
    }
  }

}
