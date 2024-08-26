/*

 MIT License

 Copyright (c) 2021 Looker Data Sciences, Inc.

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

import { CodeGen } from './codeGen';
import type { IMethod, IParameter, IProperty, IType } from './sdkModels';
import { ArrayType } from './sdkModels';

// eslint-disable @typescript-eslint/no-unused-vars

/**
 * Pseudocde generator
 */
export class PseudoGen extends CodeGen {
  commentStr = '"';
  endTypeStr = '}';
  /**
   * Generic prototype-style method signature generator
   *
   * NOTE: Every language generator should override this methodSignature function
   *
   * @param indent indentation for code
   * @param method for signature
   */
  methodSignature(indent: string, method: IMethod): string {
    const params = method.allParams;
    const args = params.map(p => this.declareParameter(indent, method, p));
    const bump = this.bumper(indent);
    const fragment =
      args.length === 0
        ? ''
        : `\n${bump}${args.join(',\n' + bump).trim()}${indent}\n`;
    return (
      this.commentHeader(indent, method.description.trimRight()) +
      `${indent}${method.operationId}(${fragment}): ${method.primaryResponse.type.name}`
    );
  }

  commentHeader(
    indent: string,
    text: string | undefined,
    _commentStr?: string
  ): string | string {
    if (this.noComment) return '';
    const comment = super.commentHeader(indent, text, _commentStr).trimRight();
    if (!comment) return '';
    return `${comment}${this.commentStr}\n`;
  }

  construct(_indent: string, _type: IType): string {
    return '';
  }

  declareMethod(_indent: string, _method: IMethod): string {
    return '';
  }

  declareParameter(
    indent: string,
    _method: IMethod,
    param: IParameter
  ): string {
    let result = `${indent}${param.name}: ${param.type.name}`;
    if (!param.required) result = `[${result}]`;
    return this.commentHeader(indent, param.description) + result;
  }

  declareProperty(indent: string, property: IProperty): string {
    const lb = property.required ? '' : '[';
    const rb = property.required ? '' : ']';
    return (
      this.commentHeader(indent, property.description) +
      `${indent}${lb}${property.name}: ${property.type.name}${rb}`
    );
  }

  encodePathParams(_indent: string, _method: IMethod): string {
    return '';
  }

  methodsEpilogue(_indent: string): string {
    return '';
  }

  methodsPrologue(_indent: string): string {
    return '';
  }

  modelsEpilogue(_indent: string): string {
    return '';
  }

  modelsPrologue(_indent: string): string {
    return '';
  }

  summary(_indent: string, _text: string | undefined): string {
    return '';
  }

  typeSignature(indent: string, type: IType): string {
    return (
      this.commentHeader(indent, type.description) +
      `${indent}${type.name} ${this.typeOpen}\n`
    );
  }

  declareType(indent: string, type: IType): string {
    if (!(type instanceof ArrayType)) {
      return super.declareType(indent, type);
    }
    return `${indent}list of ${super
      .declareType(indent, type.elementType)
      .trimStart()}`;
  }
}
