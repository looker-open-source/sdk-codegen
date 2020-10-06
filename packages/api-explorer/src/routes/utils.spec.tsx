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
import { api } from '../test-data'
import { validSpecKey, validTag, validMethod, validType } from './utils'

describe('route param validation', () => {
  describe('validateSpecKey', () => {
    test('it returns false for invalid spec key', () => {
      const actual = validSpecKey(api, 'foo')
      expect(actual).toEqual(false)
    })

    test('it returns true for valid spec keys', () => {
      const actual = validSpecKey(api, '3.1')
      expect(actual).toEqual(true)
    })
  })

  describe('validateTag', () => {
    test('it returns false for invalid tags', () => {
      const actual = validTag(api, 'foo')
      expect(actual).toEqual(false)
    })

    test('it returns true for valid tags', () => {
      const actual = validTag(api, 'Dashboard')
      expect(actual).toEqual(true)
    })
  })

  describe('validateMethod', () => {
    test('it returns false for invalid methods', () => {
      const actual = validMethod(api, 'foo')
      expect(actual).toEqual(false)
    })

    test('it returns true for valid methods', () => {
      const actual = validMethod(api, 'run_look')
      expect(actual).toEqual(true)
    })
  })

  describe('validateTypes', () => {
    test('it returns false for invalid types', () => {
      const actual = validType(api, 'foo')
      expect(actual).toEqual(false)
    })

    test('it returns true for valid types', () => {
      const actual = validType(api, 'Dashboard')
      expect(actual).toEqual(true)
    })
  })
})
