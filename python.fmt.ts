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

import {IArg, IMethod, IParameter, IStruct, IType} from "./sdkModels"
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
    argGroup = (indent: string, args: IArg[]) => args && args.length !== 0 ? `[${args.join(this.argDelimiter)}]` : this.nullStr
    // @ts-ignore
    argList = (indent: string, args: IArg[]) => args && args.length !== 0 ? `${args.join(this.argDelimiter)}` : this.nullStr

    declareProperty = (indent: string, property: IParameter) =>
        this.commentHeader(indent, property.description)
            + `${indent}${property.name} : ${property.type.name}`

    methodSignature = (indent: string, method: IMethod) => {
        let bump = indent + this.indentStr
        let params: string[] = []
        if (method.params) method.params.forEach(p => params.push(this.declareParameter(bump, p)))
        return this.commentHeader(indent, `${method.httpMethod} ${method.endpoint}`)
            + `${indent}def ${method.name || method.operationId}(\n${params.join(this.paramDelimiter)}) -> ${method.type.name}:\n`
    }

    declareParameter = (indent: string, param: IParameter) => {
        const type = this.convertType(param.type)
        return this.commentHeader(indent, param.description)
            + `${indent}${param.name}: ${type.name}`
            + (param.required ? '' : (type.default ? ` = ${type.default}` : ''))
    }

    declareMethod = (indent: string, method: IMethod) => {
        const bump = indent + this.indentStr
        return this.methodSignature(indent, method)
            + this.summary(bump, method.summary)
            + this.httpCall(bump, method)
    }

    typeSignature = (indent: string, type: IStruct) =>
        this.commentHeader(indent, type.description)
            + `${indent}class ${type.name}:\n`

    summary = (indent: string, text: string | undefined) => text ? `${indent}"""${text}"""\n` : ''

    convertType = (type: IType): IType => {
        const none = 'None'
        switch (type.name!) {
            case 'number': return { name: 'double', default: none}
            case 'number.float': return { name: 'float', default: none}
            case 'number.double': return { name: 'double', default: none}
            case 'integer': return { name: 'int', default: none}
            case 'integer.int32': return { name: 'int', default: none}
            case 'integer.int64': return { name: 'long', default: none}
            case 'string': return { name: 'str', default: none}
            case 'string.date': return { name: 'date', default: none}
            case 'string.date-time': return { name: 'datetime', default: none}
            case 'string.password': return { name: 'Password', default: none}
            case 'string.byte': return { name: 'binary', default: none}
            case 'string.email': return { name: 'email', default: none}
            case 'string.uuid': return { name: 'uuid', default: none}
            case 'string.uri': return { name: 'uri', default: none}
            case 'string.hostname': return { name: 'hostname', default: none}
            case 'string.ipv4': return { name: 'ipv4', default: none}
            case 'string.ipv6': return { name: 'ipv6', default: none}
            case 'boolean': return { name: 'boolean', default: none}
            default: return type
        }
    }
}
