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
import * as path from 'path'
import {
  ApiModel,
  IMethod,
  SearchCriterion,
  TagList,
} from '@looker/sdk-codegen'
import { readFileSync } from '..'
import { writeFileSync } from 'fs'

const allMethods = (tags: TagList): Array<IMethod> => {
  const result: Array<IMethod> = []
  Object.entries(tags).forEach(([, methods]) => {
    Object.entries(methods).forEach(([, method]) => {
      result.push(method)
    })
  })
  return result
}

const headerRow = `
| method name  | path | 3.1 | 4.0 | 
| ------------ | ---- | --- | --- |`

const lintRow = (method31: IMethod, method40?: IMethod) => `
  | ${method31.name} | ${method31.endpoint} | ${method31.status} | ${
  method40?.status || ' '
} |`

;(async () => {
  const rootPath = path.join(__dirname, '../../../spec')
  const spec31Path = path.join(rootPath, 'Looker.3.1.oas.json')
  const spec40Path = path.join(rootPath, 'Looker.4.0.oas.json')

  const spec31 = ApiModel.fromString(readFileSync(spec31Path))
  const spec40 = ApiModel.fromString(readFileSync(spec40Path))

  const criteria = new Set<SearchCriterion>([SearchCriterion.status])
  const beta31 = spec31.search('beta', criteria)
  const methods40 = Object.values(spec40.methods)

  const methods31 = allMethods(beta31.tags)

  let result = headerRow

  methods31.forEach((method) => {
    const found = methods40.find((m40) => m40.endpoint === method.endpoint)
    result += lintRow(method, found)
  })

  writeFileSync(path.join(rootPath, '../results.md'), result, {
    encoding: 'utf-8',
  })

  // create regex that looks for controller path pattern httpMethod
  // create index with all paths in all ruby controllers. key (as in method.httpMethod method.endpoint ), value = source file name and Line number
  // transform {user_id} => :user_id:
  // getCommitHash
})()
