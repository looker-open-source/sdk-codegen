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

import type {
  Arg,
  EnumValueType,
  IMethod,
  IParameter,
  IProperty,
  IType,
} from './sdkModels';
import {
  EnumType,
  TypeOfType,
  describeParam,
  mayQuote,
  strBody,
  typeOfType,
} from './sdkModels';
import type { IMappedType } from './codeGen';
import { CodeGen, commentBlock } from './codeGen';

export class SwiftGen extends CodeGen {
  // Use AnyString JSON parser for number or string ids
  anyString = true;
  codePath = './swift/';
  packagePath = 'looker';
  itself = 'self';
  fileExtension = '.swift';
  commentStr = '// ';
  nullStr = 'nil';
  transport = 'transport';

  argDelimiter = ', ';
  paramDelimiter = ',\n';
  propDelimiter = '\n';
  enumDelimiter = '\n';
  codeQuote = '"';

  indentStr = '    ';
  endTypeStr = `\n}`;
  needsRequestTypes = false;
  willItStream = true;
  keywords = new Set<string>([
    'associatedtype',
    'class',
    'deinit',
    'enum',
    'extension',
    'fileprivate',
    'func',
    'import',
    'init',
    'inout',
    'internal',
    'let',
    'open',
    'operator',
    'private',
    'protocol',
    'public',
    'static',
    'struct',
    'subscript',
    'typealias',
    'var',
    'break',
    'case',
    'continue',
    'default',
    'defer',
    'do',
    'else',
    'fallthrough',
    'for',
    'guard',
    'if',
    'in',
    'repeat',
    'return',
    'switch',
    'where',
    'while',
    'as',
    'Any',
    'catch',
    'false',
    'is',
    'nil',
    'rethrows',
    'super',
    'self',
    'Self',
    'throw',
    'throws',
    'true',
    'try',
    '_',
    '#available',
    '#colorLiteral',
    '#column',
    '#else',
    '#elseif',
    '#endif',
    '#file',
    '#fileLiteral',
    '#function',
    '#if',
    '#imageLiteral',
    '#line',
    '#selector',
    'and #sourceLocation',
    'associativity',
    'convenience',
    'dynamic',
    'didSet',
    'final',
    'get',
    'infix',
    'indirect',
    'lazy',
    'left',
    'mutating',
    'none',
    'nonmutating',
    'optional',
    'override',
    'postfix',
    'precedence',
    'prefix',
    'Protocol',
    // 'required', removing this from the list because Swift complains about it being escaped
    'right',
    'set',
    'Type',
    'unowned',
    'weak',
    'willSet',
  ]);

  supportsMultiApi(): boolean {
    return false;
  }

  methodsPrologue(_indent: string) {
    return `
/// ${this.warnEditing()}

import Foundation

@available(OSX 10.15, *)
open class ${this.packageName}: APIMethods {

${this.indentStr}public lazy var stream = ${this.packageName}Stream(authSession)
`;
  }

  streamsPrologue(_indent: string): string {
    return `
/// ${this.warnEditing()}

import Foundation

@available(OSX 10.15, *)
open class ${this.packageName}Stream: APIMethods {
`;
  }

  methodsEpilogue(_indent: string) {
    return '\n}';
  }

  modelsPrologue(_indent: string) {
    return `
/// ${this.warnEditing()}

import Foundation
`;
  }

  modelsEpilogue(_indent: string) {
    return '\n';
  }

  reserve(name: string) {
    if (this.keywords.has(name)) {
      return `\`${name}\``;
    }
    return name;
  }

  sdkFileName(baseFileName: string) {
    // return this.fileName(`sdk/${baseFileName}${this.apiRef}`)
    return this.fileName(`sdk/${baseFileName}`);
  }

  commentHeader(indent: string, text: string | undefined, commentStr = ' * ') {
    if (this.noComment || !text) return '';
    if (commentStr === ' ') {
      return `${indent}/**\n\n${commentBlock(
        text,
        indent,
        commentStr
      )}\n${indent} */\n`;
    }
    return `${indent}/**\n${commentBlock(
      text,
      indent,
      commentStr
    )}\n${indent} */\n`;
  }

  beginRegion(indent: string, description: string): string {
    return `${indent}// MARK ${description}`;
  }

  endRegion(_indent: string, _description: string): string {
    return ''; // No end MARK in Swift, and XCode appears to no longer process MARKs anyway
  }

  isIdProp(_property: IProperty) {
    // sadly we can't scope fuzzy decoding to only id fields because some "id" refs are not named correctly
    // TODO just return true until we figure out a generic solution for fuzzy JSON decoding
    return true;
    // const nameCheck = property.name.toLowerCase()
    // return (
    //   nameCheck === 'id' ||
    //   nameCheck.endsWith('_id') ||
    //   nameCheck.endsWith('_ids')
    // )
  }

  itemType(property: IProperty) {
    if (
      typeOfType(property.type) === TypeOfType.Array &&
      property.type.elementType
    ) {
      return property.type.elementType;
    }
    return property.type;
  }

  /**
   * true if this property should use AnyString
   * @param property to check
   */
  useAnyString(property: IProperty) {
    const typeCheck = this.itemType(property).name.toLowerCase();
    return this.anyString && typeCheck === 'string' && this.isIdProp(property);
  }

  /**
   * true if this property should use AnyInt
   * @param property to check
   */
  useAnyInt(property: IProperty) {
    const typeCheck = this.itemType(property).name.toLowerCase();
    return (
      this.anyString &&
      (typeCheck === 'integer' || typeCheck === 'int64') &&
      this.isIdProp(property)
    );
  }

  /**
   * Private version of the name (_ prefix)
   *
   * Strips reserved character markings from the name if present
   *
   * @param name to privatize
   */
  privy(name: string) {
    return this.reserve('_' + name.replace(/`/g, ''));
  }

  getSpecialHandling(property: IProperty) {
    return this.useAnyString(property)
      ? 'AnyString'
      : this.useAnyInt(property)
      ? 'AnyInt'
      : '';
  }

  declareProperty(indent: string, property: IProperty) {
    // const optional = (property.nullable || !property.required) ? '?' : ''
    const optional = property.required ? '' : '?';
    if (property.name === strBody) {
      // TODO refactor this hack to track context when the body parameter is created for the request type
      property.type.refCount++;
      return (
        this.commentHeader(
          indent,
          property.description ||
            'body parameter for dynamically created request type'
        ) +
        `${indent}var ${this.reserve(property.name)}: ${
          property.type.name
        }${optional}`
      );
    }
    const type = this.typeMap(property.type);
    const specialHandling = this.getSpecialHandling(property);
    let munge = '';
    let declaration = `${indent}public var ${this.reserve(property.name)}: ${
      type.name
    }${optional}\n`;
    if (specialHandling) {
      const ra = typeOfType(property.type) === TypeOfType.Array;
      const privy = this.reserve('_' + property.name);
      const bump = this.bumper(indent);
      const setter = property.required
        ? ra
          ? `${privy} = newValue.map { ${specialHandling}.init($0) }`
          : `${privy} = ${specialHandling}.init(newValue)`
        : ra
        ? `if let v = newValue { ${privy} = v.map { ${specialHandling}.init($0) } } else { ${privy} = nil }`
        : `${privy} = newValue.map(${specialHandling}.init)`;
      const getter = property.required
        ? ra
          ? `${privy}.map { $0.value }`
          : `${privy}.value`
        : ra
        ? `if let v = ${privy} { return v.map { $0.value } } else { return nil }`
        : `${privy}${optional}.value`;
      munge = ra
        ? `${indent}private var ${privy}: [${specialHandling}]${optional}\n`
        : `${indent}private var ${privy}: ${specialHandling}${optional}\n`;
      declaration = `${indent}public var ${this.reserve(property.name)}: ${
        type.name
      }${optional} {
${bump}get { ${getter} }
${bump}set { ${setter} }
${indent}}\n`;
    }
    return (
      munge +
      this.commentHeader(indent, this.describeProperty(property)) +
      declaration
    );
  }

  paramComment(param: IParameter, mapped: IMappedType) {
    return `@param {${mapped.name}} ${param.name} ${describeParam(param)}`;
  }

  declareParameter(indent: string, method: IMethod, param: IParameter) {
    const type =
      param.location === strBody
        ? this.writeableType(param.type, method) || param.type
        : param.type;
    const mapped = this.typeMap(type);
    let pOpt = '';
    let line = '';
    if (param.location === strBody) {
      mapped.name = `${mapped.name}`;
    }
    if (!param.required) {
      pOpt = '?';
    } else {
      line = '_ ';
    }
    return (
      this.commentHeader(indent, this.paramComment(param, mapped)) +
      `${indent}${line}${this.reserve(param.name)}: ${mapped.name}${pOpt}` +
      (param.required ? '' : mapped.default ? ` = ${mapped.default}` : '')
    );
  }

  initProp(prop: IProperty) {
    const propName = this.reserve(prop.name);
    const specialHandling = this.getSpecialHandling(prop);
    if (specialHandling) {
      const ra = typeOfType(prop.type) === TypeOfType.Array;
      const varName = this.privy(propName);
      if (prop.required) {
        if (ra) {
          return `${this.it(
            varName
          )} = ${propName}.map { ${specialHandling}.init($0) }`;
        }
        return `${this.it(varName)} = ${specialHandling}.init(${propName})`;
      } else {
        if (ra) {
          return `if let v = ${propName} { ${varName} = v.map { ${specialHandling}.init($0) } } else { ${varName} = nil }`;
        }
        return `${this.it(varName)} = ${propName}.map(${specialHandling}.init)`;
      }
    }
    return `${this.it(propName)} = ${propName}`;
  }

  construct(indent: string, type: IType) {
    if (type instanceof EnumType) return '';
    indent = this.bumper(indent);
    const bump = this.bumper(indent);
    const args: string[] = [];
    const posArgs: string[] = [];
    const inits: string[] = [];
    const posInits: string[] = [];
    const props = this.typeProperties(type);
    props.forEach(prop => {
      const propName = this.reserve(prop.name);
      args.push(this.declareConstructorArg('', prop));
      posArgs.push(this.declarePositionalArg('', prop));
      inits.push(`${bump}${this.initProp(prop)}`);
      posInits.push(`${propName}: ${propName}`);
    });
    const namedInit =
      `${indent}public init(` +
      `${args.join(this.argDelimiter)}) {\n` +
      inits.join('\n') +
      `\n${indent}}`;
    let posInit = '';
    if (props.some(p => p.required)) {
      posInit =
        `\n${indent}public init(` +
        `${posArgs.join(this.argDelimiter)}) {\n` +
        `${bump}${this.it('init')}(${posInits.join(', ')})` +
        `\n${indent}}\n`;
    }
    return `\n${namedInit}\n${posInit}`;
  }

  declarePositionalArg(indent: string, property: IProperty) {
    const mappedType = this.typeMap(property.type);
    let propType: string;
    let line = '_ ';
    if (property.required) {
      propType = mappedType.name;
    } else {
      line = '';
      propType = `${mappedType.name}? = ${this.nullStr}`;
    }
    const propName = this.reserve(property.name);
    return `${indent}${line}${propName}: ${propType}`;
  }

  declareConstructorArg(indent: string, property: IProperty) {
    const mappedType = this.typeMap(property.type);
    let propType: string;
    if (property.required) {
      propType = mappedType.name;
    } else {
      propType = `${mappedType.name}? = ${this.nullStr}`;
    }
    const propName = this.reserve(property.name);
    return `${indent}${propName}: ${propType}`;
  }

  methodHeaderDeclaration(indent: string, method: IMethod, streamer = false) {
    const type = this.typeMap(method.type);
    const resultType = streamer ? 'Data' : type.name;
    const returnType =
      type.name === 'Void'
        ? 'Voidable'
        : `SDKResponse<${resultType}, SDKError>`;
    const head = method.description?.trim();
    let headComment =
      (head ? `${head}\n\n` : '') +
      `${method.httpMethod} ${method.endpoint} -> ${type.name}`;
    let fragment;
    const requestType = this.requestTypeName(method);
    const bump = indent + this.indentStr;

    if (requestType) {
      // use the request type that will be generated in models.ts
      fragment = `request: I${requestType}`;
    } else {
      const params: string[] = [];
      const args = method.allParams; // get the params in signature order
      if (args && args.length > 0)
        args.forEach(p => params.push(this.declareParameter(bump, method, p)));
      fragment =
        params.length > 0 ? `\n${params.join(this.paramDelimiter)}` : '';
    }
    if (method.responseIsBoth()) {
      headComment += `\n\n**Note**: Binary content may be returned by this method.`;
    } else if (method.responseIsBinary()) {
      headComment += `\n\n**Note**: Binary content is returned by this method.\n`;
    }
    const dep = method.deprecated ? `${indent}@available(*, deprecated)\n` : '';
    const header =
      this.commentHeader(indent, headComment) +
      dep +
      `${indent}public func ${method.name}(`;

    return (
      header +
      fragment +
      `${
        fragment ? ',' : ''
      }\n${bump}options: ITransportSettings? = nil\n${indent}) -> ${returnType} {\n`
    );
  }

  methodSignature(indent: string, method: IMethod) {
    return this.methodHeaderDeclaration(indent, method, false);
  }

  encodePathParams(indent: string, method: IMethod) {
    let encodings = '';
    if (method.pathParams.length > 0) {
      for (const param of method.pathParams) {
        // For swift, just encode all path params because of awkward variable renames
        encodings += `${indent}let path_${param.name} = encodeParam(${param.name})\n`;
      }
    }
    return encodings;
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

  streamerSignature(indent: string, method: IMethod) {
    return this.methodHeaderDeclaration(indent, method, true);
  }

  declareStreamer(indent: string, method: IMethod) {
    const bump = this.bumper(indent);
    return (
      this.streamerSignature(indent, method) +
      this.encodePathParams(bump, method) +
      this.streamCall(bump, method) +
      `\n${indent}}`
    );
  }

  codingKeys(indent: string, type: IType) {
    let special = false;

    const keys = Object.values(type.properties).map(p => {
      let name = this.reserve(p.name);
      let alias = '';
      const useIt = this.useAnyString(p) || this.useAnyInt(p);
      if (useIt) {
        name = this.privy(name);
        special = true;
        alias = p.jsonName;
      } else if (p.hasSpecialNeeds) {
        special = true;
        alias = p.jsonName;
      }
      return name + (alias ? ` = "${alias}"` : '');
    });

    if (!special) return '';
    const bump = this.bumper(indent);
    const bump2 = this.bumper(bump);
    const cases = keys.join(`\n${bump2}case `);

    return (
      `\n${bump}private enum CodingKeys : String, CodingKey {` +
      `\n${bump2}case ${cases}` +
      `\n${bump}}\n`
    );
  }

  // declareType(indent: string, type: IType): string {
  //   return super.declareType(this.bumper(indent), type)
  // }
  declareEnumValue(indent: string, value: EnumValueType) {
    const quote = typeof value === 'string' ? this.codeQuote : '';
    return `${indent}case ${mayQuote(value)} = ${quote}${value}${quote}`;
  }

  typeSignature(indent: string, type: IType) {
    const recursive = type.isRecursive();
    let typeName = recursive ? 'class' : 'struct';
    const access = recursive ? 'open' : 'public';
    let baseClass = 'SDKModel';
    const isEnum = type instanceof EnumType;
    if (isEnum) {
      typeName = 'enum';
      const num = type as EnumType;
      const mapped = this.typeMap(num.elementType);
      baseClass = `${mapped.name}, Codable`;
    }

    const keys = this.codingKeys(indent, type);

    const needClass = recursive
      ? '\nRecursive type references must use Class instead of Struct'
      : '';
    const mapped = this.typeMap(type);
    return (
      this.commentHeader(indent, type.description + needClass) +
      `${indent}${access} ${typeName} ${mapped.name}: ${baseClass} {\n${keys}`
    );
  }

  errorResponses(_indent: string, _method: IMethod) {
    // const results: string[] = method.errorResponses
    //   .map(r => `${r.type.name}`)
    // return results.join(' | ')
    // TODO figure out how to express Union error type responses
    return 'SDKError';
  }

  httpPath(path: string, prefix?: string) {
    prefix = prefix || '';
    if (path.indexOf('{') >= 0) {
      let tweak = path.replace(/{/gi, '\\(path_' + prefix);
      tweak = tweak.replace(/}/gi, ')');
      return `"${tweak}"`;
    }
    return `"${path}"`;
  }

  argGroup(indent: string, args: Arg[], prefix?: string) {
    if (!args || args.length === 0) return this.nullStr;
    const hash: string[] = [];
    for (const arg of args) {
      if (prefix) {
        hash.push(`"${arg}": ${prefix}${arg}`);
      } else {
        hash.push(`"${arg}": ${arg}`);
      }
    }
    return `\n${indent}[${hash.join(this.argDelimiter)}]`;
  }

  queryGroup(indent: string, method: IMethod, prefix?: string) {
    const params = method.getParams('query');
    if (!params || params.length === 0) return this.nullStr;
    const hash: string[] = [];
    for (const param of params) {
      const arg = this.asAny(param);
      if (prefix) {
        hash.push(`"${param.name}": ${prefix}${arg}`);
      } else {
        hash.push(`"${param.name}": ${arg}`);
      }
    }
    return `\n${indent}[${hash.join(this.argDelimiter)}]`;
  }

  asAny(param: IParameter): Arg {
    let castIt;
    if (param.type.elementType) {
      castIt = true;
    } else {
      const mapped = this.typeMap(param.type);
      switch (mapped.name.toLowerCase()) {
        case 'date':
        case 'datetime': // case 'url': case 'uri':
        case 'object':
        case 'bool':
          castIt = true;
          break;
        default:
          castIt = false;
          break;
      }
    }
    return param.name + (castIt ? ' as Any?' : '');
  }

  argList(indent: string, args: Arg[], prefix?: string) {
    prefix = prefix || '';
    return args && args.length !== 0
      ? `\n${indent}${prefix}${args.join(this.argDelimiter + prefix)}`
      : this.nullStr;
  }

  /**
   * this is a builder function to produce arguments with optional null place holders but no extra required optional arguments
   * @param {string} current accumulator
   * @param {string} args names of parameters
   * @returns {string} accumulated argument list
   */
  argFill(current: string, args: string) {
    if (!current && args.trim() === this.nullStr) {
      // Don't append trailing optional arguments if none have been set yet
      return '';
    }
    return `${args}${current ? this.argDelimiter : ''}${current}`;
  }

  /**
   * build the http argument list from back to front, so trailing undefined arguments
   * can be omitted. Path arguments are resolved as part of the path parameter to general
   * purpose API method call
   * e.g.
   *   {queryArgs...}, bodyArg, {headerArgs...}, {cookieArgs...}
   *   {queryArgs...}, null, null, {cookieArgs...}
   *   null, bodyArg
   *   {queryArgs...}
   * @param {string} indent
   * @param {IMethod} method
   * @returns {string}
   */
  httpArgs(indent: string, method: IMethod) {
    const request = this.useRequest(method) ? 'request.' : '';
    // add options at the end of the request calls. this will cause all other arguments to be
    // filled in but there's no way to avoid this for passing in the last optional parameter.
    // Fortunately, this code bloat is minimal and also hidden from the consumer.
    let result = this.argFill('', 'options');
    // let result = this.argFill('', this.argGroup(indent, method.cookieArgs, request))
    // result = this.argFill(result, this.argGroup(indent, method.headerArgs, request))
    result = this.argFill(
      result,
      method.bodyArg
        ? `try! self.encode(${request}${method.bodyArg})`
        : this.nullStr
    );
    result = this.argFill(result, this.queryGroup(indent, method, request));
    return result;
  }

  httpCall(indent: string, method: IMethod) {
    const request = this.useRequest(method) ? 'request.' : '';
    const type = this.typeMap(method.type);
    const bump = this.bumper(indent);
    const args = this.httpArgs(bump, method);
    const errors = this.errorResponses(indent, method);
    return `${indent}let result: SDKResponse<${
      type.name
    }, ${errors}> = ${this.it(method.httpMethod.toLowerCase())}(${this.httpPath(
      method.endpoint,
      request
    )}${args ? ', ' + args : ''})
${indent}return result`;
  }

  streamCall(indent: string, method: IMethod) {
    const request = this.useRequest(method) ? 'request.' : '';
    // const type = this.typeMap(method.type)
    const bump = indent + this.indentStr;
    const args = this.httpArgs(bump, method);
    const errors = this.errorResponses(indent, method);
    return `${indent}let result: SDKResponse<Data, ${errors}> = ${this.it(
      method.httpMethod.toLowerCase()
    )}(${this.httpPath(method.endpoint, request)}${args ? ', ' + args : ''})
${indent}return result`;
  }

  summary(indent: string, text: string | undefined) {
    return this.commentHeader(indent, text);
  }

  // TODO avoid duplicate code
  typeNames(countError = true) {
    const names: string[] = [];
    if (!this.api) return names;
    if (countError) {
      this.api.types.Error.refCount++;
    } else {
      this.api.types.Error.refCount = 0;
    }
    const types = this.api.types;
    Object.values(types)
      .filter(type => type.refCount > 0 && !type.intrinsic)
      .forEach(type => names.push(`I${type.name}`));
    // TODO import default constants if necessary
    // Object.values(types)
    //   .filter(type => type instanceof RequestType)
    //   .forEach(type => names.push(`${strDefault}${type.name.substring(strRequest.length)}`))
    return names;
  }

  typeMap(type: IType): IMappedType {
    super.typeMap(type);
    // const ns = `api${this.apiRef}.`
    // const ns = `Looker.`
    const ns = 'Lk';

    const swiftTypes: Record<string, IMappedType> = {
      Error: { default: '', name: `${ns}Error` },
      Group: { default: '', name: `${ns}Group` },
      Locale: { default: '', name: `${ns}Locale` },
      any: { default: this.nullStr, name: 'AnyCodable' },
      boolean: { default: this.nullStr, name: 'Bool' },
      byte: { default: this.nullStr, name: 'binary' },
      date: { default: this.nullStr, name: 'Date' },
      datetime: { default: this.nullStr, name: 'Date' },
      double: { default: this.nullStr, name: 'Double' },
      float: { default: this.nullStr, name: 'Float' },
      int32: { default: this.nullStr, name: 'Int32' },
      int64: { default: this.nullStr, name: 'Int64' },
      integer: { default: this.nullStr, name: 'Int' },
      number: { default: this.nullStr, name: 'Double' },
      object: { default: this.nullStr, name: 'Any' },
      password: { default: this.nullStr, name: 'Password' },
      string: { default: this.nullStr, name: 'String' },
      uri: { default: this.nullStr, name: 'URI' },
      url: { default: this.nullStr, name: 'URL' },
      void: { default: '', name: 'Voidable' },
    };

    if (type.elementType) {
      // This is a structure with nested types
      const map = this.typeMap(type.elementType);
      switch (type.className) {
        case 'ArrayType':
          return { default: '[]', name: `[${map.name}]` };
        case 'HashType': {
          const mapName =
            type.elementType.name === 'string' ? 'AnyCodable' : map.name; // TODO fix bad API spec, like MergeQuery vis_config

          return { default: 'nil', name: `StringDictionary<${mapName}>` };
        }
        case 'DelimArrayType':
          return { default: 'nil', name: `DelimArray<${map.name}>` };
        case 'EnumType':
          return { default: 'nil', name: type.name };
      }
      throw new Error(`Don't know how to handle: ${JSON.stringify(type)}`);
    }

    if (type.name) {
      return swiftTypes[type.name] || { default: '', name: `${type.name}` }; // No null default for complex types
    } else {
      throw new Error('Cannot output a nameless type.');
    }
  }
}
