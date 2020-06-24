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
import { TypescriptGen } from './typescript.gen'
import { titleCase } from './sdkModels'

const config = TestConfig()
const apiTestModel = config.apiTestModel

const gen = new TypescriptGen(apiTestModel)
const indent = ''

describe('typescript generator', () => {
  it('comment header', () => {
    const text = 'line 1\nline 2'
    let actual = gen.commentHeader(indent, text)
    let expected = `/**
 * line 1
 * line 2
 */
`
    expect(actual).toEqual(expected)

    actual = gen.commentHeader(indent, text, ' ')
    expected = `/**

 line 1
 line 2

 */
`
    expect(actual).toEqual(expected)
  })

  describe('parameter declarations', () => {
    it('required parameter', () => {
      const method = apiTestModel.methods.run_query
      const param = method.params[0]
      const actual = gen.declareParameter(indent, method, param)
      expect(actual).toEqual(`/**
 * @param {number} query_id Id of query
 */
query_id: number`)
    })

    it('optional parameter', () => {
      const method = apiTestModel.methods.run_query
      const param = method.params[2]
      const actual = gen.declareParameter(indent, method, param)
      expect(actual).toEqual(`/**
 * @param {number} limit Row limit (may override the limit in the saved query).
 */
limit?: number`)
    })

    it('required typed parameter', () => {
      const method = apiTestModel.methods.create_query_render_task
      const param = method.params[2]
      const actual = gen.declareParameter(indent, method, param)
      expect(actual).toEqual(`/**
 * @param {number} width Output width in pixels
 */
width: number`)
    })

    it('csv formatted parameter', () => {
      const method = apiTestModel.methods.query_task_multi_results
      const param = method.params[0]
      const actual = gen.declareParameter(indent, method, param)
      expect(actual).toEqual(`/**
 * @param {DelimArray<string>} query_task_ids List of Query Task IDs
 */
query_task_ids: DelimArray<string>`)
    })
  })

  describe('args locations', () => {
    it('path and query args', () => {
      const method = apiTestModel.methods.run_query
      expect(method.pathArgs).toEqual(['query_id', 'result_format'])
      expect(method.bodyArg).toEqual('')
      expect(method.queryArgs).toEqual([
        'limit',
        'apply_formatting',
        'apply_vis',
        'cache',
        'image_width',
        'image_height',
        'generate_drill_links',
        'force_production',
        'cache_only',
        'path_prefix',
        'rebuild_pdts',
        'server_table_calcs',
      ])
      expect(method.headerArgs).toEqual([])
      expect(method.cookieArgs).toEqual([])
    })

    it('body for create_query', () => {
      const method = apiTestModel.methods.create_query
      expect(method.pathArgs).toEqual([])
      const body = method.getParams('body')
      expect(body.length).toEqual(1)
      expect(body[0].type.name).toEqual('Query')
      const param = gen.declareParameter(indent, method, body[0])
      expect(param).toEqual(`/**
 * @param {Partial<IWriteQuery>} body
 */
body: Partial<IWriteQuery>`)
      expect(method.bodyArg).toEqual('body')
      expect(method.queryArgs).toEqual(['fields'])
      expect(method.headerArgs).toEqual([])
      expect(method.cookieArgs).toEqual([])
    })

    it('body for create_dashboard', () => {
      const method = apiTestModel.methods.create_dashboard
      expect(method.pathArgs).toEqual([])
      const body = method.getParams('body')
      expect(body.length).toEqual(1)
      expect(body[0].type.name).toEqual('Dashboard')
      const param = gen.declareParameter(indent, method, body[0])
      expect(param).toEqual(`/**
 * @param {Partial<IWriteDashboard>} body
 */
body: Partial<IWriteDashboard>`)
      expect(method.bodyArg).toEqual('body')
      expect(method.queryArgs).toEqual([])
      expect(method.headerArgs).toEqual([])
      expect(method.cookieArgs).toEqual([])
    })
  })

  describe('httpArgs', () => {
    it('add_group_group', () => {
      const method = apiTestModel.methods.add_group_group
      const args = gen.httpArgs('', method).trim()
      expect(args).toEqual('null, body, options')
    })
    it('create_query', () => {
      const method = apiTestModel.methods.create_query
      const args = gen.httpArgs('', method).trim()
      expect(args).toEqual('{fields}, body, options')
    })
    it('create_dashboard', () => {
      const method = apiTestModel.methods.create_dashboard
      const args = gen.httpArgs('', method).trim()
      expect(args).toEqual('null, body, options')
    })
  })

  describe('method signature', () => {
    // TODO find a new method with an optional body, or modify these tests to use other non-Looker spec input
    it('optional body and additional param', () => {
      const method = apiTestModel.methods.create_user_credentials_email
      expect(method).toBeDefined()
      const expected = `/**
 * ### Email/password login information for the specified user.
 * 
 * POST /users/{user_id}/credentials_email -> ICredentialsEmail
 */
async create_user_credentials_email(
  /**
   * @param {number} user_id id of user
   */
  user_id: number,
  /**
   * @param {Partial<IWriteCredentialsEmail>} body
   */
  body: Partial<IWriteCredentialsEmail>,
  /**
   * @param {string} fields Requested fields.
   */
  fields?: string,
  options?: Partial<ITransportSettings>) {
`
      const actual = gen.methodSignature('', method)
      expect(actual).toEqual(expected)
    })
    it('no params', () => {
      const method = apiTestModel.methods.all_datagroups
      expect(method).toBeDefined()
      const expected = `/**
 * ### Get information about all datagroups.
 * 
 * GET /datagroups -> IDatagroup[]
 */
async all_datagroups(
  options?: Partial<ITransportSettings>) {
`
      const actual = gen.methodSignature('', method)
      expect(actual).toEqual(expected)
    })
  })

  describe('method body', () => {
    it('encodes string path params', () => {
      const method = apiTestModel.methods.run_url_encoded_query
      const expected = `  model_name = encodeParam(model_name)
  view_name = encodeParam(view_name)
  result_format = encodeParam(result_format)
`
      const actual = gen.encodePathParams('', method)
      expect(actual).toEqual(expected)
    })
    // TODO eventually add method that has a date type path param
    it('encodes only string or date path params', () => {
      const method = apiTestModel.methods.run_look
      // should NOT escape request.look_id (int)
      const expected =
        '  request.result_format = encodeParam(request.result_format)\n'
      const actual = gen.encodePathParams('', method)
      expect(actual).toEqual(expected)
    })
    it('assert response is model add_group_group', () => {
      const method = apiTestModel.methods.add_group_group
      const expected =
        // eslint-disable-next-line no-template-curly-in-string
        'return this.post<IGroup, IError>(`/groups/${group_id}/groups`, null, body, options)'
      const actual = gen.httpCall(indent, method)
      expect(actual).toEqual(expected)
    })
    it('assert response is None delete_group_from_group', () => {
      const method = apiTestModel.methods.delete_group_from_group
      const expected =
        // eslint-disable-next-line no-template-curly-in-string
        'return this.delete<void, IError>(`/groups/${group_id}/groups/${deleting_group_id}`, null, null, options)'
      const actual = gen.httpCall(indent, method)
      expect(actual).toEqual(expected)
    })
    it('assert response is list active_themes', () => {
      const method = apiTestModel.methods.active_themes
      const expected = `return this.get<ITheme[], IError>('/themes/active', 
  {name: request.name, ts: request.ts, fields: request.fields}, null, options)`
      const actual = gen.httpCall(indent, method)
      expect(actual).toEqual(expected)
    })
  })

  describe('type creation', () => {
    it('request type with body', () => {
      const method = apiTestModel.methods.create_dashboard_render_task
      const type = apiTestModel.getRequestType(method)
      expect(type).toBeDefined()
      if (type) {
        const dashboard_id = type.properties.dashboard_id
        const actual_dashboard_id = gen.declareProperty(indent, dashboard_id)
        expect(actual_dashboard_id).toEqual(`/**
 * Id of dashboard to render. The ID can be a LookML dashboard also.
 */
dashboard_id: string`)
        const body = type.properties.body
        const actual_body = gen.declareProperty(indent, body)
        expect(actual_body).toEqual(`/**
 * body parameter for dynamically created request type
 */
body: ICreateDashboardRenderTask`)
      }
    })
    it('with arrays and hashes', () => {
      const type = apiTestModel.types.Workspace
      const actual = gen.declareType(indent, type)
      expect(actual).toEqual(`export interface IWorkspace {
  /**
   * Operations the current user is able to perform on this object (read-only)
   */
  can?: IDictionary<boolean>
  /**
   * The unique id of this user workspace. Predefined workspace ids include "production" and "dev" (read-only)
   */
  id?: string
  /**
   * The local state of each project in the workspace (read-only)
   */
  projects?: IProject[]
}`)
    })
    it('with refs, arrays and nullable', () => {
      const type = apiTestModel.types.ApiVersion
      const actual = gen.declareType(indent, type)
      expect(actual).toEqual(`export interface IApiVersion {
  /**
   * Current Looker release version number (read-only)
   */
  looker_release_version?: string
  current_version?: IApiVersionElement
  /**
   * Array of versions supported by this Looker instance (read-only)
   */
  supported_versions?: IApiVersionElement[]
}`)
    })
    it('required properties', () => {
      const type = apiTestModel.types.CreateQueryTask
      const actual = gen.declareType(indent, type)
      const name = titleCase('result_format')
      expect(actual).toEqual(`export interface ICreateQueryTask {
  /**
   * Operations the current user is able to perform on this object (read-only)
   */
  can?: IDictionary<boolean>
  /**
   * Id of query to run
   */
  query_id: number
  /**
   * Desired async query result format. Valid values are: "inline_json", "json", "json_detail", "json_fe", "csv", "html", "md", "txt", "xlsx", "gsxml".
   */
  result_format: ${name}
  /**
   * Source of query task
   */
  source?: string
  /**
   * Create the task but defer execution
   */
  deferred?: boolean
  /**
   * Id of look associated with query.
   */
  look_id?: number
  /**
   * Id of dashboard associated with query.
   */
  dashboard_id?: string
}`)
    })

    describe('enums', () => {
      it('declaration', () => {
        const type =
          apiTestModel.types.CreateQueryTask.properties.result_format.type
        const actual = gen.declareType('', type)
        const name = titleCase('result_format')
        expect(actual).toEqual(`/**
 * Desired async query result format. Valid values are: "inline_json", "json", "json_detail", "json_fe", "csv", "html", "md", "txt", "xlsx", "gsxml".
 */
export enum ${name} {
  inline_json = 'inline_json',
  json = 'json',
  json_detail = 'json_detail',
  json_fe = 'json_fe',
  csv = 'csv',
  html = 'html',
  md = 'md',
  txt = 'txt',
  xlsx = 'xlsx',
  gsxml = 'gsxml'
}`)
      })
    })
  })
})
