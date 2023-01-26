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
  ArgValues,
  IMethod,
  IParameter,
  IProperty,
  IType,
} from './sdkModels'
import { describeParam, EnumType, strBody } from './sdkModels'
import type { IMappedType, CodeAssignment } from './codeGen'
import { CodeGen } from './codeGen'

export class PythonGen extends CodeGen {
  codePath = './python/'
  packagePath = 'looker_sdk'
  itself = 'self'
  fileExtension = '.py'
  commentStr = '# '
  nullStr = 'None'

  indentStr = '    '
  argDelimiter = `,\n${this.indentStr.repeat(3)}`
  argSetSep = '='
  paramDelimiter = ',\n'
  propDelimiter = '\n'
  dataStructureDelimiter = ', '
  enumDelimiter = '\n'
  codeQuote = '"'
  typeOpen = '('
  typeClose = ')'
  hashKeyQuote = '"'
  useModelClassForTypes = true

  endTypeStr = ''

  // keyword.kwlist
  pythonKeywords = new Set<string>([
    'False',
    'None',
    'True',
    'and',
    'as',
    'assert',
    'async',
    'await',
    'break',
    'class',
    'continue',
    'def',
    'del',
    'elif',
    'else',
    'except',
    'finally',
    'for',
    'from',
    'global',
    'if',
    'import',
    'in',
    'is',
    'lambda',
    'nonlocal',
    'not',
    'or',
    'pass',
    'raise',
    'return',
    'try',
    'while',
    'with',
    'yield',
  ])

  // cattrs [un]structure hooks for model [de]serialization
  hooks: string[] = []
  structureHookTK = 'translate_keys_structure_hook'
  pythonReservedKeywordClasses: Set<string> = new Set()

  methodsPrologue = (_indent: string) => `
# ${this.warnEditing()}
import datetime
from typing import Any, MutableMapping, Optional, Sequence, Union, cast
import warnings

from . import models as mdls
from ${this.packagePath}.rtl import api_methods
from ${this.packagePath}.rtl import transport

class ${this.packageName}(api_methods.APIMethods):
`

  methodsEpilogue = (_indent: string) =>
    this.apiVersion === '3.1' ? `LookerSDK = ${this.packageName}` : ''

  modelsPrologue = (_indent: string) => `
# ${this.warnEditing()}
import datetime
import enum
from typing import Any, MutableMapping, Optional, Sequence

try:
    from typing import ForwardRef  # type: ignore
except ImportError:
    from typing import _ForwardRef as ForwardRef  # type: ignore

import attr

from ${this.packagePath}.rtl import model
from ${this.packagePath}.rtl import serialize as sr

EXPLICIT_NULL = model.EXPLICIT_NULL  # type: ignore
DelimSequence = model.DelimSequence
`

  modelsEpilogue = (_indent: string) => `
import functools  # noqa:E402

forward_ref_structure_hook = functools.partial(
    sr.forward_ref_structure_hook, globals(), sr.converter${this.apiRef}
)
sr.converter${this.apiRef}.register_structure_hook_func(
    lambda t: t.__class__ is ForwardRef, forward_ref_structure_hook
)
${
  this.structureHookTK
} = functools.partial(sr.translate_keys_structure_hook, sr.converter${
    this.apiRef
  })
${this.hooks.join('\n')}
`

  sdkFileName(baseFileName: string) {
    return this.fileName(`sdk/api${this.apiRef}/${baseFileName}`)
  }

  argGroup(_indent: string, args: Arg[]) {
    if (!args || args.length === 0) return this.nullStr
    const hash: string[] = []
    for (const arg of args) {
      hash.push(`"${arg}": ${arg}`)
    }
    return `{${hash.join(this.dataStructureDelimiter)}}`
  }

  beginRegion(indent: string, description: string): string {
    // Sadly, Black reformats this to "# region" and IntelliJ doesn't recognize it either way
    return `${indent}#region ${description}`
  }

  endRegion(indent: string, _description: string): string {
    // Sadly, Black reformats this to "# endregion" and IntelliJ doesn't recognize it either way
    return `${indent}#endregion`
  }

  declareProperty(indent: string, property: IProperty, annotations = false) {
    const mappedType = this.typeMapModels(property.type)
    let propName = property.name
    if (this.pythonKeywords.has(propName)) {
      propName = propName + '_'
    }
    let propType = mappedType.name
    if (!property.required) {
      propType = `Optional[${mappedType.name}]`
    }

    let propDef
    if (annotations) {
      let annotation = propType
      if (this.isBareForwardRef(property)) {
        annotation = `ForwardRef(${propType})`
      }
      propDef = `${this.bumper(indent)}"${propName}": ${annotation}`
    } else {
      if (!property.required) {
        propType += ` = ${this.nullStr}`
      }
      propDef = `${indent}${propName}: ${propType}`
    }
    return propDef
  }

  private methodReturnType(method: IMethod) {
    const type = this.typeMapMethods(method.type)
    let returnType = type.name
    if (method.responseIsBoth()) {
      returnType = `Union[${returnType}, bytes]`
    } else if (method.responseIsBinary()) {
      returnType = 'bytes'
    }
    return returnType
  }

  // because Python has named default parameters, Request types are not required like
  // they are for TypeScript
  methodSignature(indent: string, method: IMethod) {
    const returnType = this.methodReturnType(method)
    const bump = this.bumper(indent)
    const params: string[] = []
    const args = method.allParams
    if (args && args.length > 0) {
      method.allParams.forEach((p) =>
        params.push(this.declareParameter(bump, method, p))
      )
    }
    let head = method.description?.trim()
    head =
      (head ? `${head}\n\n` : '') +
      `${method.httpMethod} ${method.endpoint} -> ${returnType}`
    params.push(
      `${bump}transport_options: Optional[transport.TransportOptions] = None,`
    )
    return (
      this.commentHeader(indent, head) +
      `${indent}def ${method.name}(\n` +
      `${bump}self${params.length > 0 ? ',\n' : ''}` +
      `${params.join(this.paramDelimiter)}\n` +
      `${indent}) -> ${returnType}:\n`
    )
  }

  declareParameter(indent: string, method: IMethod, param: IParameter) {
    let type: IType
    if (param.location === strBody) {
      type = this.writeableType(param.type, method) || param.type
    } else {
      type = param.type
    }
    const mapped = this.typeMapMethods(type)
    const paramType = param.required ? mapped.name : `Optional[${mapped.name}]`
    return (
      this.commentHeader(indent, describeParam(param)) +
      `${indent}${param.name}: ${paramType}` +
      (param.required ? '' : ` = ${mapped.default}`)
    )
  }

  makeTheCall(method: IMethod, inputs: ArgValues): string {
    const origDelim = this.argDelimiter
    this.argDelimiter = `,\n${this.indentStr}`
    const resp = `response = sdk.${method.name}(`
    const args = this.assignParams(method, inputs)
    this.argDelimiter = origDelim
    return `${resp}${args})`
  }

  initArg(indent: string, property: IProperty) {
    let propName = property.name
    if (this.pythonKeywords.has(propName)) {
      propName = propName + '_'
    }
    return `${indent}self.${propName} = ${propName}`
  }

  declareType(indent: string, type: IType) {
    let decl = super.declareType(indent, type)
    if (type instanceof EnumType) {
      const invalid =
        'invalid_api_enum_value = "invalid_api_enum_value"' +
        '\n\n\n# https://github.com/python/mypy/issues/2427' +
        `\n${type.name}.__new__ = model.safe_enum__new__  # type: ignore`
      decl += `\n${this.bumper(indent)}${invalid}`
    }
    return decl
  }

  typeProperties(type: IType) {
    return Object.values(type.requiredProperties).concat(
      Object.values(type.optionalProperties)
    )
  }

  private isBareForwardRef = (prop: IProperty) => {
    // contains a "bare" forward reference e.g. `result_format: "ResultFormat"`
    // so we need to emit the `__annotations__` property
    return (
      prop.required &&
      (prop.type.customType || prop.type instanceof EnumType) &&
      !['ArrayType', 'HashType', 'DelimArrayType'].includes(prop.type.className)
    )
  }

  /**
   * Ideally we'd rely on @attr.s to generate the constructor for us
   * However, neither Jedi (https://github.com/davidhalter/jedi-vim/issues/816)
   * nor microsoft/python-language-server
   * (https://github.com/microsoft/python-language-server/issues/399)
   * display good tooltips for these auto-generated __init__ methods. So for
   * now we'll generate them ourselves following the functionality of
   * @attr.s(kw_only=True) we'll only allow kw_args.
   */
  construct(indent: string, type: IType) {
    if (type instanceof EnumType) return ''
    indent = this.bumper(indent)
    const bump = this.bumper(indent)
    const annotations: string[] = []
    const args: string[] = []
    const inits: string[] = []
    this.typeProperties(type).forEach((prop) => {
      annotations.push(this.declareProperty(indent, prop, true))
      args.push(this.declareConstructorArg('', prop))
      inits.push(this.initArg(bump, prop))
    })
    let result = ''
    if (Object.values(type.properties).some(this.isBareForwardRef)) {
      result =
        `\n${indent}__annotations__ = {\n` +
        `${annotations.join(',\n')}` +
        `\n${indent}}`
    }
    result +=
      `\n\n${indent}def __init__(self, *${this.argDelimiter}` +
      `${args.join(this.argDelimiter)}):\n` +
      inits.join('\n')
    return result
  }

  declareConstructorArg(indent: string, property: IProperty) {
    const mappedType = this.typeMapModels(property.type)
    let propType: string
    if (property.required) {
      propType = mappedType.name
    } else {
      propType = `Optional[${mappedType.name}] = ${this.nullStr}`
    }
    let propName = property.name
    if (this.pythonKeywords.has(propName)) {
      propName = propName + '_'
    }
    return `${indent}${propName}: ${propType}`
  }

  // this is a builder function to produce arguments with optional null place holders but no extra required optional arguments
  argFill(current: string, args: string): string {
    if (!current && args.trim() === this.nullStr) {
      // Don't append trailing optional arguments if none have been set yet
      return ''
    }
    let delimiter = ',\n'
    if (!current) {
      delimiter = ''
      // Caller manually inserted delimiter followed by inline comment
    } else if (args.match(/, {2}#/)) {
      delimiter = delimiter.replace(',', '')
    }
    return `${args}${delimiter}${current}`
  }

  httpArgs(callerIndent: string, method: IMethod): string {
    const currIndent = this.bumper(callerIndent)
    let args = ''
    args = this.argFill(
      args,
      `${currIndent}transport_options=transport_options`
    )
    if (method.bodyArg) {
      args = this.argFill(args, `${currIndent}body=${method.bodyArg}`)
    }
    if (method.queryArgs.length) {
      const queryParams = this.argGroup('', method.queryArgs)
      args = this.argFill(args, `${currIndent}query_params=${queryParams}`)
    }
    let returnType = this.methodReturnType(method)
    if (method.responseIsBoth()) {
      // cattrs needs the python object Union[<rt>, bytes] in order
      // to properly deserialize the response. However, this argument
      // is passed as a value so we get a mypy error that the argument
      // has type "object" instead of TStructure. Hence the # type: ignore
      returnType += ',  # type: ignore'
    }
    args = this.argFill(args, `${currIndent}structure=${returnType}`)
    let endpoint = `"${method.endpoint}"`
    if (/\{\w+\}/.test(endpoint)) {
      // avoid flake8: f-string is missing placeholders
      endpoint = `f${endpoint}`
    }
    args = this.argFill(args, `${currIndent}path=${endpoint}`)
    return args
  }

  httpCall(callerIndent: string, method: IMethod): string {
    // callOpener itself is nested inside a cast()
    const currIndent = this.bumper(callerIndent)
    let deprecation = ''
    if (method.name === 'login_user') {
      deprecation =
        `${callerIndent}warnings.warn("login_user behavior changed significantly ` +
        `in 21.4.0. See https://git.io/JOtH1")\n`
    }
    const callOpener =
      `${callerIndent}response = cast(\n` +
      `${currIndent}${this.methodReturnType(method)},\n` +
      `${currIndent}${this.it(method.httpMethod.toLowerCase())}(\n`
    const callArgs = `${this.httpArgs(currIndent, method)}\n`
    const callCloser = `${currIndent})\n${callerIndent})\n`
    const returnStmt = `${callerIndent}return response`
    return deprecation + callOpener + callArgs + callCloser + returnStmt
  }

  encodePathParams(indent: string, method: IMethod) {
    let encodings = ''
    const pathParams = method.pathParams
    if (pathParams.length > 0) {
      for (const param of pathParams) {
        if (param.doEncode()) {
          encodings += `${indent}${param.name} = self.encode_path_param(${param.name})\n`
        }
      }
    }
    return encodings
  }

  declareMethod(indent: string, method: IMethod) {
    const bump = this.bumper(indent)

    return (
      this.methodSignature(indent, method) +
      this.summary(bump, method.summary) +
      this.encodePathParams(bump, method) +
      this.httpCall(bump, method)
    )
  }

  typeSignature(indent: string, type: IType) {
    const bump = this.bumper(indent)
    const b2 = this.bumper(bump)
    const attrs: string[] = []
    const isEnum = type instanceof EnumType
    const baseClass = isEnum ? 'enum.Enum' : 'model.Model'
    let usesReservedPythonKeyword = false

    if (!isEnum) {
      for (const prop of this.typeProperties(type)) {
        let propName = prop.name
        if (this.pythonKeywords.has(propName)) {
          propName = propName + '_'
          usesReservedPythonKeyword = true
        }
        let attr = `${b2}${propName}:`
        if (prop.description) {
          attr += ` ${prop.description}`
        }
        attrs.push(attr)
      }
    }

    if (usesReservedPythonKeyword) {
      this.hooks.push(
        `sr.converter${this.apiRef}.register_structure_hook(\n${bump}${type.name},  # type: ignore\n${bump}${this.structureHookTK}  # type:ignore\n)`
      )
    }

    let result =
      `\n` +
      (isEnum ? '' : `${indent}@attr.s(auto_attribs=True, init=False)\n`) +
      `${indent}class ${type.name}(${baseClass}):\n` +
      `${bump}"""\n` +
      (type.description ? `${bump}${type.description}\n\n` : '')

    if (attrs.length > 0) {
      result += `${bump}Attributes:\n` + `${attrs.join('\n')}\n`
    }

    return result + `${bump}"""\n`
  }

  summary(indent: string, text: string | undefined) {
    return text ? `${indent}"""${text}"""\n` : ''
  }

  // when format is "methods" that means we're in the methods.py module
  // and we need to reference the type by the `mdls.` package name
  prefixModelsNamespace(
    name: string,
    format: 'models' | 'methods',
    forwardRef = false
  ): string {
    if (format === 'models') {
      // need to quote this forwardRef
      name = forwardRef ? `"${name}"` : name
    } else if (format === 'methods') {
      name = `mdls.${name}`
    }
    return name
  }

  // hack default format to 'methods' so that argValue() calls the right thing
  typeMap(type: IType, format: 'models' | 'methods' = 'methods'): IMappedType {
    const asString: CodeAssignment = (_, v) => `"${v}"`
    const pythonTypes: Record<string, IMappedType> = {
      any: { default: this.nullStr, name: 'Any' },
      boolean: { default: this.nullStr, name: 'bool' },
      byte: { default: this.nullStr, name: 'bytes' },
      datetime: { default: this.nullStr, name: 'datetime.datetime' },
      double: { default: this.nullStr, name: 'float' },
      float: { default: this.nullStr, name: 'float' },
      int32: { default: this.nullStr, name: 'int' },
      int64: { default: this.nullStr, name: 'int' },
      integer: { default: this.nullStr, name: 'int' },
      number: { default: this.nullStr, name: 'float' },
      password: { default: this.nullStr, name: 'str', asVal: asString },
      string: { default: this.nullStr, name: 'str', asVal: asString },
      object: { default: this.nullStr, name: 'str', asVal: asString },
      uri: { default: this.nullStr, name: 'str', asVal: asString },
      void: { default: this.nullStr, name: 'None' },
    }

    super.typeMap(type)
    if (type.elementType) {
      const map = this.typeMap(type.elementType, format)
      let typeName: string
      let name: string
      const defaultValue = this.nullStr
      let asVal: CodeAssignment | undefined
      switch (type.className) {
        case 'ArrayType':
          typeName = 'Sequence'
          name = `${typeName}[${map.name}]`
          break
        case 'HashType':
          typeName = 'MutableMapping'
          // TODO fix bad API spec, like MergeQuery vis_config
          name =
            typeName +
            '[str, ' +
            (type.elementType.name === 'string' ? 'Any' : map.name) +
            ']'
          break
        case 'DelimArrayType':
          typeName = this.prefixModelsNamespace('DelimSequence', format)
          name = `${typeName}[${map.name}]`
          asVal = (_, v) => `${typeName}([${v}])`
          break
        case 'EnumType':
          name = typeName = this.prefixModelsNamespace(type.name, format, true)
          asVal = (_, v) => `${typeName}.${v}`
          break
        default:
          throw new Error(`Don't know how to handle: ${JSON.stringify(type)}`)
      }
      const mt: IMappedType = { default: defaultValue, name: name }
      if (asVal) {
        mt.asVal = asVal
      }
      return mt
    }
    if (!type.name) {
      throw new Error('Cannot output a nameless type.')
    }
    const name = this.prefixModelsNamespace(
      type.name,
      format,
      !!type.customType
    )
    const result = pythonTypes[type.name]
    return result || { default: this.nullStr, name: name }
  }

  typeMapMethods(type: IType) {
    return this.typeMap(type, 'methods')
  }

  typeMapModels(type: IType) {
    return this.typeMap(type, 'models')
  }
}
