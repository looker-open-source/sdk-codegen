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

import {Arg, ICodeFormatter, IMethod, IParameter, IType, IProperty} from "./sdkModels"
import {commentBlock} from "./utils"

export class CodeFormatter implements ICodeFormatter {
    dump = (value: any) => JSON.stringify(value, null, 2)
    debug = (tag: string, value: any, indent: string = '') => `${indent}${tag}:${this.dump(value)}`

    itself = ''
    fileExtension = '.code'
    argDelimiter = ', '
    paramDelimiter = ',\n'
    propDelimiter = ',\n'

    indentStr = '  '
    commentStr = '// '
    nullStr = 'null'
    endTypeStr = ''

    bumper = (indent: string) => indent + this.indentStr

    fileName = (base: string ) => `${base}${this.fileExtension}`
    argGroup = (indent: string, args: Arg[]) => args && args.length !== 0 ? `${indent}[${args.join(this.argDelimiter)}]` : this.nullStr
    argList = (indent: string, args: Arg[]) => args && args.length !== 0 ? `${indent}${args.join(this.argDelimiter)}` : this.nullStr

    comment = (indent: string, description: string) => commentBlock(description, indent, this.commentStr)
    commentHeader = (indent: string, text: string | undefined) => text ? `${this.comment(indent, text)}\n` : ''

    declareParameter = (indent: string, param: IParameter) => this.debug('declareParameter', param, indent)

    declareParameters = (indent: string, params: IParameter[] | undefined) => {
        let items : string[] = []
        if (params) params.forEach(p => items.push(this.declareParameter(indent, p)))
        return items.join(this.paramDelimiter)
    }

    declareProperty = (indent: string, property: IProperty) => this.debug('declareProperty', property, indent)

    declareConstructorArg = (indent: string, property: IProperty) =>
        `${indent}${property.name}${property.nullable  ? " = " + this.nullStr: ''}`

    it = (id: string) => this.itself ? `${this.itself}.${id}` : id

    initArg = (indent: string, property: IProperty) => {
        let bump = this.bumper(indent)
        let assign = `${this.it('_' + property.name)} = ${property.name}\n`
        if (property.nullable) {
            return `${indent}if ${property.name} is not None:\n` +
                `${bump}${assign}`
        }
        return assign
    }

    // Omit read-only parameters
    construct = (indent: string, properties: Record<string, IProperty>) => {
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

    declareType = (indent: string, type: IType) => {
        let props: string[] = []
        Object.values(type.properties).forEach((prop) => props.push(this.declareProperty(indent + this.indentStr, prop)))
        return this.commentHeader(indent, type.description)
            + this.typeSignature(indent, type)
            + this.construct(indent, type.properties)
            + props.join(this.propDelimiter)
            + `${this.endTypeStr? indent : ''}${this.endTypeStr}`
    }

    // this is a builder function to produce arguments with optional null place holders but no extra required optional arguments
    argFill = (current: string, args: string) => {
        if ((!current) && args.trim() === this.nullStr) {
            // Don't append trailing optional arguments if none have been set yet
            return ''
        }
        return `${args}${current ? this.argDelimiter : ''}${current}`
    }

    httpArgs = (indent: string, method: IMethod) => {
        let result = this.argFill('', this.argGroup(indent, method.cookieArgs))
        result = this.argFill(result, this.argGroup(indent, method.headerArgs))
        result = this.argFill(result, this.argGroup(indent, method.queryArgs))
        result = this.argFill(result, method.bodyArg ? method.bodyArg : this.nullStr)
        result = this.argFill(result, this.argGroup(indent, method.pathArgs))
        return result
    }

    httpCall = (indent: string, method: IMethod) => {
        const bump = indent + this.indentStr
        const args = this.httpArgs(bump, method)
        return `${indent}return session.${method.httpMethod}("${method.endpoint}"${args ? ", " +args: ""})`
    }

    typeSignature = (indent: string, type: IType) => this.debug('typeSignature', type, indent)
    methodSignature = (indent: string, method: IMethod) => this.debug('methodSignature', method, indent)
    declareMethod = (indent: string, method: IMethod) => this.debug('declareMethod', method, indent)
    summary = (indent: string, text: string | undefined) => this.debug('summary', text, indent)

    typeName = (type: IType): string => type.name || ''
}
