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

import type { IMappedType } from './codeGen';
import { CodeGen, commentBlock } from './codeGen';
import type {
  Arg,
  EnumValueType,
  IMethod,
  IParameter,
  IProperty,
  IType,
} from './sdkModels';
import { EnumType, describeParam, firstCase, strBody } from './sdkModels';

// https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/
const reservedWords = new Set<string>([
  'abstract',
  'as',
  'base',
  'bool',
  'break',
  'byte',
  'case',
  'catch',
  'char',
  'checked',
  'class',
  'const',
  'continue',
  'decimal',
  'default',
  'delegate',
  'do ',
  'double',
  'else',
  'enum',
  'event',
  'explicit',
  'extern',
  'false',
  'finally',
  'fixed',
  'float',
  'for',
  'foreach',
  'goto',
  'if',
  'implicit',
  'in',
  'int',
  'interface',
  'internal',
  'is',
  'lock',
  'long',
  'namespace',
  'new',
  'null',
  'object',
  'operator',
  'out',
  'override',
  'params',
  'private',
  'protected',
  'public',
  'readonly',
  'ref',
  'return',
  'sbyte',
  'sealed',
  'short',
  'sizeof',
  'stackalloc',
  'static',
  'string',
  'struct',
  'switch',
  'this',
  'throw',
  'true',
  'try',
  'typeof',
  'uint',
  'ulong',
  'unchecked',
  'unsafe',
  'ushort',
  'using',
  'virtual',
  'void',
  'volatile',
  'while',
]);

/**
 * C# code generator
 */
export class CSharpGen extends CodeGen {
  codePath = './csharp';
  packagePath = '';
  itself = 'this';
  fileExtension = '.cs';
  commentStr = '// ';
  nullStr = 'null';
  transport = 'Transport';

  argDelimiter = ',';
  paramDelimiter = ',\n';
  propDelimiter = '\n';

  indentStr = '  ';
  endTypeStr = '\n}';
  needsRequestTypes = false;
  willItStream = false;
  codeQuote = '"';

  commentHeader(indent: string, text: string | undefined) {
    if (this.noComment) return '';
    return text ? `${commentBlock(text, indent, '/// ')}\n` : '';
  }

  modelsPrologue(_indent: string) {
    return `#nullable enable
using System;
using System.Runtime.Serialization;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Looker.RTL;
using Url = System.String;
using Password = System.String;
// ReSharper disable InconsistentNaming

${this.commentHeader('', this.warnEditing())}
namespace Looker.SDK.API${this.apiRef}
{

`;
  }

  modelsEpilogue(_indent: string) {
    return '\n}';
  }

  methodsPrologue(_indent: string) {
    return `#nullable enable
using System;
using System.Net.Http;
using System.Threading.Tasks;
using Looker.RTL;
// ReSharper disable InconsistentNaming

${this.commentHeader('', this.warnEditing())}
namespace Looker.SDK.API${this.apiRef}
{

  public class ${this.packageName}: ApiMethods
  {
    public ${this.packageName}(IAuthSession authSession): base(authSession, "${
      this.apiVersion
    }") { }
`;
  }

  methodsEpilogue(indent: string) {
    return `${indent}}
}
`;
  }

  reserve(name: string) {
    if (reservedWords.has(name)) {
      return '@' + name;
    }
    return name;
  }

  declareParameter(indent: string, method: IMethod, param: IParameter) {
    const type =
      param.location === strBody
        ? this.writeableType(param.type, method) || param.type
        : param.type;
    const mapped = this.typeMap(type);
    const arg = this.reserve(param.name);
    const pOpt = param.required ? '' : '?';
    const defaulting = param.required
      ? ''
      : mapped.optional
        ? ` = ${mapped.optional}`
        : '';
    return `${indent}${mapped.name}${pOpt} ${arg}${defaulting}`;
  }

  declareProperty(indent: string, property: IProperty): string {
    const type = this.typeMap(property.type);
    // TODO notation for readonly support
    // let getset = property.readOnly ? '{ get; }' : '{ get; set; }'
    let getset = '{ get; set; }';
    if (property.required) {
      if (type.default) {
        getset += ` = ${type.default};`;
      }
    } else {
      if (type.optional) {
        getset += ` = ${type.optional};`;
      }
    }

    const arg = this.reserve(property.name);
    const pOpt = property.required ? '' : '?';
    let attr =
      property.type instanceof EnumType
        ? `${indent}[JsonConverter(typeof(StringEnumConverter))]\n`
        : '';
    if (property.hasSpecialNeeds) {
      attr += `${indent}[JsonProperty("${property.jsonName}")]\n`;
    }
    return (
      this.summary(indent, this.describeProperty(property)) +
      attr +
      `${indent}public ${type.name}${pOpt} ${arg} ${getset}`
    );
  }

  methodHeader(indent: string, method: IMethod) {
    const type = this.typeMap(method.type);
    const head = method.description?.trim();
    let headComment =
      (head ? `${head}\n\n` : '') +
      `${method.httpMethod} ${method.endpoint} -> ${type.name}`;
    if (method.responseIsBoth()) {
      headComment += `\n\n**Note**: Binary content may be returned by this method.`;
    } else if (method.responseIsBinary()) {
      headComment += `\n\n**Note**: Binary content is returned by this method.`;
    }

    headComment += this.returnComment(method);
    method.params.forEach(param => (headComment += this.paramComment(param)));
    const dep = method.deprecated ? `${indent}[Obsolete("Deprecated")]\n` : '';
    return this.commentHeader(indent, headComment) + dep;
  }

  genericBits(method: IMethod) {
    let success = 'TSuccess';
    let generic = '<TSuccess>';
    let constraint = ' where TSuccess : class';
    if (method.returnType) {
      const ret = method.returnType;
      const type = this.typeMap(ret.type);
      success = type.name === 'void' ? 'string' : type.name;
      generic = '';
      constraint = '';
    }
    return { success, generic, constraint };
  }

  methodHeaderDeclaration(indent: string, method: IMethod, streamer = false) {
    const type = this.typeMap(method.type);
    const bump = indent + this.indentStr;

    const params: string[] = [];
    const args = method.allParams; // get the params in signature order
    if (args && args.length > 0)
      args.forEach(p => params.push(this.declareParameter(bump, method, p)));
    const fragment =
      params.length > 0 ? `\n${params.join(this.paramDelimiter)}` : '';
    const callback = `callback: (readable: Readable) => Promise<${type.name}>,`;
    const bits = this.genericBits(method);
    const header =
      this.methodHeader(indent, method) +
      `${indent}public async Task<SdkResponse<${bits.success}, Exception>> ${method.name}${bits.generic}(` +
      (streamer ? `\n${bump}${callback}` : '');

    return (
      header +
      fragment +
      `${fragment ? ',' : ''}\n${bump}ITransportSettings? options = null)${
        bits.constraint
      }\n{${indent}\n`
    );
  }

  methodSignature(indent: string, method: IMethod): string {
    return this.methodHeaderDeclaration(indent, method, false);
  }

  httpPath(path: string, prefix?: string) {
    prefix = prefix || '';
    if (path.indexOf('{') >= 0) {
      return `$"${path.replace(/{/gi, '{' + prefix)}"`;
    }
    return `'${path}'`;
  }

  declareMethod(indent: string, method: IMethod) {
    const bump = this.bumper(indent);
    return (
      this.methodSignature(indent, method) +
      this.encodePathParams(bump, method) +
      this.httpCall(bump, method) +
      `\n${indent}}`
    );
  }

  errorResponses(_indent: string, _method: IMethod) {
    return 'Exception';
  }

  argGroup(_indent: string, args: Arg[], prefix?: string) {
    prefix = prefix || '';
    const values = args.map(arg => `{ "${arg}", ${this.reserve(arg)} }`);
    const bump = this.bumper(this.indentStr) + this.indentStr;
    return args && args.length !== 0
      ? `new Values {\n${bump}${values.join(
          `${this.argDelimiter.trim()}\n${bump}${prefix}`
        )}}`
      : this.nullStr;
  }

  httpArgs(indent: string, method: IMethod) {
    let result = this.argFill('', 'options');
    // result = this.argFill(result, this.argGroup(indent, method.cookieArgs))
    // result = this.argFill(result, this.argGroup(indent, method.headerArgs))
    result = this.argFill(
      result,
      method.bodyArg ? method.bodyArg : this.nullStr
    );
    result = this.argFill(result, this.argGroup(indent, method.queryArgs));
    return result;
  }

  httpCall(indent: string, method: IMethod) {
    const bump = indent + this.indentStr;
    const args = this.httpArgs(bump, method);
    const dollah = method.pathArgs.length ? '$' : '';
    // const errors = `(${this.errorResponses(indent, method)})`
    const bits = this.genericBits(method);
    const fragment = `AuthRequest<${
      bits.success
    }, Exception>(HttpMethod.${firstCase(method.httpMethod)}, ${dollah}"${
      method.endpoint
    }"${args ? ', ' + args : ''})`;
    return `${indent}return await ${fragment};`;
  }

  encodePathParams(indent: string, method: IMethod): string {
    const bump = indent + this.indentStr;
    let encodings = '';
    if (method.pathParams.length > 0) {
      for (const param of method.pathParams) {
        if (param.doEncode()) {
          encodings += `${bump}${param.name} = SdkUtils.EncodeParam(${param.name});\n`;
        }
      }
    }
    return encodings;
  }

  summary(indent: string, summary: string) {
    if (this.noComment || !summary) return '';
    const nl = summary.indexOf('\n') >= 0 ? '\n' : '';
    return this.commentHeader(
      indent,
      `<summary>${nl}${summary}${nl}</summary>`
    );
  }

  paramComment(param: IParameter) {
    return param.description
      ? `\n<param name="${param.name}">${describeParam(param)}</param>`
      : '';
  }

  returnComment(method: IMethod) {
    const type = method.returnType;
    if (type) {
      const mapped = this.typeMap(type.type);
      return `\n\n<returns><c>${mapped.name}</c> ${type.description} (${type.mediaType})</returns>\n`;
    }
    const desc: string[] = [];
    method.okResponses.forEach(r => {
      const mapped = this.typeMap(r.type);
      desc.push(`<c>${mapped.name}</c> ${r.description} (${r.mediaType})`);
    });
    const lines = desc.join('\n');
    return `\n\n<returns>\n${lines}\n</returns>\n`;
  }

  declareEnumValue(indent: string, value: EnumValueType) {
    return `${indent}[EnumMember(Value = "${value}")]
${indent}${this.reserve(value.toString())}`;
  }

  // TODO document properties in `typeHeader()` instead of inline
  // TODO create class constructor for all required parameters
  typeSignature(indent: string, type: IType) {
    const isEnum = type instanceof EnumType;
    const kind = isEnum ? 'enum' : 'class';
    const parent = isEnum ? '' : ' : SdkModel';
    return (
      this.commentHeader(indent, type.description) +
      `${indent}public ${kind} ${this.reserve(type.name)}${parent}\n{\n`
    );
  }

  typeMap(type: IType): IMappedType {
    super.typeMap(type);
    // all optional types are Nullable<T> and should have a "default value" of null
    // see https://stackoverflow.com/a/29153833 for discussion
    const mt = '';
    const quotes = '""';
    const optional = this.nullStr;

    const csTypes: Record<string, IMappedType> = {
      any: { default: this.nullStr, name: 'object', optional },
      boolean: { default: mt, name: 'bool', optional },
      byte: { default: mt, name: 'byte', optional },
      date: { default: mt, name: 'DateTime', optional },
      datetime: { default: mt, name: 'DateTime', optional },
      double: { default: mt, name: 'double', optional },
      float: { default: mt, name: 'float', optional },
      int32: { default: mt, name: 'int', optional },
      int64: { default: mt, name: 'long', optional },
      integer: { default: mt, name: 'int', optional },
      number: { default: mt, name: 'double', optional },
      object: { default: this.nullStr, name: 'object', optional },
      password: { default: quotes, name: 'Password', optional },
      string: { default: quotes, name: 'string', optional },
      uri: { default: quotes, name: 'Url', optional },
      url: { default: quotes, name: 'Url', optional },
      void: { default: mt, name: 'void' },
    };

    if (type.elementType) {
      // This is a structure with nested types
      const map = this.typeMap(type.elementType);
      switch (type.className) {
        case 'ArrayType':
          return { default: this.nullStr, name: `${map.name}[]`, optional };
        case 'HashType':
          return {
            default: this.nullStr,
            name: `StringDictionary<${map.name}>`,
            optional,
          };
        case 'DelimArrayType':
          return {
            default: this.nullStr,
            name: `DelimArray<${map.name}>`,
            optional,
          };
        case 'EnumType':
          return { default: '', name: type.name };
      }
      throw new Error(`Don't know how to handle: ${JSON.stringify(type)}`);
    }

    if (type.name) {
      return (
        csTypes[type.name] || { default: this.nullStr, name: `${type.name}` }
      );
    } else {
      throw new Error('Cannot output a nameless type.');
    }
  }
}
