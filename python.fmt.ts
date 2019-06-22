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

import {IMethod, IParameter, IProperty, IType} from "./sdkModels"
import {CodeFormatter} from "./codeFormatter"

export class PythonFormatter extends CodeFormatter {
    argDelimiter = ', '
    paramDelimiter = ',\n'
    commentStr = '# '
    nullStr = 'None'

    declareProperty = (indent: string, property: IProperty) =>
        this.commentHeader(indent, property.description)
            + `${indent}${property.name} : ${property.type.name}`

    methodSignature = (indent: string, method: IMethod) => {
        let bump = indent + this.indentStr
        let params: string[] = []
        if (method.params) method.params.forEach(p => params.push(this.declareParameter(bump, p)))
        return this.commentHeader(indent, `${method.httpMethod} ${method.endpoint}`)
            + `${indent}def ${method.name || method.operationId}(${params.join(this.paramDelimiter)}$) -> ${method.type.name}:`
    }

    declareParameter = (indent: string, param: IParameter) =>
        this.commentHeader(indent, param.description)
            + `${indent}${param.name}: ${param.type.name}`
//            + (param.required ? '' : (param.type.default ? `= ${param.type.default}` : ''))

    declareMethod = (indent: string, method: IMethod) => {
        const bump = indent + this.indentStr
        return this.methodSignature(indent, method)
            + this.declareParameters(bump, method.params)
            + this.summary(bump, method.summary)
            + this.httpCall(bump, method)
    }

    typeSignature = (indent: string, type: IType) =>
        this.commentHeader(indent, type.description)
            + `${indent}class ${type.name}:\n`

    summary = (indent: string, text: string | undefined) => text ? `${indent}"""{$summary}"""` : ''
}
