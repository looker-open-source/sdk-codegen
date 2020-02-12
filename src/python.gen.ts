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
  ArrayType, DelimArrayType,
  HashType,
  IMappedType,
  IMethod,
  IParameter,
  IProperty,
  IType,
  strBody,
} from './sdkModels'
import { CodeGen } from './codeGen'
import * as fs from 'fs'
import { run, warn, isDirSync, isFileSync, success, readFileSync } from './utils'
import { utf8 } from '../typescript/looker/rtl/constants'

export class PythonGen extends CodeGen {
  methodInputModelTypes: Set<IType> = new Set()
  codePath = './python/'
  packagePath = 'looker_sdk'
  itself = 'self'
  fileExtension = '.py'
  commentStr = '# '
  nullStr = 'None'

  indentStr = '    '
  argDelimiter = `,\n${this.indentStr.repeat(3)}`
  paramDelimiter = ',\n'
  propDelimiter = '\n'
  dataStructureDelimiter = ', '

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
    'float': {name: 'float', default: this.nullStr},
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
  // cattrs [un]structure hooks for model [de]serialization
  hooks: string[] = []
  structureHook: string = 'structure_hook'
  pythonReservedKeywordClasses: Set<String> = new Set()

  // @ts-ignore
  methodsPrologue = (indent: string) => `
# ${this.warnEditing()}
import datetime
from typing import MutableMapping, Optional, Sequence, Union

from . import models
from ${this.packagePath}.rtl import api_methods
from ${this.packagePath}.rtl import transport

class ${this.packageName}(api_methods.APIMethods):
`

  // @ts-ignore
  methodsEpilogue = (indent: string) => this.apiVersion === '3.1' ? `LookerSDK = ${this.packageName}` : ''

  // @ts-ignore
  modelsPrologue = (indent: string) => `
# ${this.warnEditing()}
import datetime
from typing import MutableMapping, Optional, Sequence

import attr
import cattr

from ${this.packagePath}.rtl import model
from ${this.packagePath}.rtl import serialize as sr

EXPLICIT_NULL = model.EXPLICIT_NULL  # type: ignore
DelimSequence = model.DelimSequence
`

  // @ts-ignore
  modelsEpilogue = (indent: string) => `

# The following cattrs structure hook registrations are a workaround
# for https://github.com/Tinche/cattrs/pull/42 Once this issue is resolved
# these calls will be removed.

import functools  # noqa:E402
from typing import ForwardRef  # type: ignore  # noqa:E402

${this.structureHook} = functools.partial(sr.structure_hook, globals(), sr.converter${this.apiRef})
${this.hooks.join('\n')}
`

  sdkPathPrep() {
    const path = `${this.codePath}${this.packagePath}/sdk/api${this.apiRef}`
    if (!isDirSync(path)) fs.mkdirSync(path, {recursive: true})
    fs.writeFileSync(`${path}/__init__.py`, '# Generated file.')
  }

  sdkFileName(baseFileName: string) {
    return this.fileName(`sdk/api${this.apiRef}/${baseFileName}`)
  }

  // @ts-ignore
  argGroup(indent: string, args: Arg[]) {
    if ((!args) || args.length === 0) return this.nullStr
    let hash: string[] = []
    for (let arg of args) {
      hash.push(`"${arg}": ${arg}`)
    }
    return `{${hash.join(this.dataStructureDelimiter)}}`
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
    const mappedType = this.typeMapModels(property.type)
    let propName = property.name
    if (this.pythonKeywords.includes(propName)) {
      propName = propName + '_'
    }
    let propType = mappedType.name
    if (!property.required) {
      propType = `Optional[${mappedType.name}] = ${this.nullStr}`
    }
    const propDef = `${indent}${propName}: ${propType}`
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
  // they are for Typescript
  methodSignature(indent: string, method: IMethod) {
    const returnType = this.methodReturnType(method)
    const bump = this.bumper(indent)
    let params: string[] = []
    const args = method.allParams
    if (args && args.length > 0) {
      method.allParams.forEach(p => params.push(this.declareParameter(bump, p)))
    }
    let head = method.description?.trim()
    head = (head ? `${head}\n\n` : '') + `${method.httpMethod} ${method.endpoint} -> ${returnType}`
    params.push(`${bump}transport_options: Optional[transport.PTransportSettings] = None,`)
    return this.commentHeader(indent, head)
      + `${indent}def ${method.name}(\n`
      + `${bump}self${params.length > 0 ? ',\n' : ''}`
      + `${params.join(this.paramDelimiter)}\n`
      + `${indent}) -> ${returnType}:\n`
  }

  private addMethodInputModelType(type: IType) {
    this.methodInputModelTypes.add(type)
    for (const prop of Object.values(type.properties)) {
      if (prop.type.elementType) {
        this.addMethodInputModelType(prop.type.elementType)
      }
    }
  }

  declareParameter(indent: string, param: IParameter) {
    let type: IType
    if (param.location === strBody) {
      type = this.writeableType(param.type) || param.type
      this.addMethodInputModelType(type)
    } else {
      type = param.type
    }
    const mapped = this.typeMapMethods(type)
    const paramType = (param.required ? mapped.name : `Optional[${mapped.name}]`)
    return this.commentHeader(indent, param.description)
      + `${indent}${param.name}: ${paramType}`
      + (param.required ? '' : ` = ${mapped.default}`)
  }

  initArg(indent: string, property: IProperty) {
    return `${indent}self.${property.name} = ${property.name}`
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
    // Skip read-only parameters
    if (!this.methodInputModelTypes.has(type)) return ''
    indent = this.bumper(indent)
    const bump = this.bumper(indent)
    let result = `\n\n${indent}def __init__(self, *${this.argDelimiter}`
    let args: string[] = []
    let inits: string[] = []
    Object.values(type.properties)
      .forEach((prop) => {
        args.push(this.declareConstructorArg('', prop))
        inits.push(this.initArg(bump, prop))
      })
    result += `${args.join(this.argDelimiter)}):\n`
      + inits.join('\n')
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
    return `${indent}${property.name}: ${propType}`
  }

  // this is a builder function to produce arguments with optional null place holders but no extra required optional arguments
  argFill(current: string, args: string) {
    if ((!current) && args.trim() === this.nullStr) {
      // Don't append trailing optional arguments if none have been set yet
      return ''
    }
    let delimiter = this.argDelimiter
    if (!current) {
      delimiter = ''
    // Caller manually inserted delimiter followed by inline comment
    } else if (args.match(/, {2}#/)) {
      delimiter = this.argDelimiter.replace(',', '')
    }
    return `${args}${delimiter}${current}`
  }

  httpArgs(indent: string, method: IMethod) {
    let result = this.argFill('', this.argGroup(indent, method.cookieArgs))
    result = this.argFill(result, this.argGroup(indent, method.headerArgs))
    result = this.argFill(result, `transport_options=transport_options`)
    if (method.bodyArg) {
      result = this.argFill(result, `body=${method.bodyArg}`)
    }
    if (method.queryArgs.length) {
      const queryParams = this.argGroup(indent, method.queryArgs)
      result = this.argFill(result, `query_params=${queryParams}`)
    }
    const type = this.typeMapMethods(method.type)
    let returnType = this.methodReturnType(method)
    if (returnType === `Union[${type.name}, bytes]`) {
      returnType = `${returnType},  # type: ignore`
    }
    result = this.argFill(result, returnType)
    result = this.argFill(result, `f"${method.endpoint}"`)
    return result
  }

  httpCall(indent: string, method: IMethod) {
    const bump = indent + this.indentStr
    const args = this.httpArgs(bump, method)
    const methodCall = `${indent}response = ${this.it(method.httpMethod.toLowerCase())}`
    let assertTypeName = this.methodReturnType(method)
    if (method.type instanceof ArrayType) {
      assertTypeName = 'list'
    } else if (method.type instanceof HashType) {
      assertTypeName = 'dict'
    } else if (assertTypeName === 'Union[str, bytes]') {
      assertTypeName = '(str, bytes)'
    }
    let assertion = `${indent}assert `
    if (assertTypeName === this.nullStr) {
      assertion += `response is ${this.nullStr}`
    } else {
      assertion += `isinstance(response, ${assertTypeName})`
    }
    const returnStmt = `${indent}return response`
    return `${methodCall}(\n`
      + `${bump.repeat(3)}${args}\n`
      + `${indent})\n`
      + `${assertion}\n`
      + `${returnStmt}`
  }

  bodyParamsTypeAssertions(indent: string, bodyParams: IParameter[]): string {
    const bump = indent + this.indentStr
    let assertions: string = ''
    if (bodyParams.length > 0) {
      for (const param of bodyParams) {
        if (param.location === strBody) {
          let conditionStr = param.required ? '' : `${indent}if ${param.name}:\n${bump}`
          let type = this.writeableType(param.type) || param.type
          let bodyType = this.typeMapMethods(type).name
          if (bodyType.startsWith('Sequence')) {
            bodyType = "Sequence"
          } else if (bodyType.startsWith('MutableMapping')) {
            bodyType = "MutableMapping"
          } else if (bodyType.startsWith("models.DelimSequence")) {
            bodyType = "models.DelimSequence"
          }
          assertions += (`${conditionStr}${indent}assert isinstance(${param.name}, ${bodyType})`)
        }
      }
      assertions += "\n"
    }
    return assertions
  }

  declareMethod(indent: string, method: IMethod) {
    const bump = this.bumper(indent)

    // APIMethods/AuthSession handle auth
    if (method.name === 'login') {
      return `${indent}# login() using api3credentials is automated in the client`
    } else if (method.name === 'login_user') {
      return `${indent}def login_user(self, user_id: int) -> api_methods.APIMethods:\n${bump}return super().login_user(user_id)`
    } else if (method.name === 'logout') {
      return `${indent}def logout(self) -> None:\n${bump}super().logout()`
    }

    return this.methodSignature(indent, method)
      + this.summary(bump, method.summary)
      + this.bodyParamsTypeAssertions(bump, method.bodyParams)
      + this.httpCall(bump, method)
  }

  typeSignature(indent: string, type: IType) {
    const bump = this.bumper(indent)
    const b2 = this.bumper(bump)
    const attrs: string[] = []
    let usesReservedPythonKeyword = false
    for (const prop of Object.values(type.properties)) {
      let propName = prop.name
      if (this.pythonKeywords.includes(propName)) {
        propName = propName + '_'
        usesReservedPythonKeyword = true
      }
      let attr = `${b2}${propName}:`
      if (prop.description) {
        attr += ` ${prop.description}`
      }
      attrs.push(attr)
    }

    let attrsArgs = 'auto_attribs=True, kw_only=True'
    if (this.methodInputModelTypes.has(type)) {
      attrsArgs += ', init=False'
    }

    const forwardRef = `ForwardRef("${type.name}")`
    this.hooks.push(
      `sr.converter${this.apiRef}.register_structure_hook(\n${bump}${forwardRef},  # type: ignore\n${bump}${this.structureHook}  # type:ignore\n)`
    )
    if (usesReservedPythonKeyword) {
      this.hooks.push(
        `sr.converter${this.apiRef}.register_structure_hook(\n${bump}${type.name},  # type: ignore\n${bump}${this.structureHook}  # type:ignore\n)`
      )

    }
    return `\n` +
      `${indent}@attr.s(${attrsArgs})\n` +
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

  versionStamp() {
    if (this.versions) {
      const stampFile = this.fileName('rtl/constants')
      if (!isFileSync(stampFile)) {
        warn(`${stampFile} was not found. Skipping version update.`)
      }
      let content = readFileSync(stampFile)
      const lookerPattern = /looker_version = ['"].*['"]/i
      const apiPattern = /api_version = ['"].*['"]/i
      const envPattern = /environment_prefix = ['"].*['"]/i
      content = content.replace(lookerPattern, `looker_version = "${this.versions.lookerVersion}"`)
      content = content.replace(apiPattern, `api_version = "${this.versions.apiVersion}"`)
      content = content.replace(envPattern, `environment_prefix = "${this.environmentPrefix}"`)
      fs.writeFileSync(stampFile, content, {encoding: utf8})
      success(`updated ${stampFile} to ${this.versions.apiVersion}.${this.versions.lookerVersion}` )
    } else {
      warn('Version information was not retrieved. Skipping SDK version updating.')
    }
    return this.versions
  }

  _typeMap(type: IType, format: 'models' | 'methods'): IMappedType {
    super.typeMap(type)
    if (type.elementType) {
      const map = this._typeMap(type.elementType, format)
      if (type instanceof ArrayType) {
        return {name: `Sequence[${map.name}]`, default: this.nullStr}
      } else if (type instanceof HashType) {
        return {name: `MutableMapping[str, ${map.name}]`, default: this.nullStr}
      } else if (type instanceof DelimArrayType) {
        return {name: `models.DelimSequence[${map.name}]`, default: this.nullStr}
      }
      throw new Error(`Don't know how to handle: ${JSON.stringify(type)}`)
    }
    if (type.name) {
      let name: string
      if (format === 'models') {
        name = `"${type.name}"`
      } else if (format === 'methods') {
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
        run('pipenv', ['run', 'black', fileName])
      }
    }
    return ''
  }

}
