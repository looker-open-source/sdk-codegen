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
import { writeFileSync } from 'fs'
import {
  ApiModel,
  csvHeaderRow,
  csvDiffRow,
  IMethod,
} from '@looker/sdk-codegen'
import { compareSpecs } from '@looker/sdk-codegen/src/specDiff'
import { readFileSync } from '../src'

/**
 * Compares Looker API 3.1 beta endpoints with their 4.0 version and writes the
 * result to csv.
 */
;(async () => {
  const rootPath = path.join(__dirname, '../../../spec')
  const spec31Path = path.join(rootPath, 'Looker.3.1.oas.json')
  const spec40Path = path.join(rootPath, 'Looker.4.0.oas.json')

  const spec31 = ApiModel.fromString(readFileSync(spec31Path))
  const spec40 = ApiModel.fromString(readFileSync(spec40Path))

  const filter = (lMethod?: IMethod, _?: IMethod) => lMethod?.status === 'beta'

  const diff = compareSpecs(spec31, spec40, filter)

  let result = csvHeaderRow
  diff.forEach((diffRow) => {
    result += csvDiffRow(diffRow)
  })

  writeFileSync(path.join(rootPath, '../results.csv'), result, {
    encoding: 'utf-8',
  })
})()
