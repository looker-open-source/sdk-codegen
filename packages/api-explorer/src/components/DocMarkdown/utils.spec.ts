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
import { highlightMarkdown, remapHashURL, transformURL } from './utils'

describe('DocMarkdown utils', () => {
  describe('highlighting', () => {
    const str = 'Get the query for a given query slug'
    test('it returns original string when there are no matches', () => {
      const result = highlightMarkdown('dashboard', str)
      expect(result).toEqual(str)
    })

    test('it returns original string when no pattern is provided', () => {
      const result = highlightMarkdown('', str)
      expect(result).toEqual(str)
    })

    test('it wraps matches with mark tags', () => {
      const result = highlightMarkdown('query', str)
      expect(result).toEqual(
        'Get the <mark>query</mark> for a given <mark>query</mark> slug'
      )
    })

    test('it highlights matches in both the display text and url of an inline-style hashbang link', () => {
      const result = highlightMarkdown(
        'query',
        'Here is some text [Query](#!/methods/Query/create_query)'
      )
      expect(result).toEqual(
        'Here is some text [<mark>Query</mark>](#!/methods/<mark>Query</mark>/create_<mark>query</mark>)'
      )
    })
  })

  describe('hashbang url remapping', () => {
    test.each(['#!/methodTag', '#!/3.1/methodTag'])(
      'it correctly maps %s tag urls',
      (url) => {
        const result = remapHashURL('3.1', url)
        expect(result).toEqual('/3.1/methods/methodTag')
      }
    )

    test.each(['#!/3.1/methodTag/methodName', '#!/methodTag/methodName'])(
      'it correctly maps %s method urls ',
      (hashbangUrl) => {
        const result = remapHashURL('3.1', hashbangUrl)
        expect(result).toEqual('/3.1/methods/methodTag/methodName')
      }
    )

    test('external urls are left untouched', () => {
      const url = 'https://foo.com'
      const result = remapHashURL('3.1', url)
      expect(result).toEqual(url)
    })
  })

  describe('url transforming', () => {
    test('removes mark tags and transforms url', () => {
      const url = '#!/<mark>Dashboard</mark>/create_<mark>dashboard</mark>'
      const result = transformURL('3.1', url)
      expect(result).toEqual('/3.1/methods/Dashboard/create_dashboard')
    })
  })
})
