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
import { PythonGen } from './python.gen'

const apiModel = Models.ApiModel.fromFile('./Looker.3.1.oas.json', './Looker.3.1.json')

const gen = new PythonGen(apiModel)
const indent = ''

describe('python generator', () => {
  describe('parameter declarations', () => {
    it('required parameter', () => {
      const param = apiModel.methods['run_query'].params[0]
      const actual = gen.declareParameter(indent, param)
      expect(actual).toEqual('# Id of query\nquery_id: int')
    })
    it('optional parameter', () => {
      const param = apiModel.methods['run_query'].params[2]
      const actual = gen.declareParameter(indent, param)
      expect(actual).toEqual('# Row limit (may override the limit in the saved query).\n' +
        'limit: Optional[int] = None')
    })
    it('required typed parameter', () => {
      const param = apiModel.methods['create_query_render_task'].params[2]
      const actual = gen.declareParameter(indent, param)
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
      const args = gen.httpArgs('', method).trim()
      const expected = `f"/groups/{group_id}/groups",
            models.Group,
            body=body,
            transport_options=transport_options`
      expect(args).toEqual(expected)
    })
    it('create_query', () => {
      const method = apiModel.methods['create_query']
      const args = gen.httpArgs('', method).trim()
      const expected = `f"/queries",
            models.Query,
            query_params={"fields": fields},
            body=body,
            transport_options=transport_options`
      expect(args).toEqual(expected)
    })
    it('create_dashboard', () => {
      const method = apiModel.methods['create_dashboard']
      const args = gen.httpArgs('', method).trim()
      const expected = `f"/dashboards",
            models.Dashboard,
            body=body,
            transport_options=transport_options`
      expect(args).toEqual(expected)
    })
  })

  describe('method signature', () => {
    it('no params with all_datagroups', () => {
      const method = apiModel.methods['all_datagroups']
      const expected =
        `# GET /datagroups -> Sequence[models.Datagroup]
def all_datagroups(
    self,
    transport_options: Optional[transport.TransportSettings] = None,
) -> Sequence[models.Datagroup]:
`
      const actual = gen.methodSignature('', method)
      expect(actual).toEqual(expected)
    })
    it('binary return type render_task_results', () => {
      const method = apiModel.methods['render_task_results']
      const expected =
        `# GET /render_tasks/{render_task_id}/results -> bytes
def render_task_results(
    self,
    # Id of render task
    render_task_id: str,
    transport_options: Optional[transport.TransportSettings] = None,
) -> bytes:
`
      const actual = gen.methodSignature('', method)
      expect(actual).toEqual(expected)
    })
    it('binary or string return type run_url_encoded_query', () => {
      const method = apiModel.methods['run_url_encoded_query']
      const expected =
`# GET /queries/models/{model_name}/views/{view_name}/run/{result_format} -> Union[str, bytes]
def run_url_encoded_query(
    self,
    # Model name
    model_name: str,
    # View name
    view_name: str,
    # Format of result
    result_format: str,
    transport_options: Optional[transport.TransportSettings] = None,
) -> Union[str, bytes]:
`
      const actual = gen.methodSignature('', method)
      expect(actual).toEqual(expected)
    })
  })

  describe('method body', () => {
    it('assert response is model add_group_group', () => {
      const method = apiModel.methods['add_group_group']
      const expected =
`response = self.post(
            f"/groups/{group_id}/groups",
            models.Group,
            body=body,
            transport_options=transport_options
)
assert isinstance(response, models.Group)
return response`
      const actual = gen.httpCall(indent, method)
      expect(actual).toEqual(expected)
    })
    it('assert response is None delete_group_from_group', () => {
      const method = apiModel.methods['delete_group_from_group']
      const expected =
`response = self.delete(
            f"/groups/{group_id}/groups/{deleting_group_id}",
            None,
            transport_options=transport_options
)
assert response is None
return response`
      const actual = gen.httpCall(indent, method)
      expect(actual).toEqual(expected)
    })
    it('assert response is list active_themes', () => {
      const method = apiModel.methods['active_themes']
      const expected =
`response = self.get(
            f"/themes/active",
            Sequence[models.Theme],
            query_params={"name": name, "ts": ts, "fields": fields},
            transport_options=transport_options
)
assert isinstance(response, list)
return response`
      const actual = gen.httpCall(indent, method)
      expect(actual).toEqual(expected)
    })
    it('assert response is dict query_task_results', () => {
      const method = apiModel.methods['query_task_results']
      const expected =
`response = self.get(
            f"/query_tasks/{query_task_id}/results",
            MutableMapping[str, str],
            transport_options=transport_options
)
assert isinstance(response, dict)
return response`
      const actual = gen.httpCall(indent, method)
      expect(actual).toEqual(expected)
    })
    it('assert response is bytes render_task_results', () => {
      const method = apiModel.methods['render_task_results']
      const expected =
`response = self.get(
            f"/render_tasks/{render_task_id}/results",
            bytes,
            transport_options=transport_options
)
assert isinstance(response, bytes)
return response`
      const actual = gen.httpCall(indent, method)
      expect(actual).toEqual(expected)
    })
    it('assert response is bytes or str run_url_encoded_query', () => {
      const method = apiModel.methods['run_url_encoded_query']
      const expected =
`response = self.get(
            f"/queries/models/{model_name}/views/{view_name}/run/{result_format}",
            Union[str, bytes],  # type: ignore
            transport_options=transport_options
)
assert isinstance(response, (str, bytes))
return response`
      const actual = gen.httpCall(indent, method)
      expect(actual).toEqual(expected)
    })
  })

  describe('type creation', () => {
    it('with arrays and hashes', () => {
      const type = apiModel.types['Workspace']
      const actual = gen.declareType(indent, type)
      expect(actual).toEqual(`
@attr.s(auto_attribs=True, kw_only=True)
class Workspace(model.Model):
    """
    Attributes:
        id: The unique id of this user workspace. Predefined workspace ids include "production" and "dev"
        projects: The local state of each project in the workspace
        can: Operations the current user is able to perform on this object
    """
    id: Optional[str] = None
    projects: Optional[Sequence["Project"]] = None
    can: Optional[MutableMapping[str, bool]] = None`)
    })
    it('with refs, arrays and nullable', () => {
      const type = apiModel.types['ApiVersion']
      const actual = gen.declareType(indent, type)
      expect(actual).toEqual(`
@attr.s(auto_attribs=True, kw_only=True)
class ApiVersion(model.Model):
    """
    Attributes:
        looker_release_version: Current Looker release version number
        current_version:
        supported_versions: Array of versions supported by this Looker instance
    """
    looker_release_version: Optional[str] = None
    current_version: Optional["ApiVersionElement"] = None
    supported_versions: Optional[Sequence["ApiVersionElement"]] = None`)
    })
    it('input models', () => {
      // run method generation to populate inputTypes
      const method = apiModel.methods['create_merge_query']
      const param = method.bodyParams[0]
      gen.declareParameter(indent, param)

      const inputType = apiModel.types['WriteMergeQuery']
      const actual = gen.declareType(indent, inputType)
      expect(actual).toEqual(`
@attr.s(auto_attribs=True, kw_only=True, init=False)
class WriteMergeQuery(model.Model):
    """
    Dynamically generated writeable type for MergeQuery

    Attributes:
        column_limit: Column Limit
        dynamic_fields: Dynamic Fields
        pivots: Pivots
        sorts: Sorts
        source_queries: Source Queries defining the results to be merged.
        total: Total
        vis_config: Visualization Config
    """
    column_limit: Optional[str] = None
    dynamic_fields: Optional[str] = None
    pivots: Optional[Sequence[str]] = None
    sorts: Optional[Sequence[str]] = None
    source_queries: Optional[Sequence["MergeQuerySourceQuery"]] = None
    total: Optional[bool] = None
    vis_config: Optional[MutableMapping[str, str]] = None

    def __init__(self, *,
            column_limit: Optional[str] = None,
            dynamic_fields: Optional[str] = None,
            pivots: Optional[Sequence[str]] = None,
            sorts: Optional[Sequence[str]] = None,
            source_queries: Optional[Sequence["MergeQuerySourceQuery"]] = None,
            total: Optional[bool] = None,
            vis_config: Optional[MutableMapping[str, str]] = None):
        self.column_limit = column_limit
        self.dynamic_fields = dynamic_fields
        self.pivots = pivots
        self.sorts = sorts
        self.source_queries = source_queries
        self.total = total
        self.vis_config = vis_config`)

      const childInputType = apiModel.types['MergeQuerySourceQuery']
      const childActual = gen.declareType(indent, childInputType)
      expect(childActual).toEqual(`
@attr.s(auto_attribs=True, kw_only=True, init=False)
class MergeQuerySourceQuery(model.Model):
    """
    Attributes:
        merge_fields: An array defining which fields of the source query are mapped onto fields of the merge query
        name: Display name
        query_id: Id of the query to merge
    """
    merge_fields: Optional[Sequence["MergeFields"]] = None
    name: Optional[str] = None
    query_id: Optional[int] = None

    def __init__(self, *,
            merge_fields: Optional[Sequence["MergeFields"]] = None,
            name: Optional[str] = None,
            query_id: Optional[int] = None):
        self.merge_fields = merge_fields
        self.name = name
        self.query_id = query_id`)

      const grandChildInputType = apiModel.types['MergeFields']
      const grandChildActual = gen.declareType(indent, grandChildInputType)
      expect(grandChildActual).toEqual(`
@attr.s(auto_attribs=True, kw_only=True, init=False)
class MergeFields(model.Model):
    """
    Attributes:
        field_name: Field name to map onto in the merged results
        source_field_name: Field name from the source query
    """
    field_name: Optional[str] = None
    source_field_name: Optional[str] = None

    def __init__(self, *,
            field_name: Optional[str] = None,
            source_field_name: Optional[str] = None):
        self.field_name = field_name
        self.source_field_name = source_field_name`)
    })
  })
})