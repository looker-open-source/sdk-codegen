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

// Python codeFormatter

import {Arg, IMappedType, IMethod, IParameter, IProperty, IType, strBody} from "./sdkModels"
import {CodeFormatter, warnEditing} from "./codeFormatter"

export class PythonFormatter extends CodeFormatter {
  codePath = './python/'
  package = 'looker'
  itself = 'self'
  fileExtension = '.py'
  commentStr = '# '
  nullStr = 'None'

  argDelimiter = ', '
  paramDelimiter = ',\n'
  propDelimiter = '\n'

  indentStr = '    '
  endTypeStr = ''

  // keyword.kwlist
  pythonKeywords = [
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
    'yield'
  ]
  pythonTypes: Record<string, IMappedType> = {
    'number': { name: 'float', default: this.nullStr },
    'double': { name: 'float', default: this.nullStr },
    'integer': { name: 'int', default: this.nullStr },
    'int32': { name: 'int', default: this.nullStr },
    'int64': { name: 'int', default: this.nullStr },
    'string': { name: 'str', default: this.nullStr },
    'password': {name: 'str', default: this.nullStr },
    'byte': {name: 'bytes', default: this.nullStr },
    'boolean': {name: 'bool', default: this.nullStr },
    'void': {name: 'None', default: this.nullStr },
    'uri': {name: 'str', default: this.nullStr },
    'datetime': {name: 'datetime.datetime', default: this.nullStr }
  }

  // Classes requiring custom structure/unstructure
  reservedKeywordHooks: string[] = [
    `\n\n# Custom converters for reserved keyword attribute classes`
  ]
  forwardRefHooks: string[] = [
    `\n\n# Custom hooks for type induced forward references\n` +
    `from typing import ForwardRef  # type: ignore  # noqa:E402\n`
  ]

  // @ts-ignore
  methodsPrologue = (indent: string) => `
# ${warnEditing}
import datetime
from typing import Optional, Sequence

from looker.sdk import models
from looker.rtl import api_methods


class LookerSDK(api_methods.APIMethods):
`
  // @ts-ignore
  methodsEpilogue = (indent: string) => ''
  // @ts-ignore
  modelsPrologue = (indent: string) => `
# ${warnEditing}
import datetime
from typing import Optional, Sequence

import attr
import cattr

from looker.rtl import model
from looker.rtl import serialize as sr
`
  // @ts-ignore
  modelsEpilogue = (indent: string) => {
    return this.forwardRefHooks.join('\n') + this.reservedKeywordHooks.join('\n')
  }

  // @ts-ignore
  argGroup(indent: string, args: Arg[]) {
    if ((!args) || args.length === 0) return this.nullStr
    let hash: string[] = []
    for (let arg of args) {
      hash.push(`"${arg}": ${arg}`)
    }
    return `{${hash.join(this.argDelimiter)}}`
  }

  // @ts-ignore
  createRequester(indent: string, method: IMethod) {
    return ''
  }

  // @ts-ignore
  argList(indent: string, args: Arg[]) {
    return args && args.length !== 0
          ? `\n${indent}${args.join(this.argDelimiter)}`
          : this.nullStr
  }

  declareProperty(indent: string, property: IProperty) {
    const propType = this.typeMapModels(property.type)
    let propName = property.name
    if (this.pythonKeywords.includes(propName)) {
      propName = propName + '_'
    }
    const propTypeNameAndDefault = `Optional[${propType.name}] = ${propType.default}`
    const propDef = `${indent}${propName}: ${propTypeNameAndDefault}`
    return this.commentHeader(indent, property.description) + propDef
  }

  // because Python has named default parameters
  methodSignature(indent: string, method: IMethod) {
    const type = this.typeMapMethods(method.type)
    const bump = this.bumper(indent)
    let params: string[] = []
    const args = method.allParams
    if (args && args.length > 0) method.allParams.forEach(p => params.push(this.declareParameter(bump, p)))
    return this.commentHeader(indent, `${method.httpMethod} ${method.endpoint} -> ${type.name}`)
      + `${indent}def ${method.name}(\n${bump}self${params.length > 0?",\n":''}${params.join(this.paramDelimiter)}\n${indent}) -> ${type.name}:\n`
  }

  declareParameter(indent: string, param: IParameter) {
    let type = (param.location === strBody)
      ? this.writeableType(param.type) || param.type
      : param.type
    const mapped = this.typeMapMethods(type)
    const paramType = (param.required ? mapped.name : `Optional[${mapped.name}]`)
    return this.commentHeader(indent, param.description)
      + `${indent}${param.name}: ${paramType}`
      + (param.required ? '' : ` = ${mapped.default}`)
  }

  initArg(indent: string, property: IProperty) {
    let bump = this.bumper(indent)
    let assign = `${this.it('_' + property.name)} = ${property.name}\n`
    if (property.nullable) {
      return `${indent}if ${property.name} is not None:\n` +
          `${bump}${assign}`
    }
    return assign
  }

  // Omit read-only parameters
  construct(indent: string, properties: Record<string, IProperty>) {
    indent = this.bumper(indent)
    const bump = this.bumper(indent)
    let result = `${indent}def __init__(self, `
    let args: string[] = []
    let inits: string[] = []
    Object.values(properties)
    // .filter((prop) => !prop.readOnly)
        .forEach((prop) => {
          args.push(this.declareConstructorArg('', prop))
          inits.push(this.initArg(bump, prop))
        })
    result += `${args.join(this.argDelimiter)}):\n`
        + inits.join('\n')
    return result + "\n"
  }

  httpArgs(indent: string, method: IMethod) {
      let result = this.argFill('', this.argGroup(indent, method.cookieArgs))
      result = this.argFill(result, this.argGroup(indent, method.headerArgs))
      if (method.bodyArg) {
        result = this.argFill(result, `body=${method.bodyArg}`)
      }
      if (method.queryArgs.length) {
        const queryParams = this.argGroup(indent, method.queryArgs)
        result = this.argFill(result, `query_params=${queryParams}`)
      }
      const type = this.typeMapMethods(method.type)
      result = this.argFill(result, type.name)
      return result
  }

  httpCall(indent: string, method: IMethod) {
      const bump = indent + this.indentStr
      const args = this.httpArgs(bump, method)
      const methodCall = `${indent}response = ${this.it(method.httpMethod.toLowerCase())}`
      const callArgs = `f"${method.endpoint}"${args ? ", " +args: ""}`
      let type = this.typeMapMethods(method.type).name
      if (type.startsWith('Sequence')) {
        type = 'list'
      }
      let assertion = `${indent}assert `
      if (type == this.nullStr) {
        assertion += `response is ${this.nullStr}`
      } else {
        assertion += `isinstance(response, ${type})`
      }
      const returnStmt = `${indent}return response`
      return `${methodCall}(${callArgs})\n${assertion}\n${returnStmt}`
  }

  declareMethod(indent: string, method: IMethod) {
    const bump = this.bumper(indent)
    return this.methodSignature(indent, method)
      + this.summary(bump, method.summary)
      + this.httpCall(bump, method)
  }

  typeSignature(indent: string, type: IType) {
    const bump = this.bumper(indent)
    const b2 = this.bumper(bump)
    const attrs: string[] = []
    let hasReservedWord = false
    for (const prop of Object.values(type.properties)) {
      let propName = prop.name
      if (this.pythonKeywords.includes(propName)) {
        propName = propName + '_'
        hasReservedWord = true
      }
      let attr = `${b2}${propName} :`
      if (prop.description) {
        attr += ` ${prop.description}`
      }
      attrs.push(attr)
    }

    if (hasReservedWord) {
      this.reservedKeywordHooks.push(
        `cattr.register_structure_hook(${type.name}, sr.keyword_field_structure_hook)  # type: ignore`,
        `cattr.register_unstructure_hook(${type.name}, sr.keyword_field_unstructure_hook)  # type: ignore\n`)
    }
    const refHandler = `lambda data, _: cattr.structure_attrs_fromdict(data, ${type.name})`
    const register = `cattr.register_structure_hook(ForwardRef("${type.name}"), ${refHandler})  # type: ignore`
    this.forwardRefHooks.push(register)
    return `\n` +
        `${indent}@attr.s(auto_attribs=True, kw_only=True)\n` +  // TODO: make "response" types frozen while "write" types are mutable
        `${indent}class ${type.name}(model.Model):\n` +
        `${bump}"""\n` +
        (type.description ? `${bump}${type.description}\n\n` : '') +
        `${bump}Attributes:\n` +
        `${attrs.join("\n")}\n` +
        `${bump}"""\n`
  }

  summary(indent: string, text: string | undefined){
    return text ? `${indent}"""${text}"""\n` : ''
  }

  _typeMap(type: IType, format: 'models' | 'methods'): IMappedType {
    super.typeMap(type)
    if (type.elementType) {
      const map  = this._typeMap(type.elementType, format)
      return {name: `Sequence[${map.name}]`, default: this.nullStr}
    }
    if (type.name) {
      let name: string
      if (format == 'models') {
        name = `"${type.name}"`
      } else if (format == 'methods') {
        name = `models.${type.name}`
      } else {
        throw new Error('format must be "models" or "methods"')
      }
      return this.pythonTypes[type.name] || {name: name, default: this.nullStr }
    } else {
      throw new Error('Cannot output a nameless type.')
    }
  }

  typeMapMethods(type: IType) {
    return this._typeMap(type, 'methods')
  }

  typeMapModels(type: IType) {
    return this._typeMap(type, 'models')
  }
}
