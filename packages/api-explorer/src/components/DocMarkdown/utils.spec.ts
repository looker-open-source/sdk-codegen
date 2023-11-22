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
import { remapHashURL, transformURL } from './utils'

describe('DocMarkdown utils', () => {
  describe('hashbang url remapping', () => {
    test.each(['#!/methodTag', '#!/4.0/methodTag'])(
      'it correctly maps %s tag urls',
      (url) => {
        const result = remapHashURL('4.0', url)
        expect(result).toEqual('/4.0/methods/methodTag')
      }
    )

    test.each(['#!/4.0/methodTag/methodName', '#!/methodTag/methodName'])(
      'it correctly maps %s method urls ',
      (hashbangUrl) => {
        const result = remapHashURL('4.0', hashbangUrl)
        expect(result).toEqual('/4.0/methods/methodTag/methodName')
      }
    )

    test('external urls are left untouched', () => {
      const url = 'https://foo.com'
      const result = remapHashURL('4.0', url)
      expect(result).toEqual(url)
    })
  })

  describe('url transforming', () => {
    test('removes mark tags and transforms url', () => {
      const url = '#!/<mark>Dashboard</mark>/create_<mark>dashboard</mark>'
      const result = transformURL('4.0', url)
      expect(result).toEqual('/4.0/methods/Dashboard/create_dashboard')
    })
    test('removes mark tags and transforms url', () => {
      const url = 'https://docs.looker.com/r/api/<mark>authorization</mark>'
      const result = transformURL('4.0', url)
      expect(result).toEqual('https://docs.looker.com/r/api/authorization')
    })
    test('removes escaped mark tags and transforms url', () => {
      const url =
        'https://docs.looker.com/r/api/%3Cmark%3Eauthorization%3Cmark%3E'
      const result = transformURL('4.0', url)
      expect(result).toEqual('https://docs.looker.com/r/api/authorization')
    })
  })
})
