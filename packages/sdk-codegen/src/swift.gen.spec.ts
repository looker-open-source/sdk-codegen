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
 * Type of permission: "view" or "edit" Valid values are: "view", "edit". (Enum defined in ContentMetaGroupUser)
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
        case _project_name = "project_name"
        case _project_digest = "project-digest"
        case computation_time = "computation time"
    }
    private var _project_name: AnyString?
    /**
     * A normal variable name (read-only)
     */
    public var project_name: String? {
        get { _project_name?.value }
        set { _project_name = newValue.map(AnyString.init) }
    }

    private var _project_digest: AnyString?
    /**
     * A hyphenated property name (read-only)
     */
    public var project_digest: String? {
        get { _project_digest?.value }
        set { _project_digest = newValue.map(AnyString.init) }
    }

    /**
     * A spaced out property name (read-only)
     */
    public var computation_time: Float?

    public init(project_name: String? = nil, project_digest: String? = nil, computation_time: Float? = nil) {
        self._project_name = project_name.map(AnyString.init)
        self._project_digest = project_digest.map(AnyString.init)
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
        case _message = "message"
        case _status = "status"
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

    private var _message: AnyString?
    /**
     * Additional data from the test (read-only)
     */
    public var message: String? {
        get { _message?.value }
        set { _message = newValue.map(AnyString.init) }
    }

    private var _status: AnyString?
    /**
     * Either 'pass' or 'fail' (read-only)
     */
    public var status: String? {
        get { _status?.value }
        set { _status = newValue.map(AnyString.init) }
    }

    public init(can: StringDictionary<Bool>? = nil, id: String? = nil, message: String? = nil, status: String? = nil) {
        self.can = can
        self._id = id.map(AnyString.init)
        self._message = message.map(AnyString.init)
        self._status = status.map(AnyString.init)
    }

}`
      expect(actual).toEqual(expected)
    })

    it('required string ID properties use map to AnyString', () => {
      const type = apiTestModel.types.CreateFolder
      const actual = gen.declareType(indent, type)
      const expected = `public struct CreateFolder: SDKModel {

    private enum CodingKeys : String, CodingKey {
        case _name = "name"
        case _parent_id = "parent_id"
    }
    private var _name: AnyString
    /**
     * Unique Name
     */
    public var name: String {
        get { _name.value }
        set { _name = AnyString.init(newValue) }
    }

    private var _parent_id: AnyString
    /**
     * Id of Parent. If the parent id is null, this is a root-level entry
     */
    public var parent_id: String {
        get { _parent_id.value }
        set { _parent_id = AnyString.init(newValue) }
    }

    public init(name: String, parent_id: String) {
        self._name = AnyString.init(name)
        self._parent_id = AnyString.init(parent_id)
    }

    public init(_ name: String, _ parent_id: String) {
        self.init(name: name, parent_id: parent_id)
    }

}`
      expect(actual).toEqual(expected)
    })

    it('numeric ID properties use map to AnyInt', () => {
      const type = apiTestModel.types.AnyIntIds
      const actual = gen.declareType(indent, type)
      const expected = `public struct AnyIntIds: SDKModel {

    private enum CodingKeys : String, CodingKey {
        case _id = "id"
        case _user_id = "user_id"
    }
    private var _id: AnyInt
    /**
     * The unique id of this item (read-only)
     */
    public var id: Int {
        get { _id.value }
        set { _id = AnyInt.init(newValue) }
    }

    private var _user_id: AnyInt?
    /**
     * Test user id (read-only)
     */
    public var user_id: Int? {
        get { _user_id?.value }
        set { _user_id = newValue.map(AnyInt.init) }
    }

    public init(id: Int, user_id: Int? = nil) {
        self._id = AnyInt.init(id)
        self._user_id = user_id.map(AnyInt.init)
    }

    public init(_ id: Int, user_id: Int? = nil) {
        self.init(id: id, user_id: user_id)
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

    private enum CodingKeys : String, CodingKey {
        case target_url
        case _session_length = "session_length"
        case force_logout_login
    }
    /**
     * The complete URL of the Looker UI page to display in the embed context. For example, to display the dashboard with id 34, \`target_url\` would look like: \`https://mycompany.looker.com:9999/dashboards/34\`. \`target_uri\` MUST contain a scheme (HTTPS), domain name, and URL path. Port must be included if it is required to reach the Looker server from browser clients. If the Looker instance is behind a load balancer or other proxy, \`target_uri\` must be the public-facing domain name and port required to reach the Looker instance, not the actual internal network machine name of the Looker instance.
     */
    public var target_url: URI

    private var _session_length: AnyInt?
    /**
     * Number of seconds the SSO embed session will be valid after the embed session is started. Defaults to 300 seconds. Maximum session length accepted is 2592000 seconds (30 days).
     */
    public var session_length: Int64? {
        get { _session_length?.value }
        set { _session_length = newValue.map(AnyInt.init) }
    }

    /**
     * When true, the embed session will purge any residual Looker login state (such as in browser cookies) before creating a new login state with the given embed user info. Defaults to true.
     */
    public var force_logout_login: Bool?

    public init(target_url: URI, session_length: Int64? = nil, force_logout_login: Bool? = nil) {
        self.target_url = target_url
        self._session_length = session_length.map(AnyInt.init)
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

    private enum CodingKeys : String, CodingKey {
        case _color = "color"
        case _offset = "offset"
    }
    private var _color: AnyString?
    /**
     * CSS color string
     */
    public var color: String? {
        get { _color?.value }
        set { _color = newValue.map(AnyString.init) }
    }

    private var _offset: AnyInt?
    /**
     * Offset in continuous palette (0 to 100)
     */
    public var offset: Int64? {
        get { _offset?.value }
        set { _offset = newValue.map(AnyInt.init) }
    }

    public init(color: String? = nil, offset: Int64? = nil) {
        self._color = color.map(AnyString.init)
        self._offset = offset.map(AnyInt.init)
    }

}`
      expect(actual).toEqual(expected)
    })
  })
})
