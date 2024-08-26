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

import type { IMappedType, IVersionInfo } from './codeGen';
import { CodeGen, commentBlock } from './codeGen';
import type {
  ApiModel,
  Arg,
  EnumValueType,
  IMethod,
  IParameter,
  IProperty,
  IType,
} from './sdkModels';
import { EnumType, strBody } from './sdkModels';

const align = (str: string, size: number): string => {
  const num = size - str.length + 1;
  return str + ' '.repeat(num);
};

/**
 * AlignColumnWriter writes text aligned by column width, it is used to keep the go struct formatting consistent.
 */
class AlignColumnWriter {
  private rows: string[][] = [];
  private sizes: number[] = [];

  writeRow(...cols: string[]) {
    cols.forEach((value, index) => {
      this.sizes[index] = Math.max(this.sizes[index] || 0, value.length);
    });
    this.rows.push(cols);
  }

  toString(): string {
    let result = '';
    this.rows.forEach(row => {
      const rowSize = row.length;
      row.forEach((col, colIndex) => {
        result +=
          rowSize - 1 === colIndex ? col : align(col, this.sizes[colIndex]);
      });
      result = result.trimRight() + '\n';
    });
    return result;
  }
}

/**
 * Go generator
 */
export class GoGen extends CodeGen {
  codePath = './go';
  fileExtension = '.go';
  nullStr = 'nil';
  packagePath = '';
  commentStr = '// ';

  enumDelimiter = '\n';
  indentStr = '  ';
  endTypeStr = '}';
  codeQuote = `"`;

  useNamedParameters = false;
  needsRequestTypes = true;

  keywords = new Set<string>([
    'break',
    'default',
    'func',
    'interface',
    'select',
    'case',
    'defer',
    'go',
    'map',
    'struct',
    'chan',
    'else',
    'goto',
    'package',
    'switch',
    'const',
    'fallthrough',
    'if',
    'range',
    'type',
    'continue',
    'for',
    'import',
    'return',
    'var',
  ]);

  constructor(public api: ApiModel, public versions?: IVersionInfo) {
    super(api, versions);
    this.packageName = `v${this.apiVersion.substring(
      0,
      this.apiVersion.indexOf('.')
    )}`;
    this.apiVersion = this.packageName;
  }

  supportsMultiApi(): boolean {
    return false;
  }

  reserve(name: string) {
    if (this.keywords.has(name)) {
      return `${name}0`;
    }
    return name;
  }

  commentHeader(indent: string, text: string | undefined) {
    if (this.noComment) return '';
    return text
      ? `${indent}/*\n\n${commentBlock(text, indent, '')}\n${indent}*/\n`
      : '';
  }

  comment(indent: string, description: string) {
    if (this.noComment) return '';
    return commentBlock(description, indent, this.commentStr);
  }

  sdkFileName(baseFileName: string) {
    return this.fileName(`${this.sdkPath}/${this.packageName}/${baseFileName}`);
  }

  methodSignature(indent: string, method: IMethod): string {
    return this.methodHeaderDeclaration(indent, method, false);
  }

  methodHeaderDeclaration(indent: string, method: IMethod, streamer = false) {
    const mapped = this.typeMap(method.type);
    const head = method.description?.trim();
    let headComment =
      (head ? `${head}\n\n` : '') +
      `${method.httpMethod} ${method.endpoint} -> ${mapped.name}`;
    let fragment = '';
    const requestType = this.requestTypeName(method);
    const bump = indent + this.indentStr;

    if (requestType) {
      fragment = `request ${requestType}`;
    } else {
      const params: string[] = [];
      const args = method.allParams; // get the params in signature order
      if (args && args.length > 0)
        args.forEach(p => params.push(this.declareParameter(bump, method, p)));
      fragment =
        params.length > 0 ? `\n${params.join(this.paramDelimiter)}` : '';
    }
    if (method.responseIsBoth()) {
      headComment += `\n\n**Note**: Binary content may be returned by this method.\n`;
    } else if (method.responseIsBinary()) {
      headComment += `\n\n**Note**: Binary content is returned by this method.\n`;
    }
    if (method.deprecated) {
      headComment += '\n\nDeprecated: This method is deprecated.\n';
    }
    const callback = `callback: (readable: Readable) => Promise<${mapped.name}>,`;
    const retType = mapped.name === 'Void' ? '' : `${mapped.name}, `;
    const header =
      this.comment('', headComment) +
      '\n' +
      `func (l *LookerSDK) ${this.toCamelCaseCap(method.name)}(` +
      (streamer ? `\n${bump}${callback}` : '');

    return (
      header +
      fragment +
      `${
        fragment ? ',' : ''
      }\n${bump}options *rtl.ApiSettings) (${retType}error) {\n`
    );
  }

  declareMethod(indent: string, method: IMethod) {
    const bump = this.bumper(indent);
    return (
      this.methodSignature(indent, method) +
      this.encodePathParams(bump, method) +
      this.httpCall(bump, method) +
      `\n}`
    );
  }

  declareParameter(indent: string, method: IMethod, param: IParameter) {
    const type =
      param.location === strBody
        ? this.writeableType(param.type, method) || param.type
        : param.type;
    const mapped = this.typeMap(type);
    let pOpt = '';
    if (param.location === strBody) {
      mapped.name = `${mapped.name}`;
    }
    if (!param.required) {
      pOpt = mapped.default ? '' : '*';
    }
    return (
      // so it turns out Go doesn't like parameter comments. Go figure https://stackoverflow.com/a/67878816
      // this.commentHeader(indent, this.paramComment(param, mapped)) +
      `${indent}${this.toCamelCase(this.reserve(param.name))} ${pOpt}${
        mapped.name
      }`
    );
  }

  encodePathParams(indent: string, method: IMethod) {
    let encodings = '';
    if (method.pathParams.length > 0) {
      const prefix = this.useRequest(method) ? 'request' : '';
      for (const param of method.pathParams) {
        if (param.doEncode()) {
          const name = this.accessor(param.name, prefix);

          encodings += `${indent}${name} = url.PathEscape(${name})\n`;
        }
      }
    }
    return encodings;
  }

  httpCall(indent: string, method: IMethod) {
    const request = this.useRequest(method) ? 'request' : '';
    const mapped = this.typeMap(method.type);
    const bump = indent + this.indentStr;
    const args = this.httpArgs(bump, method);
    // const errors = this.errorResponses(indent, method)
    const resultDef =
      mapped.name === 'Void' ? '' : `${indent}var result ${mapped.name}\n`;
    const resultPointer = mapped.name === 'Void' ? 'nil' : `&result`;
    const result = mapped.name === 'Void' ? '' : 'result, ';
    return (
      `` +
      resultDef +
      `${indent}err := l.session.Do(${resultPointer}, "${this.capitalize(
        method.httpMethod.toUpperCase()
      )}", "${this.apiPath}", ${this.httpPath(method.endpoint, request)}` +
      `${args ? ', ' + args : ''})` +
      '\n' +
      `${indent}return ${result}err` +
      '\n'
    );
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
    const request = this.useRequest(method) ? 'request' : '';
    // add options at the end of the request calls. this will cause all other arguments to be
    // filled in but there's no way to avoid this for passing in the last optional parameter.
    // Fortunately, this code bloat is minimal and also hidden from the consumer.
    let result = this.argFill('', 'options');
    // let result = this.argFill('', this.argGroup(indent, method.cookieArgs, request))
    // result = this.argFill(result, this.argGroup(indent, method.headerArgs, request))
    result = this.argFill(
      result,
      method.bodyArg ? this.accessor(method.bodyArg, request) : this.nullStr
    );
    result = this.argFill(
      result,
      this.argGroup(indent, method.queryArgs, request)
    );
    return result;
  }

  argGroup(_indent: string, args: Arg[], prefix?: string) {
    if (!args || args.length === 0) return this.nullStr;
    const hash: string[] = [];
    for (const arg of args) {
      const reserved = this.reserve(arg);
      if (prefix) {
        hash.push(`"${reserved}": ${this.accessor(arg, prefix)}`);
      } else {
        hash.push(`"${reserved}": ${this.toCamelCase(reserved)}`);
      }
    }
    return `map[string]interface{}{${hash.join(this.argDelimiter)}}`;
  }

  httpPath(path: string, prefix?: string) {
    prefix = prefix || '';
    if (path.indexOf('{') >= 0) {
      const vars: string[] = [];
      const str = path.replace(/({.*?})/g, group => {
        vars.push(
          this.accessor(group.replace('{', '').replace('}', ''), prefix)
        );
        return '%v';
      });
      const allVars = vars.join(', ');
      return allVars ? `fmt.Sprintf("${str}", ${allVars})` : `"${str}"`;
    }
    return `"${path}"`;
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
    const reserved = this.reserve(this.toCamelCase(name));
    if (!prefix) return reserved;
    return `${prefix}.${this.toCamelCaseCap(name)}`;
    // if (reserved === name) return `${prefix}.${name}`
    // return `${prefix}[${reserved}]`
  }

  methodsEpilogue(_indent: string): string {
    return '';
  }

  methodsPrologue(_indent: string): string {
    return `
// ${this.warnEditing()}

package ${this.packageName}

import (
    "fmt"
    "github.com/looker-open-source/sdk-codegen/go/rtl"
    "net/url"
    "time"
)

type authSessionDoer interface {
  Do(result interface{}, method, ver, path string, reqPars map[string]interface{}, body interface{}, options *rtl.ApiSettings) error
}

type LookerSDK struct {
  session authSessionDoer
}

func NewLookerSDK(session authSessionDoer) *LookerSDK {
  return &LookerSDK{
    session: session,
  }
}
`;
  }

  modelsPrologue(_indent: string) {
    const goImport = `
import (
  "github.com/looker-open-source/sdk-codegen/go/rtl"
  "time"
)`;

    return `
// ${this.warnEditing()}

package ${this.packageName}
${goImport}
`;
  }

  modelsEpilogue(_indent: string): string {
    return '';
  }

  summary(_indent: string, _text: string | undefined): string {
    return '';
  }

  typeSignature(indent: string, type: IType): string {
    return (
      this.comment(indent, type.description) +
      '\n' +
      `${indent}type ${type.name} struct {\n`
    );
  }

  beginRegion(indent: string, description: string): string {
    return `${indent}// region ${description}`;
  }

  endRegion(indent: string, description: string): string {
    return `${indent}// endregion ${description}`;
  }

  typeMap(type: IType): IMappedType {
    super.typeMap(type);
    const mt = this.nullStr;
    const ktTypes: Record<string, IMappedType> = {
      any: { default: mt, name: 'interface{}' },
      boolean: { default: mt, name: 'bool' },
      byte: { default: mt, name: 'byte' },
      date: { default: mt, name: 'time.Time' },
      datetime: { default: mt, name: 'time.Time' },
      double: { default: mt, name: 'float64' },
      float: { default: mt, name: 'float32' },
      int32: { default: mt, name: 'int32' },
      int64: { default: mt, name: 'int64' },
      integer: { default: mt, name: 'int' },
      number: { default: mt, name: 'float64' },
      object: { default: mt, name: 'interface{}' },
      password: { default: mt, name: 'string' },
      string: { default: mt, name: 'string' },
      uri: { default: mt, name: 'url.URL' },
      url: { default: mt, name: 'url.URL' },
      void: { default: mt, name: 'Void' }, // todo: check how to handle Void
    };

    if (type.elementType) {
      // This is a structure with nested types
      const map = this.typeMap(type.elementType);
      switch (type.className) {
        case 'ArrayType':
          return { default: this.nullStr, name: `[]${map.name}` };
        case 'HashType': {
          const mapName =
            type.elementType.name === 'string' ? 'interface{}' : map.name; // TODO fix bad API spec, like MergeQuery vis_config
          // TODO figure out this bizarre string template error either in IntelliJ or TypeScript
          // return {name: `Map<String,${map.name}>`, default: '{}'}
          return {
            default: this.nullStr,
            name: 'map[string]' + `${mapName}`,
          };
        }
        case 'DelimArrayType':
          return {
            default: this.nullStr,
            name: `rtl.Delim${this.capitalize(map.name)}`,
          };
        case 'EnumType':
          return { default: '', name: this.capitalize(type.name) };
      }
      throw new Error(`Don't know how to handle: ${JSON.stringify(type)}`);
    }

    if (type.name) {
      return (
        ktTypes[type.name] || { default: this.nullStr, name: `${type.name}` }
      );
    } else {
      throw new Error('Cannot output a nameless type.');
    }
  }

  declareType(indent: string, type: IType) {
    const bump = this.bumper(indent);

    const writer = new AlignColumnWriter();

    try {
      if (type instanceof EnumType) {
        // enum has special handling
        const props: string[] = [];
        let propertyValues = '';
        const num = type as EnumType;
        const typeName = this.capitalize(type.name);
        props.push(`type ${typeName} string`); // todo: handle other types than string
        num.values.forEach(value => {
          // props.push(this.declareEnumValue(bump, value, typeName))
          this.declareEnumValue(bump, value, typeName, writer);
        });
        props.push(writer.toString());
        propertyValues = props.join(this.enumDelimiter);

        return propertyValues;
      } else {
        this.typeProperties(type).forEach(prop =>
          // props.push(this.declareProperty(bump, prop))
          this.declareProperty(bump, prop, writer)
        );
        // propertyValues = props.join(this.propDelimiter)
      }
    } catch {
      throw new Error(JSON.stringify(type, null, 2));
    }
    return (
      this.typeSignature(indent, type) +
      writer.toString() +
      this.construct(indent, type) +
      `${this.endTypeStr ? indent : ''}${this.endTypeStr}`
    );
  }

  declareEnumValue(
    _indent: string,
    value: EnumValueType,
    typename?: string,
    writer?: AlignColumnWriter
  ) {
    const quote = typeof value === 'string' ? this.codeQuote : '';
    const name = `${typename}_${this.toCamelCaseCap(value.toString())}`;
    if (writer) {
      writer.writeRow(
        'const',
        name,
        typename || '',
        '=',
        `${quote}${value}${quote}`
      );
    }
    return `const ${name} ${typename} = ${quote}${value}${quote}`;
  }

  declareProperty(
    indent: string,
    property: IProperty,
    writer?: AlignColumnWriter
  ): string {
    const type = this.typeMap(property.type);
    const name = this.toCamelCaseCap(property.name);
    const typeName = type.name;

    const doc = property.description
      ? `${this.comment(' ', property.description)}`
      : '';

    const optionalJson = property.required ? '' : ',omitempty';
    const optionalPointer = property.required ? '' : '*';

    if (writer) {
      writer.writeRow(
        `${indent}${name}`,
        `${optionalPointer}${typeName}`,
        `\`json:"${property.name}${optionalJson}"\``,
        doc
      );
    }
    return ``;
  }

  capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  toCamelCaseCap(str: string): string {
    return this.capitalize(
      str.replace(/([-_][a-z])/g, group =>
        group.toUpperCase().replace('-', '').replace('_', '')
      )
    );
  }

  toCamelCase(str: string): string {
    return str.replace(/([-_][a-z])/g, group =>
      group.toUpperCase().replace('-', '').replace('_', '')
    );
  }
}
