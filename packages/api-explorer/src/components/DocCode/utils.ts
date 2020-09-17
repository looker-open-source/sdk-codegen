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

import { IMarker } from 'react-ace'

export const highlightSourceCode = (
  pattern: string,
  content: string,
  className = 'codeMarker'
): IMarker[] => {
  const result: IMarker[] = []
  if (pattern) {
    const lines = content.split('\n')
    const target = new RegExp(pattern, 'gi')
    lines.forEach((line, index) => {
      let found
      while ((found = target.exec(line))) {
        const mark: IMarker = {
          className,
          endCol: found.index + found[0].length,
          endRow: index,
          startCol: found.index,
          startRow: index,
          type: 'text',
        }
        result.push(mark)
      }
    })
  }
  return result
}
