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
import { pickTooltipContent } from './utils'

describe('DocMethodSummary utils', () => {
  test.each`
    status            | expected
    ${'alpha'}        | ${'This alpha item is either for internal use, or not fully developed and may be significantly changed or completely removed in future releases.'}
    ${'beta'}         | ${'This beta item is under development and subject to change.'}
    ${'experimental'} | ${'This experimental item is not fully developed and may be significantly changed or completely removed in future releases.'}
    ${'deprecated'}   | ${'This item has been deprecated and will be removed in the future.'}
    ${'stable'}       | ${'This item is considered stable for this API version.'}
    ${'undocumented'} | ${'This is an internal-only item.'}
    ${'unknown'}      | ${'This item has no status associated with it.'}
  `(
    'pickTooltipContent returns correct $status item tooltip content',
    ({ status, expected }) => {
      const actual = pickTooltipContent(status)
      expect(actual).toEqual(expected)
    }
  )
})
