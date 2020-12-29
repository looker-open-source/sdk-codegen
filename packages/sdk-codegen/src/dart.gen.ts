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
  EnumType,
  EnumValueType,
  IMethod,
  IParameter,
  IProperty,
  IType,
  mayQuote,
  strBody,
} from './sdkModels'
import { CodeGen, IMappedType } from './codeGen'

export class DartGen extends CodeGen {
  codePath = './dart/looker_sdk/lib/src'
  packagePath = ''
  sdkPath = 'sdk'
  itself = ''
  fileExtension = '.dart'
  commentStr = '// '
  nullStr = 'null'
  transport = 'transport'

  argDelimiter = ', '
  paramDelimiter = ',\n'
  propDelimiter = '\n'
  codeQuote = '"'
  enumDelimiter = ',\n'

  indentStr = '  '
  endTypeStr = '\n}'
  needsRequestTypes = false
  willItStream = true

  private readonly defaultApi = '4.0'

  isDefaultApi() {
    return this.apiVersion === this.defaultApi
  }

  supportsMultiApi() {
    return false
  }

  // TODO create `defaultPackageName` property in CodeGen
  sdkClassName() {
    return `Looker${this.apiRef}SDK`
  }

  /**
   * Return either api versioned namespace text or empty string if current API is the default
   * @returns {string} 'api31' or '', for example
   */
  apiNamespace() {
    if (this.apiVersion === this.defaultApi) return ''
    return `.api${this.apiRef}`
  }

  methodsPrologue(_indent: string) {
    return `
// ${this.warnEditing()}
import 'package:looker_sdk/looker_sdk.dart';
import 'models.dart';

class ${this.sdkClassName()} extends APIMethods {
  ${this.sdkClassName()}Stream stream;

  ${this.sdkClassName()}(AuthSession authSession) : super(authSession) {
    stream = ${this.sdkClassName()}Stream(authSession);
  }
`
  }

  streamsPrologue(_indent: string): string {
    return `
// ${this.warnEditing()}
import 'package:looker_sdk/looker_sdk.dart';
import 'models.dart';

class ${this.sdkClassName()}Stream extends APIMethods {

    ${this.sdkClassName()}Stream(AuthSession authSession) : super(authSession);
  
`
  }

  methodsEpilogue(_indent: string) {
    return '\n}'
  }

  modelsPrologue(_indent: string) {
    return `
// ${this.warnEditing()}
import 'dart:convert';
`
  }

  modelsEpilogue(_indent: string) {
    return ''
  }

  describeProperty(property: IProperty) {
    return `${property.description || property.name}${
      property.readOnly ? ' (read-only)' : ''
    }`
  }

  // TODO create methodHeader and typeHeader
  commentHeader(indent: string, text: string | undefined, commentStr = '/// ') {
    if (!text) return ''
    if (commentStr === ' ') {
      return `${indent}/*\n\n${commentBlock(
        text,
        indent,
        commentStr
      )}\n\n${indent} */\n`
    }
    return `${indent}${commentBlock(text, indent, commentStr)}\n`
  }

  beginRegion(indent: string, description: string): string {
    return `${indent}//region ${description}`
  }

  endRegion(indent: string, description: string): string {
    return `${indent}//endregion ${description}`
  }

  declareProperty(indent: string, property: IProperty) {
    // const optional = !property.required ? '? = null' : ''
    const type = this.typeMap(property.type)
    // TODO figure out the impact of this! Impacts DataActionFormField
    const name = property.name === 'default' ? 'default_value' : property.name
    // const attr = property.hasSpecialNeeds
    //   ? `${indent}@JsonProperty("${property.jsonName}")\n`
    //   : ''
    return (
      this.commentHeader(indent, this.describeProperty(property)) +
      `${indent}${type.name} ${name};`
      // `${indent}var ${property.name}: ${type.name}${optional}`
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
    return (
      this.commentHeader(indent, this.paramComment(param, mapped)) +
      `${indent}${mapped.name} ${param.name}` +
      (param.required
        ? ''
        : mapped.default && mapped.default !== 'null'
        ? ` = ${mapped.default}`
        : '')
    )
  }

  methodHeaderDeclaration(indent: string, method: IMethod, streamer = false) {
    const type = this.typeMap(method.type)
    const resultType = streamer ? 'ByteArray' : type.name
    const head = method.description?.trim()
    let headComment =
      (head ? `${head}\n\n` : '') +
      `${method.httpMethod} ${method.endpoint} -> ${resultType}`
    let fragment = ''
    const requestType = this.requestTypeName(method)
    const bump = indent + this.indentStr

    if (requestType) {
      // TODO remove this Typescript cruft
      fragment = `request: Partial<${requestType}>`
    } else {
      const params: string[] = []
      const optionalParams: string[] = []
      const args = method.allParams // get the params in signature order
      if (args && args.length > 0) {
        args.forEach((p) => {
          if (p.required) {
            params.push(this.declareParameter(bump, method, p))
          } else {
            optionalParams.push(this.declareParameter(bump, method, p))
          }
        })
      }
      fragment =
        params.length > 0 ? `\n${params.join(this.paramDelimiter)}\n` : ''
      if (optionalParams.length > 0) {
        if (params.length > 0) {
          fragment += ', '
        }
        fragment += `\n{${optionalParams.join(this.paramDelimiter)}}\n`
      }
    }
    if (method.responseIsBoth()) {
      headComment += `\n\n**Note**: Binary content may be returned by this method.`
    } else if (method.responseIsBinary()) {
      headComment += `\n\n**Note**: Binary content is returned by this method.\n`
    }
    const returnType =
      !method.returnType && !method.type.customType ? 'dynamic' : type.name
    // const callback = `callback: (readable: Readable) => Promise<${type.name}>,`
    const header =
      this.commentHeader(indent, headComment) +
      `${indent}Future<SDKResponse<${returnType}>>  ${method.name}(`
    // + (streamer ? `\n${bump}${callback}` : '')

    return header + fragment + `) async {\n`
  }

  methodSignature(indent: string, method: IMethod) {
    return this.methodHeaderDeclaration(indent, method, false)
  }

  encodePathParams(indent: string, method: IMethod) {
    const bump = indent + this.indentStr
    let encodings = ''
    if (method.pathParams.length > 0) {
      for (const param of method.pathParams) {
        encodings += `${bump}var path_${param.name} = encodeParam(${param.name});\n`
      }
    }
    return encodings
  }

  declareMethod(indent: string, method: IMethod) {
    const bump = this.bumper(indent)
    return (
      this.methodSignature(indent, method) +
      this.encodePathParams(bump, method) +
      this.responseHandler(method) +
      this.httpCall(bump, method) +
      `\n${indent}}`
    )
  }

  responseHandler(method: IMethod) {
    const type = this.typeMap(method.type)
    let returnVerb = ''
    let convert = ''
    const returnType =
      !method.returnType && !method.type.customType ? 'dynamic' : type.name
    if (type.name !== 'void') {
      returnVerb = 'return'
      if (!method.type.customType) {
        convert = 'json;'
      } else if (method.type.className === 'ArrayType') {
        const map = this.typeMap(method.type?.elementType!)
        convert = `json.map<${map.name}>((i) => ${map.name}.fromJson(i)).toList();`
      } else {
        convert = `${type.name}.fromJson(json);`
      }
    }
    return `
      ${returnType} responseHandler(dynamic json) {
        ${returnVerb} ${convert}
      } 
    `
  }

  streamerSignature(indent: string, method: IMethod) {
    return this.methodHeaderDeclaration(indent, method, true)
  }

  declareStreamer(indent: string, method: IMethod) {
    const bump = this.bumper(indent)
    return (
      this.streamerSignature(indent, method) +
      this.encodePathParams(bump, method) +
      this.responseHandler(method) +
      this.streamCall(bump, method) +
      `\n${indent}}`
    )
  }

  declareEnumValue(indent: string, value: EnumValueType) {
    return `${indent}${mayQuote(value)}`
  }

  typeSignature(indent: string, type: IType) {
    const isEnum = type instanceof EnumType
    const kind = isEnum ? 'enum' : 'class'
    const opener = ' {'
    return (
      this.commentHeader(indent, type.description) +
      `${indent}${kind} ${type.name} ${opener}\n`
    )
  }

  declareType(indent: string, type: IType) {
    const bump = this.bumper(indent)
    const props: string[] = []
    let ender = this.endTypeStr
    let propertyValues = ''
    if (type instanceof EnumType) {
      ender = `\n}`
      const num = type as EnumType
      num.values.forEach((value) =>
        props.push(this.declareEnumValue(bump, value))
      )
      propertyValues = props.join(this.enumDelimiter)
    } else {
      Object.values(type.properties).forEach((prop) =>
        props.push(this.declareProperty(bump, prop))
      )
      propertyValues = props.join(this.propDelimiter)
    }
    return (
      this.typeSignature(indent, type) +
      propertyValues +
      this.defaultConstructor(type) +
      this.toJson(type) +
      this.fromJson(type) +
      this.construct(indent, type) +
      `${this.endTypeStr ? indent : ''}${ender}`
    )
  }

  defaultConstructor(type: IType) {
    return type instanceof EnumType
      ? ''
      : `
    
    ${type.name}();
    `
  }

  toJson(type: IType) {
    let toJson = ''
    if (!(type instanceof EnumType)) {
      const props: string[] = []
      Object.values(type.properties).forEach((prop) => {
        const name = prop.name === 'default' ? 'default_value' : prop.name
        if (prop.type.customType) {
          if (prop.type.className === 'ArrayType') {
            props.push(
              `'${prop.name}' : ${prop.name} == null ? null : ${prop.name}.map((i) => i.toJson()).toList()`
            )
          } else {
            props.push(
              `'${prop.name}' :  ${prop.name} == null ? null : ${prop.name}.toJson()`
            )
          }
        } else {
          if (prop.type.className === 'ArrayType') {
            // const listType = this.typeMap(prop.type?.elementType!).name
            // props.push(
            //   `${name} = source['${prop.name}'] == null ? null : source['${prop.name}'].map<${listType}>((i) => i as ${listType}).toList()`
            // )
            props.push(
              `'${prop.name}' : ${name} == null ? null : jsonEncode(${name})`
            )
          } else {
            const mapped = this.typeMap(prop.type)
            if (mapped.name === 'DateTime') {
              props.push(
                `'${prop.name}' : ${name} == null ? null : ${name}.toString()`
              )
            } else {
              props.push(`'${prop.name}' : ${name}`)
            }
          }
        }
      })
      toJson = `
      Map toJson() => 
      {
        ${props.join(',\n')}
      };
      `
    }
    return toJson
  }

  fromJson(type: IType) {
    let fromJson = ''
    if (!(type instanceof EnumType)) {
      const props: string[] = []
      Object.values(type.properties).forEach((prop) => {
        const name = prop.name === 'default' ? 'default_value' : prop.name
        if (prop.type.customType) {
          if (prop.type.className === 'ArrayType') {
            props.push(
              `${name} = source['${prop.name}'] == null ? null : (source['${prop.name}'] as List).map((i) => ${prop.type.customType}.fromJson(i)).toList()`
            )
          } else {
            props.push(
              `${name} = source['${prop.name}'] == null ? null : ${prop.type.customType}.fromJson(source['${prop.name}'])`
            )
          }
        } else {
          if (prop.type.className === 'ArrayType') {
            const listType = this.typeMap(prop.type?.elementType!).name
            props.push(
              `${name} = source['${prop.name}'] == null ? null : source['${prop.name}'].map<${listType}>((i) => i as ${listType}).toList()`
            )
          } else {
            const propType = this.typeMap(prop.type!).name
            if (propType === 'String') {
              // Dart is very picky about types. For type to string
              props.push(
                `${name} = source['${prop.name}'] == null ? null : source['${prop.name}'].toString()`
              )
            } else if (propType === 'DateTime') {
              props.push(
                `${name} = source['${prop.name}'] == null ? null : DateTime.parse(source['${prop.name}'])`
              )
            } else {
              props.push(`${name} = source['${prop.name}']`)
            }
          }
        }
      })
      if (props.length > 0) {
        fromJson = `
        ${type.name}.fromJson(Map source)
          : ${props.join(',\n')};
        `
      }
    }
    return fromJson
  }

  errorResponses(_indent: string, _method: IMethod) {
    return ''
    // const results: string[] = method.errorResponses
    //   .map(r => `I${r.type.name}`)
    // return results.join(' | ')
  }

  httpPath(path: string, prefix?: string) {
    prefix = prefix || ''
    if (path.indexOf('{') >= 0)
      return "'" + path.replace(/{/gi, '${path_' + prefix) + "'"
    return `'${path}'`
  }

  argGroup(indent: string, args: Arg[], prefix?: string) {
    if (!args || args.length === 0) return this.nullStr
    const hash: string[] = []
    for (const arg of args) {
      const reserved = this.reserve(arg)
      if (prefix) {
        hash.push(`'${reserved}': ${this.accessor(arg, prefix)}`)
      } else {
        hash.push(`'${reserved}': ${reserved}`)
      }
    }
    return `\n${indent}{${hash.join(this.argDelimiter)}}`

    // if (!args || args.length === 0) return 'mapOf()'
    // const hash: string[] = []
    // for (const arg of args) {
    //   if (prefix) {
    //     hash.push(`"${arg}" to ${prefix}${arg}`)
    //   } else {
    //     hash.push(`"${arg}" to ${arg}`)
    //   }
    // }
    // const bump = this.bumper(indent)
    // const argBump = this.bumper(bump)
    // const argWrapper = `,\n ${argBump}`
    // return `\n${bump}mapOf(${hash.join(argWrapper)})`
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
    // let result = this.argFill('', 'options')
    // let result = this.argFill('', this.argGroup(indent, method.cookieArgs, request))
    // result = this.argFill(result, this.argGroup(indent, method.headerArgs, request))
    let result = this.argFill('', this.bodyArg(method, request))
    result = this.argFill(
      result,
      this.argGroup(indent, method.queryArgs, request)
    )
    return result
  }

  bodyArg(method: IMethod, request: string) {
    let result = this.nullStr
    if (method.bodyArg) {
      if (method.bodyParams.length > 0) {
        const bodyParam = method.bodyParams[0]
        if (
          bodyParam.type.className === 'ArrayType' ||
          bodyParam.type.className === 'IntrinsicType' ||
          bodyParam.type.className === 'HashType'
        ) {
          result = `${request}${method.bodyArg}`
        } else {
          result = `${request}${method.bodyArg} == null ? null : ${request}${method.bodyArg} .toJson()`
        }
      } else {
        result = `${request}${method.bodyArg}`
      }
    }
    return result
  }

  httpCall(indent: string, method: IMethod) {
    const request = this.useRequest(method) ? 'request.' : ''
    // const type = this.typeMap(method.type)
    const bump = indent + this.indentStr
    const args = this.httpArgs(bump, method)
    // TODO don't currently need these for Kotlin
    // const errors = this.errorResponses(indent, method)
    return `${bump}return ${this.it(
      method.httpMethod.toLowerCase()
    )}(responseHandler, ${this.httpPath(method.endpoint, request)}${
      args ? ', ' + args : ''
    });`
  }

  streamCall(indent: string, method: IMethod) {
    const request = this.useRequest(method) ? 'request.' : ''
    // const type = this.typeMap(method.type)
    const bump = indent + this.indentStr
    const args = this.httpArgs(bump, method)
    // const errors = this.errorResponses(indent, method)
    return `${bump}return ${this.it(
      method.httpMethod.toLowerCase()
    )}(responseHandler, ${this.httpPath(method.endpoint, request)}${
      args ? ', ' + args : ''
    });`
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
      .forEach((type) => names.push(`I${type.name}`))
    // TODO import default constants if necessary
    // Object.values(types)
    //   .filter(type => type instanceof RequestType)
    //   .forEach(type => names.push(`${strDefault}${type.name.substring(strRequest.length)}`))
    return names
  }

  typeMap(type: IType): IMappedType {
    super.typeMap(type)
    const mt = this.nullStr
    const ktTypes: Record<string, IMappedType> = {
      any: { default: mt, name: 'dynamic' },
      boolean: { default: mt, name: 'bool' },
      byte: { default: mt, name: 'binary' },
      date: { default: mt, name: 'DateTime' },
      datetime: { default: mt, name: 'DateTime' },
      double: { default: mt, name: 'double' },
      float: { default: mt, name: 'double' },
      int32: { default: mt, name: 'int' },
      int64: { default: mt, name: 'int' },
      integer: { default: mt, name: 'int' },
      number: { default: mt, name: 'double' },
      object: { default: mt, name: 'Map' },
      password: { default: mt, name: 'Password' },
      string: { default: mt, name: 'String' },
      uri: { default: mt, name: 'String' },
      url: { default: mt, name: 'String' },
      void: { default: mt, name: 'void' },
    }

    if (type.elementType) {
      // This is a structure with nested types
      const map = this.typeMap(type.elementType)
      switch (type.className) {
        case 'ArrayType':
          return { default: this.nullStr, name: `List<${map.name}>` }
        case 'HashType': {
          const mapName = 'dynamic'
          // type.elementType.name === 'string' ? 'dynamic' : map.name // TODO fix bad API spec, like MergeQuery vis_config
          // TODO figure out this bizarre string template error either in IntelliJ or Typescript
          // return {name: `Map<String,${map.name}>`, default: '{}'}
          return { default: this.nullStr, name: 'Map<String' + `,${mapName}>` }
        }
        case 'DelimArrayType':
          return { default: this.nullStr, name: `DelimList<${map.name}>` }
        case 'EnumType':
          return { default: '', name: type.name }
      }
      throw new Error(`Don't know how to handle: ${JSON.stringify(type)}`)
    }

    if (type.name) {
      return (
        ktTypes[type.name] || { default: this.nullStr, name: `${type.name}` }
      )
    } else {
      throw new Error('Cannot output a nameless type.')
    }
  }
}
