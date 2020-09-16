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

import { gridHeaders, gridRows, parseCsv, parseJson } from './gridUtils'

const testDataRows = 3
const testDataCols = 3

const testCsvData = `First,Last,Age
Aaron,Aardvark,20
Zzed,Zzebra,21
`

const testJsonData = JSON.stringify([
  {
    First: 'Aaron',
    Last: 'Aardvark',
    Age: 20,
  },
  {
    First: 'Zzed',
    Last: 'Zzebra',
    Age: 21,
  },
])

describe('gridUtils', () => {
  test('parses csv', () => {
    const actual = parseCsv(testCsvData)
    expect(actual).toBeDefined()
    expect(actual.data).toBeDefined()
    expect(actual.data.length).toEqual(testDataRows)
  })
  test('parses json data', () => {
    const actual = parseJson(testJsonData)
    expect(actual).toBeDefined()
    expect(actual.data).toBeDefined()
    expect(actual.data.length).toEqual(testDataRows)
    const csvData = parseCsv(testCsvData)
    expect(actual.data).toEqual(csvData.data)
  })
  test('creates grid columns', () => {
    const data = parseCsv(testCsvData)
    const actual = gridHeaders(data.data)
    expect(actual.length).toEqual(testDataCols)
  })
  test('creates grid rows', () => {
    const data = parseCsv(testCsvData)
    const actual = gridRows(data.data)
    expect(actual.length).toEqual(testDataRows - 1)
  })
})
