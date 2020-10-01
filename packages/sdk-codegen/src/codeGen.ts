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
import { DelimArray } from '@looker/sdk-rtl/lib/browser'
import {
  ApiModel,
  Arg,
  ArgValues,
  ArrayType,
  EnumType,
  EnumValueType,
  IMethod,
  IntrinsicType,
  IParameter,
  IProperty,
  IType,
  mayQuote,
  Type,
} from './sdkModels'

export interface IVersionInfo {
  lookerVersion: string
  apiVersion: string
}

/**
 * Removes all empty input values
 * @param inputs current inputs
 * @returns inputs with all "empty" values removed so the key no longer exists
 */
export const trimInputs = (inputs: any): any => {
  function isEmpty(value: any) {
    if (Array.isArray(value)) return value.length === 0
    if (value === undefined) return true
    if (value === null) return true
    if (value === '') return true
    if (value instanceof Object) return Object.keys(value).length === 0
    return false
  }

  let result: any
  if (isEmpty(inputs)) return {}
  if (inputs instanceof DelimArray) return inputs
  if (Array.isArray(inputs)) {
    result = []
    Object.values(inputs).forEach((v: any) => result.push(trimInputs(v)))
  } else if (inputs instanceof Object) {
    result = {}
    Object.entries(inputs).forEach(([key, value]) => {
      const trimmed = trimInputs(value)
      if (!isEmpty(trimmed)) {
        result[key] = trimmed
      }
    })
  } else {
    // Scalar value
    result = inputs
  }
  return result
}

/**
 * Function pattern for creating source code assignment expressions
 */
export type CodeAssignment = (indent: string, value: any) => string

/** Language-specific type mapping */
export interface IMappedType {
  /** language's name for the type */
  name: string
  /** default value expression */
  default: string
  /** assignment expression of value */
  asVal?: CodeAssignment
  /** expression to use as the type's optional default */
  optional?: string
}

export interface ICodeGen {
  /**
   * root path for generated source code files
   * e.g. 'python' for Python
   */
  codePath: string

  /**
   * folder for the Looker SDK reference
   * e.g. 'looker_sdk' for Python. All python source would end up under `python/looker_sdk`
   */
  packagePath: string

  /**
   * Name of the SDK package
   * e.g. 'Looker40SDK' for API 4.0. This package name is currently determined by the base `CodeGen` class
   */
  packageName: string

  /**
   * relative folder path for sdk file generation
   * e.g. 'sdk` for python
   */
  sdkPath: string

  /** current version of the Api being generated */
  apiVersion: string

  /**
   * beginning name pattern for all environment variables
   * e.g. LOOKERSDK
   */
  environmentPrefix: string

  /**
   * name of api request instance variable
   * e.g. _rtl for Python, transport for TypeScript
   */
  transport: string

  /** reference to self. e.g self, this, it, etc. */
  itself: string

  /** file extension for generated files */
  fileExtension: string

  /**
   * comment string
   * e.g. Python=# C#=// TypeScript=//
   */
  commentStr: string

  /**
   * string representation of null value
   * e.g. Python None, C# null, Delphi nil
   */
  nullStr: string

  /** indentation string. Typically two spaces '  ' */
  indentStr: string

  /** end type string. For C# and TypeScript, usually '}\n' */
  endTypeStr: string

  /** argument separator string. Typically ', ' */
  argDelimiter: string

  /** parameter delimiter. Typically ",\n" */
  paramDelimiter: string

  /** property delimiter. Typically, "\n" or ",\n" */
  propDelimiter: string

  /** enum value delimiter. Typically, ",\n" */
  enumDelimiter: string

  /** quote character/string to use for quoted strings. Typically, '"' or "'" */
  codeQuote: string

  /**
   * Does this language require request types to be generated because it doesn't
   * conveniently support named default parameters?
   */
  needsRequestTypes: boolean

  /** Does this language have streaming methods? */
  willItStream: boolean

  /** versions info used for generating the SDK */
  versions?: IVersionInfo

  /** array open string */
  arrayOpen: string

  /** array close string */
  arrayClose: string

  /** hash open string */
  hashOpen: string

  /** hash close string */
  hashClose: string

  /** type open string */
  typeOpen: string

  /** type close string */
  typeClose: string

  /**
   * Quote a string value for the language
   * @param value to quote
   */
  quote(value: any): string

  /**
   * Returns true if the SDK supports multiple API versions of models
   * @returns True if multi-API is supported
   */
  supportsMultiApi(): boolean

  /**
   * Returns the name of the RequestType if this language AND method require it.
   * Otherwise return empty string.
   * @param {IMethod} method
   * @returns {string}
   */
  requestTypeName(method: IMethod): string

  /**
   * Formats argument assignment expressions for source code
   * @param indent code indentation
   * @param args argument assignments as string expressions
   * @param opener structure opener. e.g. { for hash, [ for array
   * @param closer structure closer. e.g. } for hash, ] for array
   */
  argIndent(
    indent: string,
    args: string[],
    opener: string,
    closer: string
  ): string

  /**
   * Generate the assignment value of an argument for this language
   * @param indent code indentation
   * @param arg parameter or property to receive value
   * @param inputs values to find assignment in
   */
  argValue(
    indent: string,
    arg: IParameter | IProperty,
    inputs: ArgValues
  ): string

  /**
   * Maps input values into type
   * @param indent starting indent level
   * @param type that receives assignments
   * @param inputs to assign to type
   */
  assignType(indent: string, type: IType, inputs: ArgValues): string

  /**
   * Generate assignment statement for parameters of a method
   * @param method to assign values to
   * @param inputs to assign to method parameters
   */
  assignParams(method: IMethod, inputs: ArgValues): string

  /**
   * Argument value setter code expression
   * @param name of argument/property
   * @param sep spacing to separate value. Could be newline or single space or something else
   * @param exp expression (as valid code fragment) to assign
   *
   * @example `${name}:${sep}${exp}` for Typescript
   */
  argSet(name: string, sep: string, exp: string): string

  /**
   * Converts val to an array value expression
   * @param indent code indentation
   * @param type of array to create
   * @param val value(s) to convert to a code assignment
   */
  arrayValue(indent: string, type: IType, val: any): string

  /**
   * Converts any value to its code expression
   * @param indent code indentation
   * @param val value(s) to convert to a code assignment
   */
  anyValue(indent: string, val: any): string

  /**
   * Converts val to a dictionary/hash code expression
   * @param indent code indentation
   * @param val value(s) to convert to a code assignment
   */
  hashValue(indent: string, val: any): any

  /**
   * Generate the SDK calling syntax for the method with the provided inputs
   * @param method to convert to SDK call
   * @param inputs to assign to parameters of the method
   */
  makeTheCall(method: IMethod, inputs: ArgValues): string

  /**
   * Returns the WriteType if the passed type has any readOnly properties or types
   *
   * If the writeable type exists, a reference to it is added to the method
   * @param {IType} type
   * @param method to track writeable type conversion
   * @returns {IType | undefined}
   */
  writeableType(type: IType, method: IMethod): IType | undefined

  /**
   * standard code to insert at the top of the generated "methods" file(s)
   * @param {string} indent code indentation
   * @returns {string}
   */
  methodsPrologue(indent: string): string

  /**
   * standard code to append to the bottom of the generated "methods" file(s)
   * @param {string} indent code indentation
   * @returns {string} generated code
   */
  methodsEpilogue(indent: string): string

  /**
   * standard code to insert at the top of the generated "streams" file(s)
   * @param {string} indent code indentation
   * @returns {string} generated code
   */
  streamsPrologue(indent: string): string

  /**
   * aliases or escapes names that are the language's reserved words, or must be treated specially, like hyphenate names
   * @param name symbol name to reserve
   * @returns either the original name, or the transformed "reserved" version of it
   */
  reserve(name: string): string

  /**
   * standard code to insert at the top of the generated "models" file(s)
   * @param {string} indent code indentation
   * @returns {string} generated code
   */
  modelsPrologue(indent: string): string

  /**
   * standard code to append to the bottom of the generated "models" file(s)
   * @param {string} indent code indentation
   * @returns {string} generated code
   */
  modelsEpilogue(indent: string): string

  /**
   * Get the name of an SDK file complete with API version
   * @param {string} baseFileName e.g. "methods" or "models"
   * @returns {string} fully specified, API-version-specific file name
   */
  sdkFileName(baseFileName: string): string

  /**
   * provide the name for a file with the appropriate language code extension
   * @param {string} base eg "methods" or "models"
   * @returns {string} full sdk file name complete with extension
   */
  fileName(base: string): string

  /**
   * generate an optional comment header if the comment is not empty
   * @param indent code indentation
   * @param text of comment, can be multi-line
   * @param commentStr comment character for multi-line comments
   * @returns comment (or not)
   */
  commentHeader(
    indent: string,
    text: string | undefined,
    commentStr?: string
  ): string

  /**
   * group argument names together
   * e.g.
   *  [ row_size, page_offset ]
   * @param {string} indent code indentation
   * @param {Arg[]} args list of argument names
   * @param {string} prefix "namespace" for argument names
   * @returns {string} source code
   */
  argGroup(indent: string, args: Arg[], prefix?: string): string

  /**
   * list arguments by name
   * e.g.
   *  row_size, page_offset
   * @param {string} indent code indentation
   * @param {Arg[]} args list of argument names
   * @param {string} prefix "namespace" for argument names
   * @returns {string} source code
   */
  argList(indent: string, args: Arg[], prefix?: string): string

  /**
   * generate a comment block
   * e.g.
   *  # this is a
   *  # multi-line comment block
   * @param indent code indentation
   * @param description as comment
   * @returns comment block
   */
  comment(indent: string, description: string): string

  /**
   * Generate a #region comment equivalent for the language
   * @param indent code indentation
   * @param description as comment
   * @returns region comment
   */
  beginRegion(indent: string, description: string): string

  /**
   * Generate an #endregion comment equivalent for the language
   * @param indent code indentation
   * @param description as comment
   * @returns region comment
   */
  endRegion(indent: string, description: string): string

  /**
   * generates the method signature including parameter list and return type.
   * @param {string} indent code indentation
   * @param {IMethod} method to declare
   * @returns {string} source code
   */
  methodSignature(indent: string, method: IMethod): string

  /**
   * convert endpoint pattern to platform-specific string template
   * @param {string} path endpoint path template
   * @param {string} prefix namespace prefix
   * @returns {string} string template
   */
  httpPath(path: string, prefix?: string): string

  /**
   * generate a call to the http API abstraction
   * includes http method, path, body, query, headers, cookie arguments
   * @param {string} indent code indentation
   * @param {IMethod} method to call
   * @returns {string} source code
   */
  httpCall(indent: string, method: IMethod): string

  /**
   * generate a call to the stream API abstraction
   * includes http method, path, body, query, headers, cookie arguments
   * @param {string} indent code indentation
   * @param {IMethod} method to call
   * @returns {string} source code
   */
  streamCall(indent: string, method: IMethod): string

  /**
   * generates the type declaration signature for the start of the type definition
   * @param {string} indent code indentation
   * @param {IType} type to declare
   * @returns {string} source code
   */
  typeSignature(indent: string, type: IType): string

  /**
   * generates summary text
   * e.g, for Python:
   *  '''This is the method summary'''
   * @param {string} indent code indentation
   * @param {string} text comment
   * @returns {string} source code
   */
  summary(indent: string, text: string): string

  /**
   *
   * produces the declaration block for a parameter
   * e.g.
   *   # ID of the query to run
   *   query_id: str
   *
   * and
   *
   *   # size description of parameter
   *   row_limit: int = None
   * @param {string} indent code indentation
   * @param {IMethod} method method containing the parameter
   * @param {IParameter} param parameter to declare
   * @returns {string} the parameter declaration
   */
  declareParameter(indent: string, method: IMethod, param: IParameter): string

  /**
   * Handles the encoding call for path parameters within method declarations
   * @param {string} indent code indentation
   * @param {IMethod} method structure of method to declare
   * @returns {string} the resolved API endpoint path
   */
  encodePathParams(indent: string, method: IMethod): string

  /**
   * generates the entire method
   * @param {string} indent code indentation
   * @param {IMethod} method structure of method to declare
   * @returns {string} the resolved API endpoint path
   */
  declareMethod(indent: string, method: IMethod): string

  /**
   * generates the streaming method signature including parameter list and return type.
   * @param {string} indent code indentation
   * @param {IMethod} method
   * @returns {string}
   */
  streamerSignature(indent: string, method: IMethod): string

  /**
   * Generates the entire streaming method
   * @param {string} indent code indentation
   * @param {IMethod} method method to declare
   * @returns {string} source code
   */
  declareStreamer(indent: string, method: IMethod): string

  /**
   * generates the list of parameters for a method signature
   * e.g.
   * # ID of the query to run
   * query_id: str,
   * # size description of parameter
   * row_limit: int = None
   * @param {string} indent code indentation
   * @param {IMethod} method containing parameters to declare
   * @returns {string} source code
   */
  declareParameters(indent: string, method: IMethod): string

  /**
   * generates the syntax for a constructor argument
   * @param {string} indent code indentation
   * @param {IProperty} property of constructor
   * @returns {string} source code
   */
  declareConstructorArg(indent: string, property: IProperty): string

  /**
   * produces the code for the type constructor
   * @param {string} indent code indentation
   * @param {IType} type to generate
   * @returns {string} source code
   */
  construct(indent: string, type: IType): string

  /**
   * produces list of properties for declareType
   * @param {IType} type to generate
   * @returns {PropertyList} list of properties
   */
  typeProperties(type: IType): IProperty[]

  /**
   * generates entire type declaration
   * @param {string} indent code indentation
   * @param {IType} type to generate
   * @returns {string} source code
   */
  declareType(indent: string, type: IType): string

  /**
   * generates a textual description for the property's comment header
   * @param {IProperty} property to describe
   * @returns {string} source code
   */
  describeProperty(property: IProperty): string

  /**
   * generates type property declaration
   * @param {string} indent code indentation
   * @param {IProperty} property to declare
   * @returns {string} source code
   */
  declareProperty(indent: string, property: IProperty): string

  /**
   * generates an enum value declaration
   * @param {string} indent code indentation
   * @param {EnumValueType} value to declare
   * @returns {string} source code
   */
  declareEnumValue(indent: string, value: EnumValueType): string

  /**
   * if countError is false, no import reference to Error or IError should be included
   * @param {boolean} countError
   * @returns {string[]}
   */
  typeNames(countError: boolean): string[]

  /**
   * Language-specific type conversion
   * @param {IType} type to potentially convert
   * @returns {IMappedType} converted type
   */
  typeMap(type: IType): IMappedType
}

export abstract class CodeGen implements ICodeGen {
  needsRequestTypes = false
  willItStream = false
  codePath = './'
  packagePath = 'looker'
  sdkPath = 'sdk'
  packageName = 'LookerSDK'
  environmentPrefix = this.packageName.toUpperCase()
  itself = ''
  fileExtension = '.code'
  argDelimiter = ', '
  paramDelimiter = ',\n'
  propDelimiter = '\n'
  enumDelimiter = ',\n'
  codeQuote = `'`
  arrayOpen = '[ '
  arrayClose = ' ]'
  hashOpen = '{ '
  hashClose = ' }'
  typeOpen = '{'
  typeClose = '}'

  indentStr = '  '
  commentStr = '// '
  nullStr = 'null'
  endTypeStr = ''
  transport = 'rtl'

  apiVersion = ''
  apiRef = ''
  apiPath = ''

  constructor(public api: ApiModel, public versions?: IVersionInfo) {
    if (versions && versions.apiVersion) {
      this.apiVersion = versions.apiVersion
      this.apiRef = this.apiVersion.replace('.', '')
      this.apiPath = `/${this.apiVersion}`
      this.packageName = this.supportsMultiApi()
        ? `Looker${this.apiRef}SDK`
        : `LookerSDK`
      this.packagePath += this.apiPath
    }
  }

  /**
   * Returns true if the SDK supports multiple API versions of models
   * @returns True if multi-API is supported
   */
  supportsMultiApi() {
    // Currently, all but Swift support multiple APIs
    return true
  }

  /**
   * beginning of the "methods" file for a language
   * @param {string} indent
   * @returns {string}
   */
  abstract methodsPrologue(indent: string): string

  /**
   * ending of the "methods" file for a language
   * @param {string} indent
   * @returns {string}
   */
  abstract methodsEpilogue(indent: string): string

  reserve(name: string) {
    return name
  }

  streamsPrologue(_indent: string) {
    return ''
  }

  /**
   * beginning of the "models" file for a language
   * @param {string} indent
   * @returns {string}
   */
  abstract modelsPrologue(indent: string): string

  /**
   * ending of the "models" file for a language
   * @param {string} indent
   * @returns {string}
   */
  abstract modelsEpilogue(indent: string): string

  abstract declareParameter(
    indent: string,
    method: IMethod,
    param: IParameter
  ): string

  /**
   * Quote a string value for the language
   * @param value to quote
   */
  quote(value: any) {
    return `${this.codeQuote}${value}${this.codeQuote}`
  }

  declareEnumValue(indent: string, value: EnumValueType) {
    const quote = typeof value === 'string' ? this.codeQuote : ''
    return `${indent}${mayQuote(value)} = ${quote}${value}${quote}`
  }

  abstract declareProperty(indent: string, property: IProperty): string

  abstract typeSignature(indent: string, type: IType): string

  abstract methodSignature(indent: string, method: IMethod): string

  abstract declareMethod(indent: string, method: IMethod): string

  argIndent(indent: string, args: string[], opener: string, closer: string) {
    const bump = this.bumper(indent)
    let open = opener
    let close = closer
    let delim = this.argDelimiter
    if (args.length > 1) {
      open = `${indent}${opener.trim()}\n${bump}`
      close = `\n${indent}${closer.trim()}`
      delim = `${this.argDelimiter.trim()}\n${bump}`
    }
    return `${open}${args.join(delim)}${close}`
  }

  argValue(
    indent: string,
    arg: IParameter | IProperty,
    inputs: ArgValues
  ): string {
    // TODO handle required positional arguments that are not provided?
    if (!(arg.name in inputs)) return ''
    const val = inputs[arg.name]
    const type = this.typeMap(arg.type)
    if (type.asVal) return type.asVal(indent, val)
    if (!arg.type.intrinsic) {
      return this.assignType(this.bumper(indent), arg.type, val)
    }
    return val.toString()
  }

  assignParams(method: IMethod, inputs: ArgValues): string {
    const args: string[] = []
    if (Object.keys(inputs).length > 0) {
      const requestType = this.api.getRequestType(method)
      if (requestType) {
        return this.assignType(this.indentStr, requestType, inputs)
      }
      method.allParams.forEach((p) => {
        const v = this.argValue('', p, inputs)
        if (v !== '') args.push(v)
      })
    }
    return args.join(this.argDelimiter)
  }

  argSet(name: string, sep: string, exp: string) {
    return `${name}:${sep}${exp}`
  }

  /**
   * Maps input values into type
   * @param indent starting indent level
   * @param type that receives assignments
   * @param inputs to assign to type
   */
  assignType(indent: string, type: IType, inputs: ArgValues): string {
    const args: string[] = []
    const bump = this.bumper(indent)
    Object.values(type.properties).forEach((p) => {
      let v = this.argValue(bump, p, inputs)
      let sep = ' '
      if (v.includes('\n')) {
        sep = v.startsWith('\n') ? '' : '\n'
      } else {
        v = v.trimStart()
      }
      if (v) args.push(this.argSet(p.name, sep, v))
    })
    // Nothing to assign?
    if (args.length === 0) return ''
    // Otherwise, indent and join arguments
    const nl = `,\n${bump}`
    return `\n${indent}${this.typeOpen}\n${bump}${args.join(nl)}\n${indent}${
      this.typeClose
    }`
  }

  arrayValue(indent: string, type: IType, val: any) {
    const args: string[] = []
    const ra = type as ArrayType
    let asVal = (_: string, v: any) => v.toString()
    const bump = this.bumper(indent)
    const intrinsic = ra.elementType.intrinsic
    const open = intrinsic ? '' : '\n'
    const close = ra.elementType.intrinsic ? '' : `\n${indent}`
    if (ra.elementType.intrinsic) {
      const it = ra.elementType as IntrinsicType
      if (it.isString) asVal = (_, v) => this.quote(v)
    } else {
      asVal = (b: string, v: any) => this.assignType(b, ra.elementType, v)
    }
    // Bump is only used for nested complex typed items
    Object.values(val).forEach((v) => args.push(asVal(bump, v)))
    return `${open}${indent}${this.arrayOpen.trim()}${args.join(
      this.argDelimiter
    )}${close}${this.arrayClose.trim()}`
  }

  anyValue(indent: string, val: any): string {
    if (val instanceof Type) return this.assignType(indent, val as Type, val)
    switch (typeof val) {
      case 'bigint':
      case 'number':
        return val.toString()
      case 'boolean':
        return val ? 'true' : 'false'
      case 'string':
        return this.quote(val)
      case 'undefined':
        return ''
      case 'function':
        return ''
      case 'object': {
        const bump = this.bumper(indent)
        if (Array.isArray(val)) {
          const vals: string[] = []
          Object.values(val).forEach((v) => {
            vals.push(this.anyValue(indent, v))
          })
          return this.argIndent(bump, vals, this.arrayOpen, this.arrayClose)
        } else {
          return this.hashValue(bump, val)
        }
      }
      case 'symbol':
        return val.toString()
    }
    return val.toString()
  }

  hashValue(indent: string, val: any) {
    const args: string[] = []
    Object.entries(val).forEach(([name, v]) => {
      const exp = this.anyValue(indent, v)
      const sep = exp.includes('\n') ? '\n' : ' '
      args.push(this.argSet(name, sep, exp))
    })
    return this.argIndent(indent, args, this.hashOpen, this.hashClose)
  }

  makeTheCall(_method: IMethod, _inputs: ArgValues) {
    return this.commentHeader('', `Not yet available`)
  }

  abstract encodePathParams(indent: string, method: IMethod): string

  beginRegion(indent: string, description: string): string {
    return `${indent}#region ${description}`
  }

  endRegion(indent: string, description: string): string {
    return `${indent}#endregion ${description}`
  }

  warnEditing() {
    return (
      'NOTE: Do not edit this file generated by Looker SDK Codegen' +
      (this.versions
        ? ` for Looker ${this.versions?.lookerVersion} API ${this.apiVersion}`
        : '')
    )
  }

  streamerSignature(_indent: string, _method: IMethod) {
    return ''
  }

  // Only implement this method for languages that have explicit streaming methods declared
  declareStreamer(_indent: string, _method: IMethod) {
    return ''
  }

  abstract summary(indent: string, text: string | undefined): string

  initArg(_indent: string, _property: IProperty): string {
    return ''
  }

  construct(_indent: string, _type: IType): string {
    return ''
  }

  bumper(indent: string) {
    return indent + this.indentStr
  }

  describeProperty(property: IProperty) {
    return `${property.description}${property.readOnly ? ' (read-only)' : ''}`
  }

  sdkFileName(baseFileName: string) {
    return this.fileName(`${this.sdkPath}/${this.apiVersion}/${baseFileName}`)
  }

  fileName(base: string) {
    return `${this.codePath}${this.packagePath}/${base}${this.fileExtension}`
  }

  comment(indent: string, description: string) {
    return commentBlock(description, indent, this.commentStr)
  }

  commentHeader(
    indent: string,
    text: string | undefined,
    _commentStr?: string
  ) {
    return text ? `${this.comment(indent, text)}\n` : ''
  }

  declareParameters(indent: string, method: IMethod) {
    const params = method.allParams
    const items: string[] = []
    if (params)
      params.forEach((p) =>
        items.push(this.declareParameter(indent, method, p))
      )
    return items.join(this.paramDelimiter)
  }

  declareConstructorArg(indent: string, property: IProperty) {
    return `${indent}${property.name}${
      property.nullable ? ' = ' + this.nullStr : ''
    }`
  }

  it(value: string) {
    return this.itself ? `${this.itself}.${value}` : value
  }

  typeProperties(type: IType) {
    return Object.values(type.properties)
  }

  declareType(indent: string, type: IType) {
    const bump = this.bumper(indent)
    const props: string[] = []
    let propertyValues = ''
    try {
      if (type instanceof EnumType) {
        const num = type as EnumType
        num.values.forEach((value) =>
          props.push(this.declareEnumValue(bump, value))
        )
        propertyValues = props.join(this.enumDelimiter)
      } else {
        this.typeProperties(type).forEach((prop) =>
          props.push(this.declareProperty(bump, prop))
        )
        propertyValues = props.join(this.propDelimiter)
      }
    } catch {
      throw new Error(JSON.stringify(type, null, 2))
    }
    return (
      this.typeSignature(indent, type) +
      propertyValues +
      this.construct(indent, type) +
      `${this.endTypeStr ? indent : ''}${this.endTypeStr}`
    )
  }

  argGroup(indent: string, args: Arg[], prefix?: string) {
    prefix = prefix || ''
    return args && args.length !== 0
      ? `${indent}[${prefix}${args.join(this.argDelimiter + prefix)}]`
      : this.nullStr
  }

  argList(indent: string, args: Arg[], prefix?: string) {
    prefix = prefix || ''
    return args && args.length !== 0
      ? `${indent}${prefix}${args.join(this.argDelimiter + prefix)}`
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

  httpPath(path: string, _prefix?: string) {
    return path
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
    let result = this.argFill('', this.argGroup(indent, method.cookieArgs))
    result = this.argFill(result, this.argGroup(indent, method.headerArgs))
    result = this.argFill(
      result,
      method.bodyArg ? method.bodyArg : this.nullStr
    )
    result = this.argFill(result, this.argGroup(indent, method.queryArgs))
    return result
  }

  errorResponses(_indent: string, method: IMethod) {
    const results: string[] = method.errorResponses.map((r) => `${r.type.name}`)
    return results.join(', ')
  }

  httpCall(indent: string, method: IMethod) {
    const bump = indent + this.indentStr
    const args = this.httpArgs(bump, method)
    const errors = `(${this.errorResponses(indent, method)})`
    return `${indent}return ${this.it(
      this.transport
    )}.${method.httpMethod.toLowerCase()}(${errors}, "${method.endpoint}"${
      args ? ', ' + args : ''
    })`
  }

  streamCall(_indent: string, _method: IMethod) {
    return ''
  }

  useRequest(method: IMethod) {
    if (!this.needsRequestTypes) return false
    return method.mayUseRequestType()
  }

  // Looks up or dynamically creates the request type for this method based
  // on rules for creating request types at the IApiModel implementation level
  // If no request type is required, no request type is created or referenced
  requestTypeName(method: IMethod): string {
    if (!this.useRequest(method)) return ''
    const request = this.api.getRequestType(method)
    if (!request) return ''
    request.refCount++
    method.addType(this.api, request)
    return request.name
  }

  // Looks up or dynamically creates the writeable type for this method based
  // on rules for creating writable types at the IApiModel implementation level
  // If no writeable type is required, no writeable type is created or referenced
  writeableType(type: IType, method: IMethod): IType | undefined {
    if (!type) return undefined
    const writer = this.api.mayGetWriteableType(type)
    if (!writer) return undefined
    writer.refCount++
    method.addType(this.api, writer)
    return writer
  }

  typeNames(_countError = true) {
    const items: string[] = []
    if (!this.api) return items
    Object.values(this.api.types)
      .filter((type) => type.refCount > 0 && !type.intrinsic)
      .forEach((type) => items.push(type.name))
    return items
  }

  typeMap(type: IType): IMappedType {
    type.refCount++ // increment refcount
    return { default: this.nullStr || '', name: type.name || '' }
  }
}
