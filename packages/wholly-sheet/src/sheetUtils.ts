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

import { sheets_v4 } from 'googleapis'

export const toObjectValues = (array: any[][]): any[] => {
  const header = array.splice(0, 1)[0]
  const output = [] as any[]

  array.forEach((el) => {
    const entry = {} as any
    header.forEach((h, i) => {
      entry[h] = el[i] ? el[i] : undefined
    })
    output.push(entry)
  })

  return output
}

export const getValues = async (
  connection: sheets_v4.Sheets,
  spreadsheetId: string,
  range: string
): Promise<any[][]> => {
  return (await new Promise((resolve, reject) => {
    connection.spreadsheets.values.get(
      { spreadsheetId, range },
      (err: any, res: any) => (err ? reject(err) : resolve(res.data.values))
    )
  })) as any[][]
}

export const getObjectValues = async (
  connection: sheets_v4.Sheets,
  spreadsheetId: string,
  range: string
): Promise<any[]> => {
  return toObjectValues(await getValues(connection, spreadsheetId, range))
}
