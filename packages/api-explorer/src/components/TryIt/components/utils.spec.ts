/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2020 Looker Data Sciences, Inc.
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

import { highlightSourceCode } from './utils'

describe('highlighting', () => {
  describe('highlights ace', () => {
    test('it returns markers for found pattern', () => {
      const pattern = 'query'
      const content = `This
has the
word "query" in it
twice! Query, again!
`
      const markers = highlightSourceCode(pattern, content)
      expect(markers).toBeDefined()
      expect(markers.length).toEqual(2)
      let mark = markers[0]
      expect(mark.className).toEqual('codeMarker')
      expect(mark.startCol).toEqual(6)
      expect(mark.endCol).toEqual(6 + 5)
      expect(mark.startRow).toEqual(2)
      expect(mark.endRow).toEqual(2)
      mark = markers[1]
      expect(mark.startCol).toEqual(7)
      expect(mark.endCol).toEqual(7 + 5)
      expect(mark.startRow).toEqual(3)
      expect(mark.endRow).toEqual(3)
    })

    test('it returns no markers for missing pattern', () => {
      const markers = highlightSourceCode('missing', 'foo')
      expect(markers).toBeDefined()
      expect(markers.length).toEqual(0)
    })
  })
})
