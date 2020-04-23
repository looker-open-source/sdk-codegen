#!/usr/bin/env node

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

import * as Models from '@looker/sdk-codegen'
import { success } from '@looker/sdk-codegen-utils'
import { readFileSync } from './nodeUtils'

export const specFromFile = (specFile: string): Models.ApiModel => {
  const specContent = readFileSync(specFile)
  return Models.ApiModel.fromString(specContent)
}

export interface IGeneratorCtor<T extends Models.IModel> {
  new(model: T, formatter: Models.ICodeGen): Generator<T>
}

export abstract class Generator<T extends Models.IModel> {
  codeFormatter: Models.ICodeGen
  model: T
  buf: string[] = []

  constructor(model: T, formatter: Models.ICodeGen) {
    this.model = model
    this.codeFormatter = formatter
  }

  // convenience function that calls render for each item in the list
  // and collects their output in the buffer
  each<K extends Models.IModel>(list: Array<K>, ctor: IGeneratorCtor<K>, indent: string = '', delimiter?: string): this {
    const strs = list.map((model) => {
      return new ctor(model, this.codeFormatter).render(indent)
    })
    if (delimiter) {
      this.p(strs.join(delimiter))
    } else {
      this.p(strs)
    }
    return this
  }

  abstract render(indent: string): string

  // Add one or more strings to the internal buffer
  // if the string is not empty or undefined
  p(str?: string | string[]): this {
    if (typeof str !== 'undefined' && str.length > 0) {
      this.buf = this.buf.concat(str)
    }
    return this
  }

  pIf(expr: any, str?: string | string[]): this {
    if (expr) {
      this.p(str)
    }
    return this
  }

  toString(indent: string): string {
    return indent + this.buf.join('\n' + indent)
  }
}

export class MethodGenerator extends Generator<Models.IApiModel> {
  render(indent: string) {
    let items: string[] = []
    // reset refcounts for ALL types so dynamic import statement will work
    Object.entries(this.model.types).forEach(([_, type]) => type.refCount = 0)
    Object.values(this.model.sortedMethods())
      .forEach(method => {
        items.push(this.codeFormatter.declareMethod(indent, method))
      })
    const tally = `${items.length} API methods`
    success(tally)
    return this
      .p(`${this.codeFormatter.comment('', tally)}`)
      .p(this.codeFormatter.methodsPrologue(indent))
      .p(items.join('\n\n'))
      .p(this.codeFormatter.methodsEpilogue(indent))
      .toString('')
  }
}

export class StreamGenerator extends Generator<Models.IApiModel> {
  render(indent: string) {
    let items: string[] = []
    // reset refcounts for ALL types so dynamic import statement will work
    Object.entries(this.model.types).forEach(([_, type]) => type.refCount = 0)
    Object.values(this.model.sortedMethods())
      .forEach(method => {
        items.push(this.codeFormatter.declareStreamer(indent, method))
      })
    const tally = `${items.length} API methods`
    success(tally)
    return this
      .p(`${this.codeFormatter.comment('', tally)}`)
      .p(this.codeFormatter.streamsPrologue(indent))
      .p(items.join('\n\n'))
      .p(this.codeFormatter.methodsEpilogue(indent))
      .toString('')
  }
}


export class TypeGenerator extends Generator<Models.IApiModel> {
  render(indent: string) {
    let items: string[] = []
    Object.values(this.model.sortedTypes())
      .filter(type => !(type instanceof Models.IntrinsicType))
      .forEach(type => items.push(this.codeFormatter.declareType(indent, type)))
    const counts = this.typeTally(this.model.types)
    const tally = `${counts.total} API models: ${counts.standard} Spec, ${counts.request} Request, ${counts.write} Write`
    success(tally)
    return this
      .p(`${this.codeFormatter.comment('', tally)}`)
      .p(this.codeFormatter.modelsPrologue(indent))
      .p(items.join('\n\n'))
      .p(this.codeFormatter.modelsEpilogue(indent))
      .toString(indent)
  }

  typeTally(types: Record<string, Models.IType>) {
    let request = 0
    let write = 0
    let standard = 0
    Object.values(types)
      .filter(type => !(type instanceof Models.IntrinsicType))
      .forEach(type => {
        if (type instanceof Models.RequestType) {
          if (type.refCount > 0) request++
        } else if (type instanceof Models.WriteType) {
          if (type.refCount > 0) write++
        } else {
          standard++
        }
      })
    return {standard, write, request, total: standard + write + request}
  }
}
