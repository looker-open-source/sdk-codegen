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

import { api } from '../test-data'
import { buildMethodPath, buildPath, buildTypePath } from './path'

describe('path utils', () => {
  const testParam = 's=test'
  describe('buildMethodPath', () => {
    test('it builds a method path', () => {
      const path = buildMethodPath('3.1', 'Dashboard', 'create_dashboard')
      expect(path).toEqual('/3.1/methods/Dashboard/create_dashboard')
    })
    test('it builds a method path with params', () => {
      const path = buildMethodPath(
        '3.1',
        'Dashboard',
        'create_dashboard',
        testParam
      )
      expect(path).toEqual(
        `/3.1/methods/Dashboard/create_dashboard?${testParam}`
      )
    })
  })

  describe('buildTypePath', () => {
    test('it builds a type path', () => {
      const path = buildTypePath('3.1', 'Dashboard', 'WriteDashboard')
      expect(path).toEqual('/3.1/types/Dashboard/WriteDashboard')
    })
    test('it builds a type path with params', () => {
      const path = buildTypePath(
        '3.1',
        'Dashboard',
        'create_dashboard',
        testParam
      )
      expect(path).toEqual(`/3.1/types/Dashboard/create_dashboard?${testParam}`)
    })
  })

  describe('buildPath', () => {
    test('given a method it builds a method path', () => {
      const path = buildPath(api, api.methods.create_dashboard, '3.1')
      expect(path).toEqual('/3.1/methods/Dashboard/create_dashboard')
    })

    test('given a type it creates a type path', () => {
      const path = buildPath(api, api.types.Dashboard, '3.1')
      expect(path).toEqual('/3.1/types/Dashboard/Dashboard')
    })
  })
})
