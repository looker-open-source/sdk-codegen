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

import type { IMappedType } from './codeGen'
import { CodeGen, commentBlock } from './codeGen'
import type { IMethod, IParameter, IProperty, IType, Arg } from './sdkModels'
import { EnumType, mayQuote, strBody, camelCase } from './sdkModels'

/**
 * Dart generator
 */
export class DartGen extends CodeGen {
  codePath = './dart/looker_sdk/lib/src'
  packagePath = ''
  omitVersionFromPath = true
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
  willItStream = false

  private readonly defaultApi = '4.0'

  isDefaultApi() {
    return this.apiVersion === this.defaultApi
  }

  supportsMultiApi() {
    return false
  }

  sdkFileName(baseFileName: string) {
    return this.fileName(`${this.sdkPath}/${baseFileName}`)
  }

  declareProperty(indent: string, property: IProperty): string {
    // const optional = !property.required ? '? = null' : ''
    const type = this.typeMap(property.type)
    // TODO figure out the impact of this! Impacts DataActionFormField
    const name =
      property.name === 'default' ? 'defaultValue' : camelCase(property.name)
    // const attr = property.hasSpecialNeeds
    //   ? `${indent}@JsonProperty("${property.jsonName}")\n`
    //   : ''
    return `
 ${indent}${type.name} _${name};
 ${indent}bool _${name}Set = false;
`
  }

  declarePropertyGetSet(indent: string, property: IProperty): string {
    // const optional = !property.required ? '? = null' : ''
    const type = this.typeMap(property.type)
    // TODO figure out the impact of this! Impacts DataActionFormField
    const name =
      property.name === 'default' ? 'defaultValue' : camelCase(property.name)
    // const attr = property.hasSpecialNeeds
    //   ? `${indent}@JsonProperty("${property.jsonName}")\n`
    //   : ''
    return (
      this.commentHeader(indent, this.describeProperty(property)) +
      `
       ${type.name} get ${name} {
         if (!_${name}Set && _apiMapResponse.containsKey('${property.name}')) {
           ${this.propertyFromJson(property, '_apiMapResponse')};
           _${name}Set = true;
         }
         return _${name};
       }

       set ${name}(${type.name} v) {
         _${name} = v;
         _${name}Set = true;
       }
`
    )
  }

  methodsPrologue(_indent: string): string {
    return `
// ${this.warnEditing()}
import 'package:looker_sdk/looker_sdk.dart';

class ${this.sdkClassName()} extends APIMethods {
  ${this.sdkClassName()}(AuthSession authSession) : super(authSession);
`
  }

  methodsEpilogue(_indent: string): string {
    return '}'
  }

  streamsPrologue(_indent: string): string {
    return ''
  }

  modelsPrologue(_indent: string): string {
    return `
// ${this.warnEditing()}
`
  }

  modelsEpilogue(_indent: string): string {
    return ''
  }

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
    return `${indent}// #region ${description}`
  }

  endRegion(indent: string, description: string): string {
    return `${indent}// #endregion ${description}`
  }

  declareType(indent: string, type: IType) {
    const bump = this.bumper(indent)
    const props: string[] = []
    const propGetSets: string[] = []
    let ender = this.endTypeStr
    let propertyValues = ''
    let propertyGetSetValues = ''
    if (type instanceof EnumType) {
      ender = `\n}`
      const num = type as EnumType
      num.values.forEach((value) =>
        props.push(this.declareEnumValue(bump, value as string))
      )
      propertyValues = props.join(this.enumDelimiter)
      return (
        this.typeSignature(indent, type) +
        propertyValues +
        `${this.endTypeStr ? indent : ''}${ender}` +
        this.enumMapper(type)
      )
    } else {
      props.push('Object _apiRawResponse;')
      props.push('Map _apiMapResponse;')
      props.push('String _apiResponseContentType;')
      Object.values(type.properties).forEach((prop) => {
        props.push(this.declareProperty(bump, prop))
        propGetSets.push(this.declarePropertyGetSet(bump, prop))
      })
      propertyValues = props.join(this.propDelimiter)
      propertyGetSetValues = propGetSets.join(this.propDelimiter)
      return (
        this.typeSignature(indent, type) +
        propertyValues +
        propertyGetSetValues +
        this.defaultConstructor(type) +
        this.getApiRawResponse(type) +
        this.getApiRawValue(type) +
        this.getContentType(type) +
        this.fromResponse(type) +
        this.toJson(type) +
        `${this.endTypeStr ? indent : ''}${ender}`
      )
    }
  }

  enumMapper(type: EnumType) {
    const toMaps = type.values
      .map(
        (v) => `case ${type.name}.${camelCase((v as string).toLowerCase())}:
       return '${v}';
`
      )
      .join('')
    const fromMaps = type.values
      .map(
        (v) => `
     if (s == '${v}') {
       return ${type.name}.${camelCase((v as string).toLowerCase())};
     }`
      )
      .join('')
    return `class ${type.name}Mapper {
       static String toStringValue(${type.name} e) {
         switch(e) {
${toMaps}
           default:
             return null;
         }
       }

       static ${type.name} fromStringValue(String s) {
${fromMaps}
         return null;
       }
     }`
  }

  declareEnumValue(indent: string, value: string) {
    return `${indent}${mayQuote(camelCase(value.toLowerCase()))}`
  }

  defaultConstructor(type: IType) {
    return type instanceof EnumType
      ? ''
      : `
${type.name}() {
  _apiMapResponse = {};
}
`
  }

  getApiRawResponse(type: IType) {
    let src
    if (!(type instanceof EnumType)) {
      src = `
Object get apiRawResponse {
  return _apiRawResponse;
}
`
    }
    return src
  }

  getApiRawValue(type: IType) {
    let src
    if (!(type instanceof EnumType)) {
      src = `
Object getApiRawValue(String valueName) {
  return _apiMapResponse == null ? null : _apiMapResponse[valueName];
}
`
    }
    return src
  }

  getContentType(type: IType) {
    let src
    if (!(type instanceof EnumType)) {
      src = `
String get apiResponseContentType {
  return _apiResponseContentType;
}
`
    }
    return src
  }

  // if (_filterTitleSet || _apiMapResponse.containsKey('filter_title')) {
  //   json['filter_title'] = filterTitle;
  // }

  toJson(type: IType) {
    let toJson = ''
    if (!(type instanceof EnumType)) {
      const props: string[] = []
      Object.values(type.properties).forEach((prop) => {
        const name =
          prop.name === 'default' ? 'defaultValue' : camelCase(prop.name)
        props.push(
          `if (_${name}Set || _apiMapResponse.containsKey('${prop.name}')) {`
        )
        if (prop.type.customType) {
          if (prop.type.className === 'ArrayType') {
            props.push(
              `json['${prop.name}'] = ${name}?.map((i) => i.toJson())?.toList();`
            )
          } else {
            props.push(`json['${prop.name}'] = ${name}?.toJson();`)
          }
        } else {
          if (prop.type instanceof EnumType) {
            props.push(
              `json['${prop.name}'] = ${prop.type.name}Mapper.toStringValue(${name});`
            )
          } else if (prop.type.className === 'ArrayType') {
            // TODO - handle array of DateTime (there are none at the moment)
            props.push(`json['${prop.name}'] = ${name};`)
          } else {
            const mapped = this.typeMap(prop.type)
            if (mapped.name === 'DateTime') {
              props.push(`json['${prop.name}'] = ${name}?.toIso8601String();`)
            } else {
              props.push(`json['${prop.name}'] = ${name};`)
            }
          }
        }
        props.push('}')
      })
      toJson = `
Map toJson() {
  var json = {};
${props.join('\n')}
  return json;
}
`
    }
    return toJson
  }

  fromResponse(type: IType) {
    let fromResponse = ''
    if (!(type instanceof EnumType)) {
      fromResponse = `
${type.name}.fromResponse(Object apiRawResponse, String apiResponseContentType) {
  _apiRawResponse = apiRawResponse;
  _apiMapResponse = {};
  if (apiRawResponse is Map) {
    _apiMapResponse = apiRawResponse;
  }
  _apiResponseContentType = apiResponseContentType ?? '';
}
`
    }
    return fromResponse
  }

  propertyFromJson(prop: IProperty, sourceName: string) {
    const name =
      prop.name === 'default' ? '_defaultValue' : '_' + camelCase(prop.name)
    if (prop.type.customType) {
      if (prop.type.className === 'ArrayType') {
        return `${name} = ${sourceName}['${prop.name}'] == null ? null : (${sourceName}['${prop.name}'] as List).map((i) => ${prop.type.customType}.fromResponse(i, apiResponseContentType)).toList()`
      } else {
        return `${name} = ${sourceName}['${prop.name}'] == null ? null : ${prop.type.customType}.fromResponse(${sourceName}['${prop.name}'], apiResponseContentType)`
      }
    } else {
      if (prop.type instanceof EnumType) {
        return `${name} = ${prop.type.name}Mapper.fromStringValue(${sourceName}['${prop.name}'])`
      } else if (prop.type.className === 'ArrayType') {
        const listType = this.typeMap(prop.type!.elementType!).name
        return `${name} = ${sourceName}['${prop.name}']?.map<${listType}>((i) => i as ${listType})?.toList()`
      } else {
        const propType = this.typeMap(prop.type!).name
        if (propType === 'String') {
          // Dart is very picky about types. Coorce type to string
          return `${name} = ${sourceName}['${prop.name}']?.toString()`
        } else if (propType === 'DateTime') {
          return `${name} = ${sourceName}['${prop.name}'] == null ? null : DateTime.parse(${sourceName}['${prop.name}'])`
        } else {
          return `${name} = ${sourceName}['${prop.name}']`
        }
      }
    }
  }

  summary(_indent: string, _text: string | undefined): string {
    return ''
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

  sdkClassName() {
    return 'LookerSDK'
  }

  typeMap(type: IType): IMappedType {
    super.typeMap(type)
    const mt = this.nullStr
    const dartTypes: Record<string, IMappedType> = {
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
        dartTypes[type.name] || { default: this.nullStr, name: `${type.name}` }
      )
    } else {
      throw new Error('Cannot output a nameless type.')
    }
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
      `${indent}${mapped.name} ${camelCase(param.name)}` +
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
      `${indent}Future<SDKResponse<${returnType}>>  ${camelCase(method.name)}(`

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
        encodings += `${bump}var ${camelCase(
          'path_' + param.name
        )} = encodeParam(${camelCase(param.name)});\n`
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
        const map = this.typeMap(method.type.elementType!)
        convert = `json.map<${map.name}>((i) => ${map.name}.fromResponse(i, contentType)).toList();`
      } else {
        convert = `${type.name}.fromResponse(json, contentType);`
      }
    }
    return `
       ${returnType} responseHandler(dynamic json, String contentType) {
         ${returnVerb} ${convert}
       }
     `
  }

  httpCall(indent: string, method: IMethod) {
    const request = this.useRequest(method) ? 'request.' : ''
    const bump = indent + this.indentStr
    const args = this.httpArgs(bump, method)
    return `${bump}return ${this.it(
      method.httpMethod.toLowerCase()
    )}(responseHandler, ${this.httpPath(method.endpoint, request)}${
      args ? ', ' + args : ''
    });`
  }

  httpPath(path: string, _prefix?: string) {
    const pathNodes = path.split('/').map((node) => {
      if (node.startsWith('{')) {
        return camelCase(node.replace(/{/gi, '$path_').replace(/}/gi, ''))
      }
      return node
    })
    return `'${pathNodes.join('/')}'`
  }

  httpArgs(indent: string, method: IMethod) {
    const request = this.useRequest(method) ? 'request.' : ''
    let result = this.argFill('', this.bodyArg(method, request))
    result = this.argFill(
      result,
      this.argGroup(indent, method.queryArgs, request)
    )
    return result
  }

  argFill(current: string, args: string) {
    if (!current && args.trim() === this.nullStr) {
      return ''
    }
    return `${args}${current ? this.argDelimiter : ''}${current}`
  }

  argGroup(indent: string, args: Arg[], prefix?: string) {
    if (!args || args.length === 0) return this.nullStr
    const hash: string[] = []
    for (const arg of args) {
      const reserved = this.reserve(arg)
      if (prefix) {
        hash.push(`'${reserved}': ${camelCase(this.accessor(arg, prefix))}`)
      } else {
        hash.push(`'${reserved}': ${camelCase(reserved)}`)
      }
    }
    return `\n${indent}{${hash.join(this.argDelimiter)}}`
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
          result = `${request}${method.bodyArg}?.toJson()`
        }
      } else {
        result = `${request}${method.bodyArg}`
      }
    }
    return result
  }

  accessor(name: string, prefix?: string) {
    const reserved = this.reserve(name)
    if (!prefix) return reserved
    if (reserved === name) return `${prefix}.${name}`
    return `${prefix}[${reserved}]`
  }
}
