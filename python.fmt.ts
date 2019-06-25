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

import {Arg, IMethod, IParameter, IProperty, IType} from "./sdkModels"
import {CodeFormatter} from "./codeFormatter"

export class PythonFormatter extends CodeFormatter {
  commentStr = '# '
  nullStr = 'None'

  argDelimiter = ', '
  paramDelimiter = ',\n'
  propDelimiter = ',\n'

  indentStr = '  '
  endTypeStr = ''

  // @ts-ignore
  argGroup = (indent: string, args: Arg[]) => args && args.length !== 0 ? `\n${indent}[${args.join(this.argDelimiter)}]` : this.nullStr
  // @ts-ignore
  argList = (indent: string, args: Arg[]) => args && args.length !== 0 ? `\n${indent}${args.join(this.argDelimiter)}` : this.nullStr

  declareProperty = (indent: string, property: IProperty) =>
      this.commentHeader(indent, property.description)
      + `${indent}${property.name} : ${property.type.name}`

  methodSignature = (indent: string, method: IMethod) => {
    let bump = indent + this.indentStr
    let params: string[] = []
    if (method.params) method.params.forEach(p => params.push(this.declareParameter(bump, p)))
    return this.commentHeader(indent, `${method.httpMethod} ${method.endpoint}`)
    + `${indent}def ${method.name}(\n${params.join(this.paramDelimiter)}) -> ${this.typeName(method.type)}:\n`
  }

  declareParameter = (indent: string, param: IParameter) => {
    return this.commentHeader(indent, param.description)
    + `${indent}${param.name}: ${this.typeName(param.type)}`
    + (param.required ? '' : (param.type.default ? ` = ${param.type.default}` : ''))
  }

  declareMethod = (indent: string, method: IMethod) => {
    const bump = indent + this.indentStr
    return this.methodSignature(indent, method)
    + this.summary(bump, method.summary)
    + this.httpCall(bump, method)
  }

  typeSignature = (indent: string, type: IType) =>
  this.commentHeader(indent, type.description)
  + `${indent}class ${type.name}:\n`

  summary = (indent: string, text: string | undefined) => text ? `${indent}"""${text}"""\n` : ''

  typeName = (type: IType): string => {
    const pythonTypes: Record<string, string> = {
      'number': 'double',
      'integer': 'int',
      'int32': 'int',
      'int64': 'long',
      'string': 'str',
      'password': 'Password',
      'byte': 'binary',
    }

    if (type.elementType) {
      // provisional typed list new in Python 3.5
      // https://docs.python.org/3/library/typing.html
      return `List[${this.typeName(type.elementType)}]`
    }

    if (type.name) {
      return pythonTypes[type.name] || type.name
    } else {
      throw new Error('Cannot output a nameless type.')
    }
  }
}
