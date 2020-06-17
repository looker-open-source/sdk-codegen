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

import { CodeGen } from './codeGen'
import {
  IMappedType,
  IMethod,
  IParameter,
  IType,
  IProperty,
  strBody, titleCase, Arg,
} from './sdkModels'

/**
 * C# code generator
 */
export class CSharpGen extends CodeGen {
  codePath = './csharp/'
  packagePath = 'sdk'
  itself = 'this'
  fileExtension = '.cs'
  commentStr = '/// '
  nullStr = 'null'
  transport = 'Transport'

  argDelimiter = ', '
  paramDelimiter = ',\n'
  propDelimiter = '\n'

  indentStr = '  '
  endTypeStr = '\n}'
  needsRequestTypes = false
  willItStream = false

  modelsPrologue(_indent: string) {
    return `${this.commentHeader('', this.warnEditing())}
using Looker.RTL;
`
  }

  modelsEpilogue(_indent: string) {
    return ''
  }

  methodsPrologue(_indent: string) {
    return `
${this.commentHeader('', this.warnEditing())}
using Looker.RTL;
using System.Threading.Tasks;

namespace Looker.SDK
{
  public class ${this.packageName}: ApiMethods
  {
    public ${this.packageName}(IAuthSession authSession): base(authSession, ${
      this.apiVersion
    }) { }
`
  }

  methodsEpilogue(_indent: string) {
    return `}
  }
`
  }

  declareParameter(indent: string, method: IMethod, param: IParameter) {
    const type =
      param.location === strBody
        ? this.writeableType(param.type, method) || param.type
        : param.type
    const mapped = this.typeMap(type)
    let pOpt = ''
    // if (param.location === strBody) {
    //   mapped.name = `Partial<${mapped.name}>`
    // }
    // if (!param.required) {
    // pOpt = mapped.default ? '' : '?'
    // }
    return (
      this.commentHeader(indent, this.paramComment(param, mapped)) +
      `${indent}${param.name}${pOpt}: ${mapped.name}` +
      (param.required ? '' : mapped.default ? ` = ${mapped.default}` : '')
    )
  }

  declareProperty(_indent: string, _property: IProperty): string {
    throw new Error('Method not implemented.')
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
      `${indent}async Task<SdkResponse<TSuccess, TError>> ${method.name}<TSuccess, TError>(` +
      (streamer ? `\n${bump}${callback}` : '')

    return (
      header +
      fragment +
      `${
        fragment ? ',' : ''
      }\n${bump}ITransportSettings options = null)\n{${indent}\n`
    )
  }

  methodSignature(indent: string, method: IMethod): string {
    return this.methodHeaderDeclaration(indent, method, false)
  }

  httpPath(path: string, prefix?: string) {
    prefix = prefix || ''
    if (path.indexOf('{') >= 0) {
      return `\$"${path.replace(/{/gi, '{' + prefix)}"`
    }
    return `'${path}'`
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

  errorResponses(_indent: string, _method: IMethod) {
    return 'Exception'
  }

  argGroup(_indent: string, args: Arg[], prefix?: string) {
    prefix = prefix || ''
    const values = args.map(arg => `{ "${arg}" = ${arg} }`)
    return args && args.length !== 0
        ? `new Values = {${values.join(this.argDelimiter + prefix)}}`
        : this.nullStr
  }

  httpCall(indent: string, method: IMethod) {
    const bump = indent + this.indentStr
    const args = this.httpArgs(bump, method)
    // const errors = `(${this.errorResponses(indent, method)})`
    const fragment = `AuthRequest<TSuccess, TError>(HttpMethod.${titleCase(
      method.httpMethod
    )}, $"${method.endpoint}"${args ? ', ' + args : ''})`
    return `${indent}return ${this.it(fragment)};`
  }

  encodePathParams(indent: string, method: IMethod): string {
    const bump = indent + this.indentStr
    let encodings = ''
    if (method.pathParams.length > 0) {
      for (const param of method.pathParams) {
        if (param.doEncode()) {
          encodings += `${bump}${param.name} = EncodeParam(${param.name});\n`
        }
      }
    }
    return encodings
  }

  summary(indent: string, summary: string) {
    return this.commentHeader(indent, `<summary>\n${summary}\n</summary>`)
  }

  paramComment(param: IParameter, mapped: IMappedType) {
    return `<param name=${mapped.name}>${param.description}</param>`
  }

  returnComment(param: IParameter) {
    return `${this.commentStr}<returns>${param.description}</returns>`
  }

  typeSignature(indent: string, type: IType) {
    return (
      this.commentHeader(indent, type.description) +
      `${indent}public interface I${type.name}\n{\n`
    )
  }

  typeMap(type: IType): IMappedType {
    super.typeMap(type)
    const mt = this.nullStr

    const csTypes: Record<string, IMappedType> = {
      any: { default: mt, name: '' },
      boolean: { default: mt, name: 'bool' },
      byte: { default: mt, name: 'byte' },
      date: { default: mt, name: 'DateTime' },
      datetime: { default: mt, name: 'DateTime' },
      double: { default: mt, name: 'double' },
      float: { default: mt, name: 'float' },
      int32: { default: mt, name: 'int' },
      int64: { default: mt, name: 'long' },
      integer: { default: mt, name: 'int' },
      number: { default: mt, name: 'int' },
      object: { default: mt, name: 'object' },
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
          return { default: '{}', name: `StringDictionary<${map.name}>` }
        case 'DelimArrayType':
          return { default: '', name: `DelimArray<${map.name}>` }
      }
      throw new Error(`Don't know how to handle: ${JSON.stringify(type)}`)
    }

    if (type.name) {
      return csTypes[type.name] || { default: '', name: `I${type.name}` } // No null default for complex types
    } else {
      throw new Error('Cannot output a nameless type.')
    }
  }
}
