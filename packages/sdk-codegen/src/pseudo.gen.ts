/*

 MIT License

 Copyright (c) 2020 Looker Data Sciences, Inc.

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.

 */

import { CodeGen } from './codeGen'
import { IMethod, IParameter, IProperty, IType } from './sdkModels'

// eslint-disable @typescript-eslint/no-unused-vars

/**
 * Pseudocde generator
 */
export class PseudoGen extends CodeGen {
  /**
   * Generic prototype-style method signature generator
   *
   * NOTE: Every language generator should override this methodSignature function
   *
   * @param {string} indent indentation for code
   * @param {IMethod} method for signature
   * @returns {string} prototype declaration of method
   */
  methodSignature(indent: string, method: IMethod): string {
    indent = ''
    const params = method.allParams
    const args = params.map((p) => p.name)
    return `${indent}${method.operationId}(${args.join(', ')}): ${
      method.primaryResponse.type.name
    }`
  }

  // @ts-ignore
  construct(indent: string, type: IType): string {
    return ''
  }

  // @ts-ignore
  declareMethod(indent: string, method: IMethod): string {
    return ''
  }

  // @ts-ignore
  declareParameter(indent: string, method: IMethod, param: IParameter): string {
    return ''
  }

  // @ts-ignore
  declareProperty(indent: string, property: IProperty): string {
    return ''
  }

  // @ts-ignore
  encodePathParams(indent: string, method: IMethod): string {
    return ''
  }

  // @ts-ignore
  initArg(indent: string, property: IProperty): string {
    return ''
  }

  // @ts-ignore
  methodsEpilogue(indent: string): string {
    return ''
  }

  // @ts-ignore
  methodsPrologue(indent: string): string {
    return ''
  }

  // @ts-ignore
  modelsEpilogue(indent: string): string {
    return ''
  }

  // @ts-ignore
  modelsPrologue(indent: string): string {
    return ''
  }

  // @ts-ignore
  summary(indent: string, text: string | undefined): string {
    return ''
  }

  // @ts-ignore
  typeSignature(indent: string, type: IType): string {
    return ''
  }
}
