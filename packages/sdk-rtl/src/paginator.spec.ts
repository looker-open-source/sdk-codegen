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

import { linkHeaderParser } from './paginator'

const firstLink = `<http://localhost/api/4.0/alerts/search?fields=id&limit=3&offset=0>; rel="first"`
const lastLink = `< http://localhost/api/4.0/alerts/search?fields=id&limit=3&offset=9 >; rel="\tlast (end of line!)\t"`
const prevLink = `<\thttp://localhost/api/4.0/alerts/search?fields=id&limit=3&offset=3\n>;\nrel="prev"`
const nextLink = `<http://localhost/api/4.0/alerts/search?fields=id&limit=3&offset=6>; rel="next"`
const allLinks = `${firstLink},${lastLink},${prevLink},${nextLink}`

describe('pagination', () => {
  describe('linkHeaderParser', () => {
    it('parses all links', () => {
      const actual = linkHeaderParser(allLinks)
      const keys = Object.keys(actual)
      expect(keys).toEqual(['first', 'last', 'prev', 'next'])
      expect(actual.first.rel).toEqual('first')
      expect(actual.first.url).toEqual(
        'http://localhost/api/4.0/alerts/search?fields=id&limit=3&offset=0'
      )
      expect(actual.last.rel).toEqual('last')
      expect(actual.last.url).toEqual(
        'http://localhost/api/4.0/alerts/search?fields=id&limit=3&offset=9'
      )
      expect(actual.last.name).toEqual('last (end of line!)')
      expect(actual.next.rel).toEqual('next')
      expect(actual.next.url).toEqual(
        'http://localhost/api/4.0/alerts/search?fields=id&limit=3&offset=6'
      )
      expect(actual.prev.rel).toEqual('prev')
      expect(actual.prev.url).toEqual(
        'http://localhost/api/4.0/alerts/search?fields=id&limit=3&offset=3'
      )
    })

    it('gets first only', () => {
      const actual = linkHeaderParser(firstLink)
      const keys = Object.keys(actual)
      expect(keys).toEqual(['first'])
      expect(actual.first.rel).toEqual('first')
      expect(actual.first.url).toEqual(
        'http://localhost/api/4.0/alerts/search?fields=id&limit=3&offset=0'
      )
    })
  })
})
