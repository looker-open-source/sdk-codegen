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
import {
  testErrorResponse,
  testHtmlResponse,
  testImageResponse,
  testJsonResponse,
  testTextResponse,
  testUnknownResponse,
} from '../../test-data'
import { pickResponseHandler } from './responseUtils'

describe('responseUtils', () => {
  test('it handles image/png', () => {
    const actual = pickResponseHandler(testImageResponse())
    expect(actual).toBeDefined()
    expect(actual.label).toEqual('img')
  })
  test('it handles image/jpeg', () => {
    const actual = pickResponseHandler(testImageResponse('image/jpeg'))
    expect(actual).toBeDefined()
    expect(actual.label).toEqual('img')
  })
  test('it handles image/svg+xml', () => {
    const actual = pickResponseHandler(testImageResponse('image/svg+xml'))
    expect(actual).toBeDefined()
    expect(actual.label).toEqual('img')
  })
  test('it handles json', () => {
    const actual = pickResponseHandler(testJsonResponse)
    expect(actual).toBeDefined()
    expect(actual.label).toEqual('json')
  })
  test('it handles text', () => {
    const actual = pickResponseHandler(testTextResponse)
    expect(actual).toBeDefined()
    expect(actual.label).toEqual('text')
  })
  test('it handles html', () => {
    const actual = pickResponseHandler(testHtmlResponse)
    expect(actual).toBeDefined()
    expect(actual.label).toEqual('html')
  })
  test('it handles unknown', () => {
    const actual = pickResponseHandler(testUnknownResponse)
    expect(actual).toBeDefined()
    expect(actual.label).toEqual('unknown')
  })
  test('it handles error', () => {
    const actual = pickResponseHandler(testErrorResponse)
    expect(actual).toBeDefined()
    expect(actual.label).toEqual('text')
  })
})
