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

// Wrap Papa.parse in promise for async use.
// Assumes header row in csv
export async function parseCsv<T>(_csvFile: File): Promise<Array<T>> {
  // import Papa from 'papaparse'
  const stub: Array<T> = [];
  return new Promise<Array<T>>((resolve, _reject) => resolve(stub));
  // TODO fix this lint error
  // return new Promise((resolve, reject) => {
  //   Papa.parse(csvFile, {
  //     header: true,
  //     skipEmptyLines: 'greedy',
  //     complete: (output: any) => resolve(output.data),
  //     error: (e: Papa.ParseError) => reject(e),
  //   })
  // })
}
