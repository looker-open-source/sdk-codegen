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
import { PythonFormatter } from './python.fmt'

const apiModel = Models.ApiModel.fromFile('./Looker.3.1.oas.json')

const fmt = new PythonFormatter(apiModel)
const indent = ''

describe('python formatter', () => {
  describe('parameter declarations', () => {
    it('required parameter', () => {
      const param = apiModel.methods['run_query'].params[0]
      const actual = fmt.declareParameter(indent, param)
      expect(actual).toEqual('# Id of query\nquery_id: int')
    })
    it('optional parameter', () => {
      const param = apiModel.methods['run_query'].params[2]
      const actual = fmt.declareParameter(indent, param)
      expect(actual).toEqual('# Row limit (may override the limit in the saved query).\n' +
        'limit: Optional[int] = None')
    })
    it('required typed parameter', () => {
      const param = apiModel.methods['create_query_render_task'].params[2]
      const actual = fmt.declareParameter(indent, param)
      expect(actual).toEqual(`# Output width in pixels\nwidth: int`)
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
      // TODO get resolution working correctly
      const method = apiModel.methods['create_query']
      expect(method.pathArgs).toEqual([])
      const body = method.getParams('body')
      expect(body.length).toEqual(1)
      expect(body[0].type.name).toEqual('Query')
      expect(method.bodyArg).toEqual('body')
      expect(method.queryArgs).toEqual(['fields'])
      expect(method.headerArgs).toEqual([])
      expect(method.cookieArgs).toEqual([])
    })
    it('body for create_dashboard', () => {
      // TODO get resolution working correctly
      const method = apiModel.methods['create_dashboard']
      expect(method.pathArgs).toEqual([])
      const body = method.getParams('body')
      expect(body.length).toEqual(1)
      expect(body[0].type.name).toEqual('Dashboard')
      expect(method.bodyArg).toEqual('body')
      expect(method.queryArgs).toEqual([])
      expect(method.headerArgs).toEqual([])
      expect(method.cookieArgs).toEqual([])
    })
  })

  describe('httpArgs', () => {
    it('add_group_group', () => {
      const method = apiModel.methods['add_group_group']
      const args = fmt.httpArgs('', method).trim()
      expect(args).toEqual('models.Group, body=body')
    })
    it('create_query', () => {
      const method = apiModel.methods['create_query']
      const args = fmt.httpArgs('', method).trim()
      expect(args).toEqual('models.Query, query_params={"fields": fields}, body=body')
    })
    it('create_dashboard', () => {
      const method = apiModel.methods['create_dashboard']
      const args = fmt.httpArgs('', method).trim()
      expect(args).toEqual('models.Dashboard, body=body')
    })
  })

  describe('method signature', () => {
    it('no params with all_datagroups', () => {
      const method = apiModel.methods['all_datagroups']
      const expected =
`# GET /datagroups -> Sequence[models.Datagroup]
def all_datagroups(
    self
) -> Sequence[models.Datagroup]:
`
      const actual = fmt.methodSignature('', method)
      expect(actual).toEqual(expected)
    })
  })

  describe('method body', () => {
    it('assert response is model add_group_group', () => {
      const method = apiModel.methods['add_group_group']
      const expected =
`response = self.post(f"/groups/{group_id}/groups", models.Group, body=body)
assert isinstance(response, models.Group)
return response`
      const actual = fmt.httpCall(indent, method)
      expect(actual).toEqual(expected)
    })
    it('assert response is None delete_group_from_group', () => {
      const method = apiModel.methods['delete_group_from_group']
      const expected =
`response = self.delete(f"/groups/{group_id}/groups/{deleting_group_id}")
assert response is None
return response`
      const actual = fmt.httpCall(indent, method)
      expect(actual).toEqual(expected)
    })
    it('assert response is list active_themes', () => {
      const method = apiModel.methods['active_themes']
      const expected =
`response = self.get(f"/themes/active", Sequence[models.Theme], query_params={"name": name, "ts": ts, "fields": fields})
assert isinstance(response, list)
return response`
      const actual = fmt.httpCall(indent, method)
      expect(actual).toEqual(expected)
    })
    it('assert response is dict query_task_results', () => {
      const method = apiModel.methods['query_task_results']
      const expected =
`response = self.get(f"/query_tasks/{query_task_id}/results", MutableMapping[str, str])
assert isinstance(response, dict)
return response`
      const actual = fmt.httpCall(indent, method)
      expect(actual).toEqual(expected)
    })
  })

  describe('type creation', () => {
    it('with arrays and hashes', () => {
      const type = apiModel.types['Workspace']
      const actual = fmt.declareType(indent, type)
      expect(actual).toEqual(`
@attr.s(auto_attribs=True, kw_only=True)
class Workspace(model.Model):
    """
    Attributes:
        id : The unique id of this user workspace. Predefined workspace ids include "production" and "dev"
        projects : The local state of each project in the workspace
        can : Operations the current user is able to perform on this object
    """
    # The unique id of this user workspace. Predefined workspace ids include "production" and "dev"
    id: Optional[str] = None
    # The local state of each project in the workspace
    projects: Optional[Sequence["Project"]] = None
    # Operations the current user is able to perform on this object
    can: Optional[MutableMapping[str, bool]] = None`)
    })
    it('with refs, arrays and nullable', () => {
      const type = apiModel.types['ApiVersion']
      const actual = fmt.declareType(indent, type)
      expect(actual).toEqual(`
@attr.s(auto_attribs=True, kw_only=True)
class ApiVersion(model.Model):
    """
    Attributes:
        looker_release_version : Current Looker release version number
        current_version :
        supported_versions : Array of versions supported by this Looker instance
    """
    # Current Looker release version number
    looker_release_version: Optional[str] = None
    current_version: Optional["ApiVersionElement"] = None
    # Array of versions supported by this Looker instance
    supported_versions: Optional[Sequence["ApiVersionElement"]] = None`)
    })
    it('write model', () => {
      // cause dynamic WriteApiSession
      const method = apiModel.methods['create_query_task']
      const param = method.bodyParams[0]
      fmt.declareParameter(indent, param)

      const writeType = apiModel.types['WriteCreateQueryTask']
      const actual = fmt.declareType(indent, writeType)
      expect(actual).toEqual(`
@attr.s(auto_attribs=True, kw_only=True, init=False)
class WriteCreateQueryTask(model.Model):
    """
    Dynamically generated writeable type for CreateQueryTask

    Attributes:
        query_id : Id of query to run
        result_format : Desired result format
        source : Source of query task
        deferred : Create the task but defer execution
        look_id : Id of look associated with query.
        dashboard_id : Id of dashboard associated with query.
    """
    # Id of query to run
    query_id: int
    # Desired result format
    result_format: str
    # Source of query task
    source: Optional[str] = None
    # Create the task but defer execution
    deferred: Optional[bool] = None
    # Id of look associated with query.
    look_id: Optional[int] = None
    # Id of dashboard associated with query.
    dashboard_id: Optional[str] = None

    def __init__(self, *, query_id: int, result_format: str, source: Optional[str] = None, deferred: Optional[bool] = None, look_id: Optional[int] = None, dashboard_id: Optional[str] = None):
        self.query_id = query_id
        self.result_format = result_format
        self.source = source
        self.deferred = deferred
        self.look_id = look_id
        self.dashboard_id = dashboard_id
        self.__attrs_post_init__()`)
    })
  })
})
