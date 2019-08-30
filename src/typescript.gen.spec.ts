/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2019 Looker Data Sciences, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import * as Models from './sdkModels'
import { TypescriptGen } from './typescript.gen'

const apiModel = Models.ApiModel.fromFile('./Looker.3.1.oas.json')

const gen = new TypescriptGen(apiModel)
const indent = ''

describe('typescript formatter', () => {
  describe('parameter declarations', () => {
    it('required parameter', () => {
      const param = apiModel.methods['run_query'].params[0]
      const actual = gen.declareParameter(indent, param)
      expect(actual).toEqual('// Id of query\nquery_id: number')
    })
    it('optional parameter', () => {
      const param = apiModel.methods['run_query'].params[2]
      const actual = gen.declareParameter(indent, param)
      expect(actual).toEqual(`// Row limit (may override the limit in the saved query).
limit: number = 0`)
    })
    it('required typed parameter', () => {
      const param = apiModel.methods['create_query_render_task'].params[2]
      const actual = gen.declareParameter(indent, param)
      expect(actual).toEqual(`// Output width in pixels\nwidth: number`)
    })
  })

  describe('args locations', () => {
    it('path and query args', () => {
      const method = apiModel.methods['run_query']
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
      const method = apiModel.methods['create_query']
      expect(method.pathArgs).toEqual([])
      const body = method.getParams('body')
      expect(body.length).toEqual(1)
      expect(body[0].type.name).toEqual('Query')
      const param = gen.declareParameter(indent, body[0])
      expect(param).toEqual('body: Partial<IWriteQuery>')
      expect(method.bodyArg).toEqual('body')
      expect(method.queryArgs).toEqual(['fields'])
      expect(method.headerArgs).toEqual([])
      expect(method.cookieArgs).toEqual([])
    })

    it('body for create_dashboard', () => {
      const method = apiModel.methods['create_dashboard']
      expect(method.pathArgs).toEqual([])
      const body = method.getParams('body')
      expect(body.length).toEqual(1)
      expect(body[0].type.name).toEqual('Dashboard')
      const param = gen.declareParameter(indent, body[0])
      expect(param).toEqual('body: Partial<IWriteDashboard>')
      expect(method.bodyArg).toEqual('body')
      expect(method.queryArgs).toEqual([])
      expect(method.headerArgs).toEqual([])
      expect(method.cookieArgs).toEqual([])
    })
  })

  describe('httpArgs', () => {
    it('add_group_group', () => {
      const method = apiModel.methods['add_group_group']
      const args = gen.httpArgs('', method).trim()
      expect(args).toEqual('null, body')
    })
    it('create_query', () => {
      const method = apiModel.methods['create_query']
      const args = gen.httpArgs('', method).trim()
      expect(args).toEqual('{fields}, body')
    })
    it('create_dashboard', () => {
      const method = apiModel.methods['create_dashboard']
      const args = gen.httpArgs('', method).trim()
      expect(args).toEqual('null, body')
    })
  })

  describe('method signature', () => {
    it('no params with all_datagroups', () => {
      const method = apiModel.methods['all_datagroups']
      expect(method).toBeDefined()
      const expected = `// GET /datagroups -> IDatagroup[]
async all_datagroups(
) {
`
      const actual = gen.methodSignature('', method)
      expect(actual).toEqual(expected)
    })
  })

  describe('method body', () => {
    it('assert response is model add_group_group', () => {
      const method = apiModel.methods['add_group_group']
      const expected = 'return this.post<IGroup, IError>(encodeURI(`/groups/${group_id}/groups`), null, body)'
      const actual = gen.httpCall(indent, method)
      expect(actual).toEqual(expected)
    })
    it('assert response is None delete_group_from_group', () => {
      const method = apiModel.methods['delete_group_from_group']
      const expected = 'return this.delete<void, IError>(encodeURI(`/groups/${group_id}/groups/${deleting_group_id}`))'
      const actual = gen.httpCall(indent, method)
      expect(actual).toEqual(expected)
    })
    it('assert response is list active_themes', () => {
      const method = apiModel.methods['active_themes']
      const expected = `return this.get<ITheme[], IError>('/themes/active', 
  {name: request.name, ts: request.ts, fields: request.fields})`
      const actual = gen.httpCall(indent, method)
      expect(actual).toEqual(expected)
    })
  })

  describe('type creation', () => {
    it('request type with body', () => {
      const method = apiModel.methods['create_dashboard_render_task']
      const type = apiModel.getRequestType(method)
      expect(type).toBeDefined()
      if (type) {
        const property = type.properties['body']
        const actual = gen.declareProperty(indent, property)
        expect(actual).toEqual(`// body parameter for dynamically created request type
body: Partial<ICreateDashboardRenderTask>`)
//         const actual = gen.declareType(indent, type!)
//         expect(actual).toEqual(`// Dynamically generated request type for create_dashboard_render_task
// export interface IRequestcreate_dashboard_render_task{
//   // Id of dashboard to render
//   dashboard_id: number
//   // Output type: pdf, png, or jpg
//   result_format: string
//   body: Partial<ICreateDashboardRenderTask>
//   // Output width in pixels
//   width: number
//   // Output height in pixels
//   height: number
//   // Requested fields.
//   fields?: string
//   // Paper size for pdf
//   pdf_paper_size?: string
//   // Whether to render pdf in landscape
//   pdf_landscape?: boolean
// }`)
      }
    })
    it('with arrays and hashes', () => {
      const type = apiModel.types['Workspace']
      const actual = gen.declareType(indent, type)
      expect(actual).toEqual(`export interface IWorkspace{
  // The unique id of this user workspace. Predefined workspace ids include "production" and "dev"
  id: string
  // The local state of each project in the workspace
  projects?: IProject[]
  // Operations the current user is able to perform on this object
  can: IDictionary<boolean>
}`)
    })
    it('with refs, arrays and nullable', () => {
      const type = apiModel.types['ApiVersion']
      const actual = gen.declareType(indent, type)
      expect(actual).toEqual(`export interface IApiVersion{
  // Current Looker release version number
  looker_release_version?: string
  current_version: IApiVersionElement
  // Array of versions supported by this Looker instance
  supported_versions?: IApiVersionElement[]
}`)
    })
  })
})
