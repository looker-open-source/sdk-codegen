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
import * as fs from 'fs'
import path from 'path'
import { IMine, findExamples, findExampleLanguages } from './exampleInfo'

const fileName = path.join(__dirname, '../../../motherlode.json')
const file = fs.readFileSync(fileName, { encoding: 'utf-8' })
const lode: IMine = JSON.parse(file)
const op = 'render_task'

describe('exampleInfo', () => {
  it('finds language examples for "render_task"', () => {
    const actual = findExampleLanguages(lode, op)
    expect(actual).toBeDefined()
    expect(actual).toEqual(['Python', 'Typescript', 'Kotlin', 'Ruby'])
    actual.forEach((language) => {
      const ex = findExamples(lode, language, op)
      expect(ex).toBeDefined()
      expect(ex.length).toBeGreaterThan(0)
    })
  })
  it('findExamples finds examples', () => {
    const actual = findExamples(lode, 'typescript', 'me')
    expect(actual).toBeDefined()
    expect(actual.length).toBeGreaterThan(0)
  })
})
