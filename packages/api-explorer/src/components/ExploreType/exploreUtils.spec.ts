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

import { api40 as api } from '../../test-data'
import { expandable, pickType, pickTypeProps, typeIcon } from './exploreUtils'

describe('exploreUtils', () => {
  test('pickType', () => {
    const method = api.methods.connection_tables
    const responseType = method.primaryResponse.type
    const type = pickType(responseType)
    expect(type).toBeDefined()
    expect(type.fullName).toEqual('SchemaTables')
    const props = pickTypeProps(responseType)
    expect(props).toBeDefined()
    const names = Object.keys(props)
    expect(names).toEqual(['name', 'is_default', 'tables'])
  })

  test('iconType', () => {
    const type = api.types.BoardSection
    const actual = typeIcon(type)
    expect(actual).toEqual({ icon: 'Code', title: 'BoardSection' })
    const props = type.properties
    expect(typeIcon(props.can.type)).toEqual({
      icon: 'IdeFileManifest',
      title: 'Hash[boolean]',
    })
    expect(typeIcon(props.created_at.type)).toEqual({
      icon: 'FieldDate',
      title: 'datetime',
    })
    expect(typeIcon(props.description.type)).toEqual({
      icon: 'FieldString',
      title: 'string',
    })
    expect(typeIcon(props.id.type)).toEqual({
      icon: 'FieldNumber',
      title: 'int64',
    })
  })

  describe('expandable', () => {
    test('maxDepth -1 is always expandable', () => {
      expect(expandable(20, -1)).toEqual(true)
    })
    test('maxDepth 0 is never expandable', () => {
      expect(expandable(1, 0)).toEqual(false)
    })
    test('maxDepth 2 is expandable 2 levels deep', () => {
      expect(expandable(0, 2)).toEqual(true)
      expect(expandable(1, 2)).toEqual(true)
      expect(expandable(2, 2)).toEqual(true)
      expect(expandable(3, 2)).toEqual(false)
    })
  })
})
