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

// import { ParameterObject, PathsObject, OperationObject } from "openapi3-ts"

import {MethodParameterLocation} from "./methodParam";

export declare type IHttpMethod = 'get' | 'put' | 'post' | 'patch' | 'delete'
export declare type IArg = string | undefined

export interface IModel {
  name?: string
}

export interface IType extends IModel {
  default?: string
}

export interface IParameter extends IModel {
  type: IType
  location: MethodParameterLocation
  required?: boolean
  description?: string
}

export interface IMethod extends IModel {
  operationId: string // Method constructor assigns this to method name
  httpMethod: IHttpMethod
  endpoint: string
  type: IType

  description?: string
  params?: IParameter[]
  summary?: string
  pathArgs?: IArg[]
  bodyArg?: string
  queryArgs?: IArg[]
  headerArgs?: IArg[]
  cookieArgs?: IArg[]
}

export interface IStruct extends IModel {
  description?: string
  properties: IParameter[]
}

export interface IApi extends IModel {
  version?: string
  description?: string
  methods: Array<IMethod>
  structures?: Array<IStruct>
}

export interface ICodeFormatter {

  // comment string
  // e.g. Python=# C#=// TypeScript=//
  commentStr: string
  // string representation of null value
  // e.g. Python None, C# null, Delphi nil
  nullStr: string
  // indentation string. Typically two spaces '  '
  indentStr: string
  // end type string. For C# and TypeScript, usually '}\n'
  endTypeStr: string

  // argument separator string. Typically ', '
  argDelimiter: string
  // parameter delimiter. Typically ",\n"
  paramDelimiter: string
  // property delimiter. Typically, ",\n"
  propDelimiter: string

  // generate an optional comment header if the comment is not empty
  commentHeader(indent: string, text: string | undefined): string

  // group argument names together
  // e.g.
  //   [ row_size, page_offset ]
  argGroup(indent: string, args: IArg[] ): string

  // list arguments by name
  // e.g.
  //   row_size, page_offset
  argList(indent: string, args: IArg[]): string

  // generate a comment block
  // e.g.
  //   # this is a
  //   # multi-line comment block
  comment(indent: string, description: string | undefined): string

  // generates the method signature including parameter list and return type.
  // supports
  methodSignature(indent: string, method: IMethod): string

  // generate a call to the http API abstraction
  // includes http method, path, body, query, headers, cookie arguments
  httpCall(indent: string, method: IMethod): string

  // generates the type declaration signature for the start of the type definition
  typeSignature(indent: string, type: IStruct): string

  // generates summary text
  // e.g, for Python:
  //    '''This is the method summary'''
  summary(indent: string, text: string | undefined): string

  // produces the declaration block for a parameter
  // e.g.
  //   # ID of the query to run
  //   query_id: str
  //
  // and
  //
  //   # size description of parameter
  //   row_limit: int = None
  declareParameter(indent: string, param: IParameter): string

  // generates the entire method
  declareMethod(indent: string, method: IMethod): string

  // produces the list of parameters for a method signature
  // e.g.
  //   # ID of the query to run
  //   query_id: str,
  //   # size description of parameter
  //   row_limit: int = None
  declareParameters(indent: string, params: IParameter[] | undefined): string

  // generates entire type declaration
  declareType(indent: string, type: IStruct): string

  // generates type property
  declareProperty(indent: string, property: IParameter): string

  convertType(type: IType) : IType
}
