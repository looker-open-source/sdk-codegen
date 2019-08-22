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

import {
  Arg,
  ArrayType,
  HashType,
  IMappedType,
  IMethod,
  IParameter,
  IProperty,
  IType,
  strBody,
  } from './sdkModels'
import { CodeFormatter, warnEditing } from './codeFormatter'
import { run } from './utils'

export class PythonFormatter extends CodeFormatter {
  codePath = './python/'
  packagePath = 'looker_sdk'
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
    'number': {name: 'float', default: this.nullStr},
    'double': {name: 'float', default: this.nullStr},
    'integer': {name: 'int', default: this.nullStr},
    'int32': {name: 'int', default: this.nullStr},
    'int64': {name: 'int', default: this.nullStr},
    'string': {name: 'str', default: this.nullStr},
    'password': {name: 'str', default: this.nullStr},
    'byte': {name: 'bytes', default: this.nullStr},
    'boolean': {name: 'bool', default: this.nullStr},
    'void': {name: 'None', default: this.nullStr},
    'uri': {name: 'str', default: this.nullStr},
    'datetime': {name: 'datetime.datetime', default: this.nullStr}
  }

  // @ts-ignore
  methodsPrologue = (indent: string) => `
# ${warnEditing}
import datetime
from typing import MutableMapping, Optional, Sequence

from ${this.packagePath}.sdk import models
from ${this.packagePath}.rtl import api_methods


class ${this.packageName}(api_methods.APIMethods):
`
  // @ts-ignore
  methodsEpilogue = (indent: string) => ''
  // @ts-ignore
  modelsPrologue = (indent: string) => `
# ${warnEditing}
import datetime
from typing import MutableMapping, Optional, Sequence

import attr
import cattr

from ${this.packagePath}.rtl import model
from ${this.packagePath}.rtl import serialize as sr

EXPLICIT_NULL = model.EXPLICIT_NULL  # type: ignore
`

  // cattrs [un]structure hooks for model [de]serialization
  hooks: string[] = []
  structure_hook: string = 'structure_hook'

  // @ts-ignore
  modelsEpilogue = (indent: string) => `

# The following cattrs structure hook registrations are a workaround
# for https://github.com/Tinche/cattrs/pull/42 Once this issue is resolved
# these calls will be removed.

import functools  # noqa:E402
from typing import ForwardRef  # type: ignore  # noqa:E402

${this.structure_hook} = functools.partial(sr.structure_hook, globals())  # type: ignore
${this.hooks.join('\n')}
`


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

  // because Python has named default parameters, Request types are not required like
  // they are for Typescript
  methodSignature(indent: string, method: IMethod) {
    const type = this.typeMapMethods(method.type)
    const bump = this.bumper(indent)
    let params: string[] = []
    const args = method.allParams
    if (args && args.length > 0) method.allParams.forEach(p => params.push(this.declareParameter(bump, p)))
    return this.commentHeader(indent, `${method.httpMethod} ${method.endpoint} -> ${type.name}`)
      + `${indent}def ${method.name}(\n${bump}self${params.length > 0 ? ',\n' : ''}${params.join(this.paramDelimiter)}\n${indent}) -> ${type.name}:\n`
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

  // Skip read-only parameters
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
    return result + '\n'
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
    const callArgs = `f"${method.endpoint}"${args ? ', ' + args : ''}`
    let assertTypeName = this.typeMapMethods(method.type).name
    if (method.type instanceof ArrayType) {
      assertTypeName = 'list'
    } else if (method.type instanceof HashType) {
      assertTypeName = 'dict'
    }
    let assertion = `${indent}assert `
    if (assertTypeName === this.nullStr) {
      assertion += `response is ${this.nullStr}`
    } else {
      assertion += `isinstance(response, ${assertTypeName})`
    }
    const returnStmt = `${indent}return response`
    return `${methodCall}(${callArgs})\n${assertion}\n${returnStmt}`
  }

  declareMethod(indent: string, method: IMethod) {
    const bump = this.bumper(indent)

    // APIMethods/UserSession handle auth
    if (method.name === 'login') {
      return `${indent}# login() using api3credentials is automated in the client`
    } else if (method.name === 'login_user') {
      return `${indent}def login_user(self, user_id: int) -> api_methods.APIMethods:\n${bump}return super().login_user(user_id)`
    } else if (method.name === 'logout') {
      return `${indent}def logout(self) -> None:\n${bump}super().logout()`
    }

    return this.methodSignature(indent, method)
      + this.summary(bump, method.summary)
      + this.httpCall(bump, method)
  }

  typeSignature(indent: string, type: IType) {
    const bump = this.bumper(indent)
    const b2 = this.bumper(bump)
    const attrs: string[] = []
    for (const prop of Object.values(type.properties)) {
      let propName = prop.name
      if (this.pythonKeywords.includes(propName)) {
        propName = propName + '_'
      }
      let attr = `${b2}${propName} :`
      if (prop.description) {
        attr += ` ${prop.description}`
      }
      attrs.push(attr)
    }

    const forwardRef = `ForwardRef("${type.name}")`
    this.hooks.push(
      `cattr.register_structure_hook(\n${bump}${forwardRef},  # type: ignore\n${bump}${this.structure_hook}  # type:ignore\n)`
    )
    return `\n` +
      `${indent}@attr.s(auto_attribs=True, kw_only=True)\n` +  // TODO: make "response" types frozen while "write" types are mutable
      `${indent}class ${type.name}(model.Model):\n` +
      `${bump}"""\n` +
      (type.description ? `${bump}${type.description}\n\n` : '') +
      `${bump}Attributes:\n` +
      `${attrs.join('\n')}\n` +
      `${bump}"""\n`
  }

  summary(indent: string, text: string | undefined) {
    return text ? `${indent}"""${text}"""\n` : ''
  }

  _typeMap(type: IType, format: 'models' | 'methods'): IMappedType {
    super.typeMap(type)
    if (type.elementType) {
      const map = this._typeMap(type.elementType, format)
      if (type instanceof ArrayType) {
        return {name: `Sequence[${map.name}]`, default: this.nullStr}
      } else if (type instanceof HashType) {
        return {name: `MutableMapping[str, ${map.name}]`, default: this.nullStr}
      }
      throw new Error(`Don't know how to handle: ${JSON.stringify(type)}`)
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
      return this.pythonTypes[type.name] || {name: name, default: this.nullStr}
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

  // @ts-ignore
  reformatFile(fileName: string) {
    const name = super.reformatFile(fileName)
    if (name) {
      const pipEnvExists = run('command', ['-v', 'pipenv'],
        `To reformat ${fileName}, please install pipenv: https://docs.pipenv.org/en/latest/install/#installing-pipenv`, true)
      if (pipEnvExists.includes('pipenv')) {
        // pipenv check completed without error
        run('pipenv', ['update'])
        run('pipenv',  ['run', 'black', `${this.codePath}/${this.packagePath}/sdk/`])
      }
    }
    return ''
  }

}
