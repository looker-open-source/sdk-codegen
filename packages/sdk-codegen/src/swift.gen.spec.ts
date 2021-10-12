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
import type { IEnumType } from './sdkModels'
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
      const expected = `/**
 * Type of permission: "view" or "edit" Valid values are: "view", "edit".
 */
public enum PermissionType: String, Codable {
    case view = "view"
    case edit = "edit"
}`
      const actual = gen.declareType('', type)
      expect(actual).toEqual(expected)
    })
    it('noComment enum type', () => {
      const type = apiTestModel.types.PermissionType as IEnumType
      expect(type).toBeDefined()
      expect(type.values).toEqual(['view', 'edit'])
      const expected = `public enum PermissionType: String, Codable {
    case view = "view"
    case edit = "edit"
}`
      gen.noComment = true
      const actual = gen.declareType('', type)
      gen.noComment = false
      expect(actual).toEqual(expected)
    })
  })

  describe('special handling', () => {
    it('generates coding keys for special property names', () => {
      const type = apiTestModel.types.HyphenType
      const actual = gen.declareType(indent, type)
      const expected = `public struct HyphenType: SDKModel {

    private enum CodingKeys : String, CodingKey {
        case project_name
        case project_digest = "project-digest"
        case computation_time = "computation time"
    }
    /**
     * A normal variable name (read-only)
     */
    public var project_name: String?

    /**
     * A hyphenated property name (read-only)
     */
    public var project_digest: String?

    /**
     * A spaced out property name (read-only)
     */
    public var computation_time: Float?

    public init(project_name: String? = nil, project_digest: String? = nil, computation_time: Float? = nil) {
        self.project_name = project_name
        self.project_digest = project_digest
        self.computation_time = computation_time
    }

}`
      expect(actual).toEqual(expected)
    })

    it('optional string ID properties use map to AnyString', () => {
      const type = apiTestModel.types.GitConnectionTestResult
      const actual = gen.declareType(indent, type)
      const expected = `public struct GitConnectionTestResult: SDKModel {

    private enum CodingKeys : String, CodingKey {
        case can
        case _id = "id"
        case message
        case status
    }
    /**
     * Operations the current user is able to perform on this object (read-only)
     */
    public var can: StringDictionary<Bool>?

    private var _id: AnyString?
    /**
     * A short string, uniquely naming this test (read-only)
     */
    public var id: String? {
        get { _id?.value }
        set { _id = newValue.map(AnyString.init) }
    }

    /**
     * Additional data from the test (read-only)
     */
    public var message: String?

    /**
     * Either 'pass' or 'fail' (read-only)
     */
    public var status: String?

    public init(can: StringDictionary<Bool>? = nil, id: String? = nil, message: String? = nil, status: String? = nil) {
        self.can = can
        self._id = id.map(AnyString.init)
        self.message = message
        self.status = status
    }

}`
      expect(actual).toEqual(expected)
    })

    it('required string ID properties use map to AnyString', () => {
      const type = apiTestModel.types.CreateFolder
      const actual = gen.declareType(indent, type)
      const expected = `public struct CreateFolder: SDKModel {

    private enum CodingKeys : String, CodingKey {
        case name
        case _parent_id = "parent_id"
    }
    /**
     * Unique Name
     */
    public var name: String

    private var _parent_id: AnyString
    /**
     * Id of Parent. If the parent id is null, this is a root-level entry
     */
    public var parent_id: String {
        get { _parent_id.value }
        set { _parent_id = AnyString.init(newValue) }
    }

    public init(name: String, parent_id: String) {
        self.name = name
        self._parent_id = AnyString.init(parent_id)
    }

    public init(_ name: String, _ parent_id: String) {
        self.init(name: name, parent_id: parent_id)
    }

}`
      expect(actual).toEqual(expected)
    })
  })

  describe('constructor', () => {
    it('generates public inits with required/positional and optional args', () => {
      const type = apiTestModel.types.EmbedParams
      const actual = gen.declareType(indent, type)
      const expected = `public struct EmbedParams: SDKModel {
    /**
     * The complete URL of the Looker UI page to display in the embed context. For example, to display the dashboard with id 34, \`target_url\` would look like: \`https://mycompany.looker.com:9999/dashboards/34\`. \`target_uri\` MUST contain a scheme (HTTPS), domain name, and URL path. Port must be included if it is required to reach the Looker server from browser clients. If the Looker instance is behind a load balancer or other proxy, \`target_uri\` must be the public-facing domain name and port required to reach the Looker instance, not the actual internal network machine name of the Looker instance.
     */
    public var target_url: URI

    /**
     * Number of seconds the SSO embed session will be valid after the embed session is started. Defaults to 300 seconds. Maximum session length accepted is 2592000 seconds (30 days).
     */
    public var session_length: Int64?

    /**
     * When true, the embed session will purge any residual Looker login state (such as in browser cookies) before creating a new login state with the given embed user info. Defaults to true.
     */
    public var force_logout_login: Bool?

    public init(target_url: URI, session_length: Int64? = nil, force_logout_login: Bool? = nil) {
        self.target_url = target_url
        self.session_length = session_length
        self.force_logout_login = force_logout_login
    }

    public init(_ target_url: URI, session_length: Int64? = nil, force_logout_login: Bool? = nil) {
        self.init(target_url: target_url, session_length: session_length, force_logout_login: force_logout_login)
    }

}`
      expect(actual).toEqual(expected)
    })
    it('generates one init for no required/positional args', () => {
      const type = apiTestModel.types.ColorStop
      const actual = gen.declareType(indent, type)
      const expected = `public struct ColorStop: SDKModel {
    /**
     * CSS color string
     */
    public var color: String?

    /**
     * Offset in continuous palette (0 to 100)
     */
    public var offset: Int64?

    public init(color: String? = nil, offset: Int64? = nil) {
        self.color = color
        self.offset = offset
    }

}`
      expect(actual).toEqual(expected)
    })
  })
})
