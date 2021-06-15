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
import { qualifyMarkdownText } from './utils'

describe('DocMarkdown utils', () => {
  describe('highlighting', () => {
    const str = 'Get the query for a given query slug'
    test('it returns original string when there are no matches', () => {
      const result = qualifyMarkdownText(str, 'dashboard')
      expect(result).toEqual(str)
    })

    test('it returns original string when no pattern is provided', () => {
      const result = qualifyMarkdownText(str, '')
      expect(result).toEqual(str)
    })

    test('it wraps matches with mark tags', () => {
      const result = qualifyMarkdownText(str, 'query')
      expect(result).toEqual(
        'Get the <mark>query</mark> for a given <mark>query</mark> slug'
      )
    })

    test('it highlights matches in both the display text and url of an inline-style hashbang link', () => {
      const result = qualifyMarkdownText(
        'Here is some text [Query](#!/methods/Query/create_query)',
        'query'
      )
      expect(result).toEqual(
        'Here is some text [<mark>Query</mark>](#!/methods/<mark>Query</mark>/create_<mark>query</mark>)'
      )
    })
  })
})
