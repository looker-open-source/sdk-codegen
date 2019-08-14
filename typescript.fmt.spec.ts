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

import * as Models from "./sdkModels"
import {TypescriptFormatter} from "./typescript.fmt"

const apiModel = Models.ApiModel.fromFile('./Looker.3.1.oas.json')

const fmt = new TypescriptFormatter()
const indent = ''

describe('typescript formatter', () => {
  describe('parameter declarations', () => {
    it ('required parameter', () => {
      const param = apiModel.methods['run_query'].params[0]
      const actual =  fmt.declareParameter(indent, param)
      expect(actual).toEqual("# Id of query\nquery_id: number")
    })
    it ('optional parameter', () => {
      const param = apiModel.methods['run_query'].params[2]
      const actual =  fmt.declareParameter(indent, param)
      expect(actual).toEqual("# Row limit (may override the limit in the saved query).\n" +
        "limit?: string")
    })
    it ('required typed parameter', () => {
      const param = apiModel.methods['create_query_render_task'].params[2]
      const actual =  fmt.declareParameter(indent, param)
      expect(actual).toEqual(`# Output width in pixels\nwidth: number`)
    })
  })

  describe('args locations', () => {
    it ('path and query args', () => {
      const method = apiModel.methods['run_query']
      expect(method.pathArgs).toEqual(['query_id','result_format'])
      expect(method.bodyArg).toEqual('')
      expect(method.queryArgs).toEqual([
        "limit",
        "apply_formatting",
        "apply_vis",
        "cache",
        "image_width",
        "image_height",
        "generate_drill_links",
        "force_production",
        "cache_only",
        "path_prefix",
        "rebuild_pdts",
        "server_table_calcs",
      ])
      expect(method.headerArgs).toEqual([])
      expect(method.cookieArgs).toEqual([])
    })
    it ('body for create_query', () => {
      // TODO get resolution working correctly
      const method = apiModel.methods['create_query']
      expect(method.pathArgs).toEqual([])
      const body = method.getParams('body')
      expect(body.length).toEqual(1)
      expect(body[0].type.name).toEqual('WriterQuery')
      expect(method.bodyArg).toEqual("body")
      expect(method.queryArgs).toEqual(["fields"])
      expect(method.headerArgs).toEqual([])
      expect(method.cookieArgs).toEqual([])
    })
    it ('body for create_dashboard', () => {
      // TODO get resolution working correctly
      const method = apiModel.methods['create_dashboard']
      expect(method.pathArgs).toEqual([])
      const body = method.getParams('body')
      expect(body.length).toEqual(1)
      expect(body[0].type.name).toEqual('WriteDashboard')
      expect(method.bodyArg).toEqual("body")
      expect(method.queryArgs).toEqual([])
      expect(method.headerArgs).toEqual([])
      expect(method.cookieArgs).toEqual([])
    })
  })

  describe('httpArgs', () => {
    it ('add_group_group', () => {
      const method = apiModel.methods['add_group_group']
      const args = fmt.httpArgs('', method).trim()
      expect(args).toEqual("models.Group, body=body")
    })
    it ('create_query', () => {
      const method = apiModel.methods['create_query']
      const args = fmt.httpArgs('', method).trim()
      expect(args).toEqual('models.Query, query_params={"fields": fields}, body=body')
    })
    it ('create_dashboard', () => {
      const method = apiModel.methods['create_dashboard']
      const args = fmt.httpArgs('', method).trim()
      expect(args).toEqual("models.Dashboard, body=body")
    })
  })

  describe('method signature', () => {
    it ('no params with all_datagroups', () => {
      const method = apiModel.methods['all_datagroups']
      const expected = "# GET /datagroups -> Sequence[models.Datagroup]\ndef all_datagroups(\n    self\n) -> Sequence[models.Datagroup]:\n"
      const actual = fmt.methodSignature('', method)
      expect(actual).toEqual(expected)
    })
  })

  describe('method body', () => {
    it ('assert response is model add_group_group', () => {
      const method = apiModel.methods['add_group_group']
      const expected = 'response = self.post(f"/groups/{group_id}/groups", models.Group, body=body)\nassert isinstance(response, models.Group)\nreturn response'
      const actual = fmt.httpCall(indent, method)
      expect(actual).toEqual(expected)
    })
    it ('assert response is None delete_group_from_group', () => {
      const method = apiModel.methods['delete_group_from_group']
      const expected = 'response = self.delete(f"/groups/{group_id}/groups/{deleting_group_id}")\nassert response is None\nreturn response'
      const actual = fmt.httpCall(indent, method)
      expect(actual).toEqual(expected)
    })
    it ('assert response is list active_themes', () => {
      const method = apiModel.methods['active_themes']
      const expected = 'response = self.get(f"/themes/active", Sequence[models.Theme], query_params={"name": name, "ts": ts, "fields": fields})\nassert isinstance(response, list)\nreturn response'
      const actual = fmt.httpCall(indent, method)
      expect(actual).toEqual(expected)
    })
  })

  describe('type creation', () => {
    it ('request type with body', () => {
      const method = apiModel.methods['create_dashboard_render_task']
      const type = apiModel.getRequestType(method)
      expect(type).toBeDefined()
      if (type) {
        const property = type.properties['body']
        const actual = fmt.declareProperty(indent, property)
        expect(actual).toEqual(`// body parameter for dynamically created request type
body: Partial<ICreateDashboardRenderTask>`)
//         const actual = fmt.declareType(indent, type!)
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
    it ('with arrays and hashes', () => {
      const type = apiModel.types['Workspace']
      const actual = fmt.declareType(indent, type)
      expect(actual).toEqual('\n@attr.s(auto_attribs=True, kw_only=True)\nclass Workspace(model.Model):\n    """\n    Attributes:\n        id : The unique id of this user workspace. Predefined workspace ids include "production" and "dev"\n        projects : The local state of each project in the workspace\n        can : Operations the current user is able to perform on this object\n    """\n    # The unique id of this user workspace. Predefined workspace ids include "production" and "dev"\n    id: Optional[str] = None\n    # The local state of each project in the workspace\n    projects: Optional[Sequence["Project"]] = None\n    # Operations the current user is able to perform on this object\n    can: Optional[Sequence[bool]] = None')
    })
    it ('with refs, arrays and nullable', () => {
      const type = apiModel.types['ApiVersion']
      const actual = fmt.declareType(indent, type)
      expect(actual).toEqual('\n@attr.s(auto_attribs=True, kw_only=True)\nclass ApiVersion(model.Model):\n    """\n    Attributes:\n        looker_release_version : Current Looker release version number\n        current_version :\n        supported_versions : Array of versions supported by this Looker instance\n    """\n    # Current Looker release version number\n    looker_release_version: Optional[str] = None\n    current_version: Optional["ApiVersionElement"] = None\n    # Array of versions supported by this Looker instance\n    supported_versions: Optional[Sequence["ApiVersionElement"]] = None')
    })
  })
})
