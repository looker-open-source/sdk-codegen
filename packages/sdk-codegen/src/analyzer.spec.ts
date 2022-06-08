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

import { TestConfig } from './testUtils'
import { relatedIds, typeFromId, relatedTypes, relations } from './analyzer'

const config = TestConfig()
const apiTestModel = config.apiTestModel

describe('analyzer', () => {
  describe('relatedIds', () => {
    it('finds related ids', () => {
      const dashboard = apiTestModel.types.Dashboard
      const actual = relatedIds(dashboard)
      expect(actual).toHaveLength(6)
    })
  })

  describe('typeFromId', () => {
    it('finds valid types', () => {
      let actual = typeFromId(apiTestModel, 'content_favorite_id')
      expect(actual?.name).toEqual('ContentFavorite')
      actual = typeFromId(apiTestModel, 'dashboard_element_id')
      expect(actual?.name).toEqual('DashboardElement')
    })
    it('returns undefined for invalid types', () => {
      let actual = typeFromId(apiTestModel, 'deleter_id')
      expect(actual).toBeUndefined()
      // Sadly, the corresponding type is `ContentMeta`, breaking the convention
      actual = typeFromId(apiTestModel, 'content_metadata_id')
      expect(actual?.name).toBeUndefined()
    })
  })

  describe('relatedTypes', () => {
    it('finds related types', () => {
      const dashboard = apiTestModel.types.Dashboard
      const actual = relatedTypes(apiTestModel, dashboard)
      // only 9 because `deleter_id` can't be resolved to a type
      // and one type is writeable, which shouldn't be included
      expect(actual).toHaveLength(9)
    })
  })

  describe('relations', () => {
    it('relations handles recursion', () => {
      const dashboard = apiTestModel.types.Dashboard
      const actual = relations(apiTestModel, dashboard)
      expect(actual).toHaveLength(9)
    })
  })
})
