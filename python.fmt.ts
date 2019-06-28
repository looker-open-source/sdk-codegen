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

export class PythonFormatter extends CodeFormatter {
  codePath = './python/'
  itself = 'self'
  fileExtension = '.py'
  commentStr = '# '
  nullStr = 'None'

  argDelimiter = ', '
  paramDelimiter = ',\n'
  propDelimiter = '\n'

  indentStr = '  '
  endTypeStr = ''

  methodsPrologue = `
# ${warnEditing}
# import json
from typing import *
from models import *
from rtl.api_settings import ApiSettings
from rtl.user_session import UserSession
from rtl.sdk_base import SDKBase
# from rtl.sdk_error import SDKError
# from rtl.sdk_utils import *

class LookerSDK(SDKBase):        
`
  methodsEpilogue = ''
  modelsPrologue = `
# ${warnEditing}
import attr
from typing import *
`
  modelsEpilogue = ''


  // @ts-ignore
  argGroup = (indent: string, args: Arg[]) => args && args.length !== 0 ? `\n${indent}[${args.join(this.argDelimiter)}]` : this.nullStr
  // @ts-ignore
  argList = (indent: string, args: Arg[]) => args && args.length !== 0 ? `\n${indent}${args.join(this.argDelimiter)}` : this.nullStr

  // declareProperty = (indent: string, property: IProperty) => {
  //   const bump = indent + this.indentStr
  //   const p = property.name
  //   const t = this.typeMap(property.type)
  //   return `${indent}def set_${p}(self) -> ${t}:\n` +
  //     `${bump}return self._${p}\n\n` +
  //     `${indent}def get_${p}(self, value: ${t}):\n` +
  //     `${bump}self._${p} = value\n\n` +
  //     `${indent}${p} = property(set_${p}, get_${p}, None, "${property.description}")\n`
  // }

  declareProperty = (indent: string, property: IProperty) => {
    const type = this.typeMap(property.type)
    return this.commentHeader(indent, property.description)
      + `${indent}${property.name}: ${type.name} = ${type.default}`
  }

  methodSignature = (indent: string, method: IMethod) => {
    const type = this.typeMap(method.type)
    let bump = indent + this.indentStr
    let params: string[] = []
    if (method.params) method.params.forEach(p => params.push(this.declareParameter(bump, p)))
    return this.commentHeader(indent, `${method.httpMethod} ${method.endpoint}`)
      + `${indent}def ${method.name}(self,\n${params.join(this.paramDelimiter)}) -> ${type.name}:\n`
  }

  declareParameter = (indent: string, param: IParameter) => {
    const type = this.typeMap(param.type)
    return this.commentHeader(indent, param.description)
      + `${indent}${param.name}: ${type.name}`
      + (param.required ? '' : ` = ${type.default}`)
  }

  declareMethod = (indent: string, method: IMethod) => {
    const bump = this.bumper(indent)
    return this.methodSignature(indent, method)
      + this.summary(bump, method.summary)
      + this.httpCall(bump, method)
  }

  typeSignature = (indent: string, type: IType) => {
    const bump = this.bumper(indent)
    const b2 = this.bumper(bump)
    const attrs: string[] = []
    Object.values(type.properties)
        .forEach((prop) => attrs.push(`${b2}${prop.name} : ${prop.description}`))

    return `${indent}@attr.s(auto_attribs=True)\n` +
        `${indent}class ${type.name}(object):\n` +
        `${bump}"""\n` +
        (type.description ? `${bump}${type.description}\n\n` : '') +
        `${bump}Attributes:\n` +
        `${attrs.join("\n")}\n` +
        `${bump}"""\n`
  }

  summary = (indent: string, text: string | undefined) => text ? `${indent}"""${text}"""\n` : ''

  typeMap = (type: IType): IMappedType => {
    const pythonTypes: Record<string, IMappedType> = {
      'number': { name: 'double', default: '0.0' },
      'integer': { name: 'int', default: '0' },
      'int32': { name: 'int', default: '0' },
      'int64': { name: 'long', default: '0' },
      'string': { name: 'str', default: '""' },
      'password': {name: 'Password', default: this.nullStr},
      'byte': {name: 'binary', default: this.nullStr}
    }

    if (type.elementType) {
      const map  = this.typeMap(type.elementType)
      // provisional typed list new in Python 3.5
      // https://docs.python.org/3/library/typing.html
      return {name: `List[${map.name}]`, default: 'attr.ib(factory=list)'}
    }

    if (type.name) {
      return pythonTypes[type.name] || {name: type.name, default: this.nullStr }
    } else {
      throw new Error('Cannot output a nameless type.')
    }
  }
}
