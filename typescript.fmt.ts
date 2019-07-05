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

import {Arg, IMappedType, IMethod, IParameter, IProperty, IType} from "./sdkModels"
import {CodeFormatter, warnEditing} from "./codeFormatter"

export class TypescriptFormatter extends CodeFormatter {
  codePath = './typescript/'
  package = 'looker'
  itself = 'this'
  fileExtension = '.ts'
  commentStr = '// '
  nullStr = 'null'
  transport = 'transport'

  argDelimiter = ', '
  paramDelimiter = ',\n'
  propDelimiter = '\n'

  indentStr = '  '
  endTypeStr = '\n}'

  methodsPrologue = `
// ${warnEditing}
import { APIMethods } from '../rtl/api_methods'
import { SDKResponse, Transport } from '../rtl/transport'
import { ${this.typeNames().join(', ')} } from './models'

export class LookerSDK extends APIMethods {
`
  methodsEpilogue = '\n}'

  modelsPrologue = `
// ${warnEditing}

import { URL } from 'url'
`
  modelsEpilogue = ''

  // @ts-ignore
  argGroup = (indent: string, args: Arg[]) => {
    if ((!args) || args.length === 0) return this.nullStr
    let hash: string[] = []
    for (let arg of args) {
      hash.push(`${arg}`)
    }
    return `\n${indent}{${hash.join(this.argDelimiter)}}`
  }

  // @ts-ignore
  argList = (indent: string, args: Arg[]) =>
      args && args.length !== 0
          ? `\n${indent}${args.join(this.argDelimiter)}`
          : this.nullStr

  declareProperty = (indent: string, property: IProperty) => {
    const type = this.typeMap(property.type)
    return this.commentHeader(indent, property.description)
      + `${indent}${property.name}: ${type.name}`
  }

  methodSignature = (indent: string, method: IMethod) => {
    const type = this.typeMap(method.type)
    let bump = indent + this.indentStr
    let params: string[] = []
    if (method.params) method.params.forEach(p => params.push(this.declareParameter(bump, p)))
    return this.commentHeader(indent, `${method.httpMethod} ${method.endpoint}`)
      + `${indent}async ${method.name}(\n${params.join(this.paramDelimiter)}) : Promise<${type.name}> {\n`
  }

  declareParameter = (indent: string, param: IParameter) => {
    const type = this.typeMap(param.type)
    return this.commentHeader(indent, param.description)
      + `${indent}${param.name}: ${type.name}`
      + (param.required ? '' : (type.default ? ` = ${type.default}` : ''))
  }

  declareMethod = (indent: string, method: IMethod) => {
    const bump = this.bumper(indent)
    return this.methodSignature(indent, method)
      + this.httpCall(bump, method)
      + `\n${indent}}`
  }

  typeSignature = (indent: string, type: IType) => {
    const bump = this.bumper(indent)
    const b2 = this.bumper(bump)
    const attrs: string[] = []
    Object.values(type.properties)
        .forEach((prop) => attrs.push(`${b2}${prop.name} : ${prop.description}`))

    return this.commentHeader(indent, type.description) +
      `${indent}export interface I${type.name}{\n`
  }

  httpCall = (indent: string, method: IMethod) => {
    const type = this.typeMap(method.type)
    const bump = indent + this.indentStr
    const args = this.httpArgs(bump, method)
    return `${indent}return ${this.it('ok')}(${this.it(method.httpMethod.toLowerCase())}<${type.name}, IError>("${method.endpoint}"${args ? ", " +args: ""}))`
  }

  summary = (indent: string, text: string | undefined) => this.commentHeader(indent, text)

  typeNames = () => {
    const names = super.typeNames()
    console.log({names})
    return names.map(n => `I${n}`)
  }

  typeMap = (type: IType): IMappedType => {
    const tsTypes: Record<string, IMappedType> = {
      'number': { name: 'number', default: '0.0' },
      'float': { name: 'number', default: '0.0' },
      'double': { name: 'number', default: '0.0' },
      'integer': { name: 'number', default: '0' },
      'int32': { name: 'number', default: '0' },
      'int64': { name: 'number', default: '0' },
      'string': { name: 'string', default: '""' },
      'password': {name: 'Password', default: this.nullStr},
      'byte': {name: 'binary', default: this.nullStr},
      'boolean': {name: 'boolean', default: ''},
      'uri': {name: 'URL', default: this.nullStr},
      'url': {name: 'URL', default: this.nullStr},
      'datetime': {name: 'Date', default: ''},
      'date': {name: 'Date', default: ''},
      'object': {name: 'any', default: ''},
      'void': {name: 'void', default: ''}
    }

    if (type.elementType) {
      const map  = this.typeMap(type.elementType)
      return {name: `${map.name}[]`, default: '[]'}
    }

    if (type.name) {
      return tsTypes[type.name] || {name: `I${type.name}`, default: this.nullStr }
    } else {
      throw new Error('Cannot output a nameless type.')
    }
  }
}
