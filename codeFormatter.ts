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

import {IArg, ICodeFormatter, IHttpMethod, IMethod, IParameter, IStruct, IType} from "./sdkModels"
import {commentBlock} from "./utils"
import {MethodParameterLocation} from "./methodParam"

export class CodeFormatter implements ICodeFormatter {
    dump = (value: any) => JSON.stringify(value, null, 2)
    debug = (tag: string, value: any, indent: string = '') => `${indent}${tag}:${this.dump(value)}`

    argDelimiter = ', '
    paramDelimiter = ',\n'
    propDelimiter = ',\n'

    indentStr = '  '
    commentStr = '// '
    nullStr = 'null'
    endTypeStr = ''

    argGroup = (indent: string, args: IArg[]) => args && args.length !== 0 ? `${indent}[${args.join(this.argDelimiter)}]` : this.nullStr
    argList = (indent: string, args: IArg[]) => args && args.length !== 0 ? `${indent}${args.join(this.argDelimiter)}` : this.nullStr

    comment = (indent: string, description: string) => commentBlock(description, indent, this.commentStr)
    commentHeader = (indent: string, text: string | undefined) => text ? `${this.comment(indent, text)}\n` : ''

    declareParameter = (indent: string, param: IParameter) => this.debug('declareParameter', param, indent)

    declareParameters = (indent: string, params: IParameter[] | undefined) => {
        let items : string[] = []
        if (params) params.forEach(p => items.push(this.declareParameter(indent, p)))
        return items.join(this.paramDelimiter)
    }

    declareProperty = (indent: string, property: IParameter) => this.debug('declareProperty', property, indent)

    declareType = (indent: string, type: IStruct) => {
        let props: string[] = []
        type.properties.forEach(prop => props.push(this.declareProperty(indent + this.indentStr, prop)))
        return this.commentHeader(indent, type.description)
            + this.typeSignature(indent, type)
            + props.join(this.propDelimiter)
            + `$(indent}${this.endTypeStr}`
    }

    // this is a builder function to produce arguments with optional null place holders but no extra required optional arguments
    argFill = (current: string, args: string) => {
        if ((!current) && args.trim() === this.nullStr) {
            // Don't append trailing optional arguments if none have been set yet
            return ''
        }
        return `${args}${current ? this.argDelimiter : ''}${current}`
    }

    httpArgs = (indent: string, method: Method) => {
        let result = this.argFill('', this.argGroup(indent, method.cookieArgs))
        result = this.argFill(result, this.argGroup(indent, method.headerArgs))
        result = this.argFill(result, this.argGroup(indent, method.queryArgs))
        result = this.argFill(result, method.bodyArg ? method.bodyArg : this.nullStr)
        result = this.argFill(result, this.argGroup(indent, method.pathArgs))
        return result
    }

    httpCall = (indent: string, method: IMethod) => {
        const args = this.httpArgs(indent, new Method(method))
        return `${indent}return session.${method.httpMethod}(${args})`
    }

    typeSignature = (indent: string, type: IStruct) => this.debug('typeSignature', type, indent)
    methodSignature = (indent: string, method: IMethod) => this.debug('methodSignature', method, indent)
    declareMethod = (indent: string, method: IMethod) => this.debug('declareMethod', method, indent)
    summary = (indent: string, text: string | undefined) => this.debug('summary', text, indent)

    convertType = (type: IType) => type
}

export class Method implements IMethod {
    description?: string
    endpoint!: string
    httpMethod!: IHttpMethod
    name!: string
    operationId!: string
    params!: IParameter[]
    summary!: string
    type!: IType

    constructor (method: IMethod) {
        Object.assign(this, method)
        if (!this.name) this.name = this.operationId
    }

    getParams = (location?: MethodParameterLocation) => {
        if (location) {
            return this.params.filter((p) => p.location === location)
        }
        return this.params
    }

    get pathParams(){
        return this.getParams('path')
    }

    get bodyParams() {
        return this.getParams('body')
    }

    get queryParams() {
        return this.getParams('query')
    }

    get headerParams() {
        return this.getParams('header')
    }

    get cookieParams() {
        return this.getParams('cookie')
    }

    names = (location?: MethodParameterLocation) => {
        return this
            .getParams(location)
            .map(p => p.name)
    }

    args = (location?: MethodParameterLocation) => {
        return this.names(location)
    }

    get pathArgs(){
        return this.args('path')
    }

    get bodyArg() {
        const body = this.args('body')
        if (body.length === 0) return ''
        return body[0]
    }

    get queryArgs() {
        return this.args('query')
    }

    get headerArgs() {
        return this.args('header')
    }

    get cookieArgs() {
        return this.args('cookie')
    }

}
