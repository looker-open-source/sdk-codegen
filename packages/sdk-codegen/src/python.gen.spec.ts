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

import { TestConfig } from '@looker/test-utils'
import { PythonGen } from './python.gen'

const config = TestConfig()
const apiTestModel = config.apiTestModel
const gen = new PythonGen(apiTestModel)
const indent = ''

describe('python generator', () => {
  describe('parameter declarations', () => {
    it('required parameter', () => {
      const method = apiTestModel.methods.run_query
      const param = method.params[0]
      const actual = gen.declareParameter(indent, method, param)
      expect(actual).toEqual('# Id of query\nquery_id: int')
    })
    it('optional parameter', () => {
      const method = apiTestModel.methods.run_query
      const param = method.params[2]
      const actual = gen.declareParameter(indent, method, param)
      expect(actual).toEqual(
        '# Row limit (may override the limit in the saved query).\n' +
          'limit: Optional[int] = None'
      )
    })
    it('required typed parameter', () => {
      const method = apiTestModel.methods.create_query_render_task
      const param = method.params[2]
      const actual = gen.declareParameter(indent, method, param)
      expect(actual).toEqual(`# Output width in pixels\nwidth: int`)
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
      // TODO get resolution working correctly
      const method = apiTestModel.methods.create_query
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
      const method = apiTestModel.methods.create_dashboard
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
      const method = apiTestModel.methods.add_group_group
      const args = gen.httpArgs('', method).trim()
      const expected = `f"/groups/{group_id}/groups",
            models.Group,
            body=body,
            transport_options=transport_options`
      expect(args).toEqual(expected)
    })
    it('create_query', () => {
      const method = apiTestModel.methods.create_query
      const args = gen.httpArgs('', method).trim()
      const expected = `f"/queries",
            models.Query,
            query_params={"fields": fields},
            body=body,
            transport_options=transport_options`
      expect(args).toEqual(expected)
    })
    it('create_dashboard', () => {
      const method = apiTestModel.methods.create_dashboard
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
      const method = apiTestModel.methods.all_datagroups
      const expected = `# ### Get information about all datagroups.
# 
# GET /datagroups -> Sequence[models.Datagroup]
def all_datagroups(
    self,
    transport_options: Optional[transport.PTransportSettings] = None,
) -> Sequence[models.Datagroup]:
`
      const actual = gen.methodSignature('', method)
      expect(actual).toEqual(expected)
    })
    it('binary return type render_task_results', () => {
      const method = apiTestModel.methods.render_task_results
      const expected = `# ### Get the document or image produced by a completed render task.
# 
# Note that the PDF or image result will be a binary blob in the HTTP response, as indicated by the
# Content-Type in the response headers. This may require specialized (or at least different) handling than text
# responses such as JSON. You may need to tell your HTTP client that the response is binary so that it does not
# attempt to parse the binary data as text.
# 
# If the render task exists but has not finished rendering the results, the response HTTP status will be
# **202 Accepted**, the response body will be empty, and the response will have a Retry-After header indicating
# that the caller should repeat the request at a later time.
# 
# Returns 404 if the render task cannot be found, if the cached result has expired, or if the caller
# does not have permission to view the results.
# 
# For detailed information about the status of the render task, use [Render Task](#!/RenderTask/render_task).
# Polling loops waiting for completion of a render task would be better served by polling **render_task(id)** until
# the task status reaches completion (or error) instead of polling **render_task_results(id)** alone.
# 
# GET /render_tasks/{render_task_id}/results -> bytes
def render_task_results(
    self,
    # Id of render task
    render_task_id: str,
    transport_options: Optional[transport.PTransportSettings] = None,
) -> bytes:
`
      const actual = gen.methodSignature('', method)
      expect(actual).toEqual(expected)
    })

    it('binary or string return type run_url_encoded_query', () => {
      const method = apiTestModel.methods.run_url_encoded_query
      const expected = `# ### Run an URL encoded query.
# 
# This requires the caller to encode the specifiers for the query into the URL query part using
# Looker-specific syntax as explained below.
# 
# Generally, you would want to use one of the methods that takes the parameters as json in the POST body
# for creating and/or running queries. This method exists for cases where one really needs to encode the
# parameters into the URL of a single 'GET' request. This matches the way that the Looker UI formats
# 'explore' URLs etc.
# 
# The parameters here are very similar to the json body formatting except that the filter syntax is
# tricky. Unfortunately, this format makes this method not currently callible via the 'Try it out!' button
# in this documentation page. But, this is callable  when creating URLs manually or when using the Looker SDK.
# 
# Here is an example inline query URL:
# 
# \`\`\`
# https://looker.mycompany.com:19999/api/3.0/queries/models/thelook/views/inventory_items/run/json?fields=category.name,inventory_items.days_in_inventory_tier,products.count&f[category.name]=socks&sorts=products.count+desc+0&limit=500&query_timezone=America/Los_Angeles
# \`\`\`
# 
# When invoking this endpoint with the Ruby SDK, pass the query parameter parts as a hash. The hash to match the above would look like:
# 
# \`\`\`ruby
# query_params =
# {
#   :fields => "category.name,inventory_items.days_in_inventory_tier,products.count",
#   :"f[category.name]" => "socks",
#   :sorts => "products.count desc 0",
#   :limit => "500",
#   :query_timezone => "America/Los_Angeles"
# }
# response = ruby_sdk.run_url_encoded_query('thelook','inventory_items','json', query_params)
# 
# \`\`\`
# 
# Again, it is generally easier to use the variant of this method that passes the full query in the POST body.
# This method is available for cases where other alternatives won't fit the need.
# 
# Supported formats:
# 
# | result_format | Description
# | :-----------: | :--- |
# | json | Plain json
# | json_detail | Row data plus metadata describing the fields, pivots, table calcs, and other aspects of the query
# | csv | Comma separated values with a header
# | txt | Tab separated values with a header
# | html | Simple html
# | md | Simple markdown
# | xlsx | MS Excel spreadsheet
# | sql | Returns the generated SQL rather than running the query
# | png | A PNG image of the visualization of the query
# | jpg | A JPG image of the visualization of the query
# 
# GET /queries/models/{model_name}/views/{view_name}/run/{result_format} -> Union[str, bytes]
def run_url_encoded_query(
    self,
    # Model name
    model_name: str,
    # View name
    view_name: str,
    # Format of result
    result_format: str,
    transport_options: Optional[transport.PTransportSettings] = None,
) -> Union[str, bytes]:
`
      const actual = gen.methodSignature('', method)
      expect(actual).toEqual(expected)
    })
  })

  describe('method body', () => {
    it('asserts type of required input body params', () => {
      const method = apiTestModel.methods.run_inline_query
      const expected = `assert isinstance(body, models.WriteQuery)\n`
      const actual = gen.bodyParamsTypeAssertions('', method)
      expect(actual).toEqual(expected)
    })

    it('encodes string path params', () => {
      const method = apiTestModel.methods.run_url_encoded_query
      const expected = `model_name = self.encode_path_param(model_name)
view_name = self.encode_path_param(view_name)
result_format = self.encode_path_param(result_format)
`
      const actual = gen.encodePathParams('', method)
      expect(actual).toEqual(expected)
    })

    it('encodes only string path params', () => {
      const method = apiTestModel.methods.run_look
      // should NOT escape look_id (int)
      const expected = 'result_format = self.encode_path_param(result_format)\n'
      const actual = gen.encodePathParams('', method)
      expect(actual).toEqual(expected)
    })

    it('asserts type of optional body params', () => {
      const method = apiTestModel.methods.import_lookml_dashboard
      const expected = `if body:
    assert isinstance(body, models.WriteDashboard)
`
      const actual = gen.bodyParamsTypeAssertions('', method)
      expect(actual).toEqual(expected)
    })

    it('body type assertions have generic subscripts stripped away', () => {
      const sequenceBodyMethod = apiTestModel.methods.set_role_groups
      let expected = `assert isinstance(body, Sequence)\n`
      let actual = gen.bodyParamsTypeAssertions('', sequenceBodyMethod)
      expect(actual).toEqual(expected)

      const mutableMappingBodyMethod =
        apiTestModel.methods.fetch_remote_data_action_form
      expected = `assert isinstance(body, MutableMapping)\n`
      actual = gen.bodyParamsTypeAssertions('', mutableMappingBodyMethod)
      expect(actual).toEqual(expected)
    })

    it('does not assert type of query/path params', () => {
      const method = apiTestModel.methods.lookml_model_explore
      const expected = ''
      const actual = gen.bodyParamsTypeAssertions('', method)
      expect(actual).toEqual(expected)
    })

    it('assert response is model add_group_group', () => {
      const method = apiTestModel.methods.add_group_group
      const expected = `response = self.post(
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
      const method = apiTestModel.methods.delete_group_from_group
      const expected = `response = self.delete(
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
      const method = apiTestModel.methods.active_themes
      const expected = `response = self.get(
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
      const method = apiTestModel.methods.query_task_results
      const expected = `response = self.get(
            f"/query_tasks/{query_task_id}/results",
            str,
            transport_options=transport_options
)
assert isinstance(response, str)
return response`
      const actual = gen.httpCall(indent, method)
      expect(actual).toEqual(expected)
    })
    it('assert response is bytes render_task_results', () => {
      const method = apiTestModel.methods.render_task_results
      const expected = `response = self.get(
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
      const method = apiTestModel.methods.run_url_encoded_query
      const expected = `response = self.get(
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
      const type = apiTestModel.types.Workspace
      const actual = gen.declareType(indent, type)
      expect(actual).toEqual(`
@attr.s(auto_attribs=True, kw_only=True)
class Workspace(model.Model):
    """
    Attributes:
        can: Operations the current user is able to perform on this object
        id: The unique id of this user workspace. Predefined workspace ids include "production" and "dev"
        projects: The local state of each project in the workspace
    """
    can: Optional[MutableMapping[str, bool]] = None
    id: Optional[str] = None
    projects: Optional[Sequence["Project"]] = None`)
    })
    it('with refs, arrays and nullable', () => {
      const type = apiTestModel.types.ApiVersion
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
      const method = apiTestModel.methods.create_merge_query
      const param = method.bodyParams[0]
      gen.declareParameter(indent, method, param)

      const inputType = apiTestModel.types.WriteMergeQuery
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

      const childInputType = apiTestModel.types.MergeQuerySourceQuery
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

      const grandChildInputType = apiTestModel.types.MergeFields
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
