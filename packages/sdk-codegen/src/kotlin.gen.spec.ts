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

import { TestConfig } from './testUtils'
import { IEnumType } from './sdkModels'
import { KotlinGen } from './kotlin.gen'

const config = TestConfig()
const apiTestModel = config.apiTestModel
const gen = new KotlinGen(apiTestModel)
const indent = ''

describe('Kotlin generator', () => {
  describe('comment header', () => {
    it('is empty with no comment', () => {
      expect(gen.commentHeader(indent, '')).toEqual('')
    })

    it('is four lines with a two line comment', () => {
      const expected = `/**
 * foo
 * bar
 */
`
      expect(gen.commentHeader(indent, 'foo\nbar')).toEqual(expected)
    })
  })

  describe('types', () => {
    it('enum type', () => {
      const type = apiTestModel.types.PermissionType as IEnumType
      expect(type).toBeDefined()
      expect(type.values).toEqual(['view', 'edit'])
      const actual = gen.declareType('', type)
      const expected = `/**
 * Type of permission: "view" or "edit" Valid values are: "view", "edit".
 */
enum class PermissionType : Serializable {
    view,
    edit
}`
      expect(actual).toEqual(expected)
    })

    it('special needs', () => {
      const type = apiTestModel.types.HyphenType
      const actual = gen.declareType('', type)
      const expected = `/**
 * @property project_name A normal variable name (read-only)
 * @property project_digest A hyphenated property name (read-only)
 * @property computation_time A spaced out property name (read-only)
 */
data class HyphenType (
    var project_name: String? = null,
    @get:JsonProperty("project-digest")
    @param:JsonProperty("project-digest")
    var project_digest: String? = null,
    @get:JsonProperty("computation time")
    @param:JsonProperty("computation time")
    var computation_time: Float? = null
) : Serializable`
      expect(actual).toEqual(expected)
    })
  })
})
