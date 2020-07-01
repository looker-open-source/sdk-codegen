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
import { SwiftGen } from './swift.gen'

const config = TestConfig()
const apiTestModel = config.apiTestModel
const gen = new SwiftGen(apiTestModel)
const indent = ''

describe('swift generator', () => {
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
enum PermissionType: String, Codable {
    case view = "view"
    case edit = "edit"
}`
      expect(actual).toEqual(expected)
    })
  })

  describe('special symbols', () => {
    it('generates coding keys', () => {
      const type = apiTestModel.types.HyphenType
      const actual = gen.declareType(indent, type)
      const expected = `struct HyphenType: SDKModel {

    private enum CodingKeys : String, CodingKey {
        case project_name, project_digest = "project-digest", computation_time = "computation time"
    }
    /**
     * A normal variable name (read-only)
     */
    var project_name: String?
    /**
     * A hyphenated property name (read-only)
     */
    var project_digest: String?
    /**
     * A spaced out property name (read-only)
     */
    var computation_time: Float?
}`
      expect(actual).toEqual(expected)
    })
  })
})
