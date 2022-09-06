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

import cloneDeep from 'lodash/cloneDeep'
import type {
  DiffFilter,
  DiffRow,
  IApiModel,
  IMethod,
  MethodList,
  TagList,
} from '@looker/sdk-codegen'
import { compareSpecs } from '@looker/sdk-codegen'

export const allDiffToggles = [
  'missing',
  'status',
  'params',
  'type',
  'body',
  'response',
]

export const standardDiffToggles = [
  'missing',
  'params',
  'type',
  'body',
  'response',
]

/**
 * Abstraction of compareAPIs in case we need to transform compareSpecs diff rows
 * @param lhs left side API
 * @param rhs right sight API
 * @param options to include
 */
export const diffSpecs = (
  lhs: IApiModel,
  rhs: IApiModel,
  options: string[]
) => {
  const includeOptions: DiffFilter = (delta, lMethod, rMethod) =>
    (options.includes('missing') && (!lMethod || !rMethod)) ||
    (options.includes('status') && delta.lStatus !== delta.rStatus) ||
    (options.includes('params') && !!delta.paramsDiff) ||
    (options.includes('type') && !!delta.typeDiff) ||
    (options.includes('body') && !!delta.bodyDiff) ||
    (options.includes('response') && !!delta.responseDiff)

  return compareSpecs(lhs, rhs, includeOptions)
}

/**
 * Local copy of private function from ApiModel
 * @param tags list of all tags
 * @param method to add
 */
const addMethodToTags = (tags: TagList, method: IMethod): TagList => {
  for (const tag of method.schema.tags) {
    let list: MethodList = tags[tag]
    if (!list) {
      list = {}
      tags[tag] = list
    }
    list[method.name] = method
  }
  return tags
}

/**
 * Combine diff into a psuedo api spec that contains an established method for each diff result
 * @param delta complete diff to compose
 * @param lSpec left spec
 * @param rSpec right spec
 */
export const diffToSpec = (
  delta: DiffRow[],
  lSpec: IApiModel,
  rSpec: IApiModel
) => {
  const result = cloneDeep(lSpec)
  result.tags = {}
  result.methods = {}

  delta.forEach((row) => {
    const name = row.name
    let method = lSpec.methods[name]
    if (!method) method = rSpec.methods[name]
    result.methods[name] = method
    addMethodToTags(result.tags, method)
  })

  // TODO diff types then we can populate this also
  result.types = {}
  return result
}

/**
 * Returns all valid diff options contained in list
 * @param opts url diff options parameter value
 */
export const getValidDiffOptions = (opts: string | null) => {
  if (!opts) return null
  const diffOptions: string[] = []
  for (const option of opts.split(',')) {
    const op = option.toLowerCase()
    if (allDiffToggles.includes(op) && !diffOptions.includes(op)) {
      diffOptions.push(option.toLowerCase())
    }
  }
  return diffOptions.length ? diffOptions : null
}
