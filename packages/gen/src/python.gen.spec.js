"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var python_gen_1 = require("./python.gen");
// @ts-ignore
var testUtils_1 = require("../../script/testUtils");
var gen = new python_gen_1.PythonGen(testUtils_1.apiTestModel);
var indent = '';
describe('python generator', function () {
    describe('parameter declarations', function () {
        it('required parameter', function () {
            var param = testUtils_1.apiTestModel.methods['run_query'].params[0];
            var actual = gen.declareParameter(indent, param);
            expect(actual).toEqual('# Id of query\nquery_id: int');
        });
        it('optional parameter', function () {
            var param = testUtils_1.apiTestModel.methods['run_query'].params[2];
            var actual = gen.declareParameter(indent, param);
            expect(actual).toEqual('# Row limit (may override the limit in the saved query).\n' +
                'limit: Optional[int] = None');
        });
        it('required typed parameter', function () {
            var param = testUtils_1.apiTestModel.methods['create_query_render_task'].params[2];
            var actual = gen.declareParameter(indent, param);
            expect(actual).toEqual("# Output width in pixels\nwidth: int");
        });
    });
    describe('args locations', function () {
        it('path and query args', function () {
            var method = testUtils_1.apiTestModel.methods['run_query'];
            expect(method.pathArgs).toEqual(['query_id', 'result_format']);
            expect(method.bodyArg).toEqual('');
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
            ]);
            expect(method.headerArgs).toEqual([]);
            expect(method.cookieArgs).toEqual([]);
        });
        it('body for create_query', function () {
            // TODO get resolution working correctly
            var method = testUtils_1.apiTestModel.methods['create_query'];
            expect(method.pathArgs).toEqual([]);
            var body = method.getParams('body');
            expect(body.length).toEqual(1);
            expect(body[0].type.name).toEqual('Query');
            expect(method.bodyArg).toEqual('body');
            expect(method.queryArgs).toEqual(['fields']);
            expect(method.headerArgs).toEqual([]);
            expect(method.cookieArgs).toEqual([]);
        });
        it('body for create_dashboard', function () {
            // TODO get resolution working correctly
            var method = testUtils_1.apiTestModel.methods['create_dashboard'];
            expect(method.pathArgs).toEqual([]);
            var body = method.getParams('body');
            expect(body.length).toEqual(1);
            expect(body[0].type.name).toEqual('Dashboard');
            expect(method.bodyArg).toEqual('body');
            expect(method.queryArgs).toEqual([]);
            expect(method.headerArgs).toEqual([]);
            expect(method.cookieArgs).toEqual([]);
        });
    });
    describe('httpArgs', function () {
        it('add_group_group', function () {
            var method = testUtils_1.apiTestModel.methods['add_group_group'];
            var args = gen.httpArgs('', method).trim();
            var expected = "f\"/groups/{group_id}/groups\",\n            models.Group,\n            body=body,\n            transport_options=transport_options";
            expect(args).toEqual(expected);
        });
        it('create_query', function () {
            var method = testUtils_1.apiTestModel.methods['create_query'];
            var args = gen.httpArgs('', method).trim();
            var expected = "f\"/queries\",\n            models.Query,\n            query_params={\"fields\": fields},\n            body=body,\n            transport_options=transport_options";
            expect(args).toEqual(expected);
        });
        it('create_dashboard', function () {
            var method = testUtils_1.apiTestModel.methods['create_dashboard'];
            var args = gen.httpArgs('', method).trim();
            var expected = "f\"/dashboards\",\n            models.Dashboard,\n            body=body,\n            transport_options=transport_options";
            expect(args).toEqual(expected);
        });
    });
    describe('method signature', function () {
        it('no params with all_datagroups', function () {
            var method = testUtils_1.apiTestModel.methods['all_datagroups'];
            var expected = "# ### Get information about all datagroups.\n# \n# GET /datagroups -> Sequence[models.Datagroup]\ndef all_datagroups(\n    self,\n    transport_options: Optional[transport.PTransportSettings] = None,\n) -> Sequence[models.Datagroup]:\n";
            var actual = gen.methodSignature('', method);
            expect(actual).toEqual(expected);
        });
        it('binary return type render_task_results', function () {
            var method = testUtils_1.apiTestModel.methods['render_task_results'];
            var expected = "# ### Get the document or image produced by a completed render task.\n# \n# Note that the PDF or image result will be a binary blob in the HTTP response, as indicated by the\n# Content-Type in the response headers. This may require specialized (or at least different) handling than text\n# responses such as JSON. You may need to tell your HTTP client that the response is binary so that it does not\n# attempt to parse the binary data as text.\n# \n# If the render task exists but has not finished rendering the results, the response HTTP status will be\n# **202 Accepted**, the response body will be empty, and the response will have a Retry-After header indicating\n# that the caller should repeat the request at a later time.\n# \n# Returns 404 if the render task cannot be found, if the cached result has expired, or if the caller\n# does not have permission to view the results.\n# \n# For detailed information about the status of the render task, use [Render Task](#!/RenderTask/render_task).\n# Polling loops waiting for completion of a render task would be better served by polling **render_task(id)** until\n# the task status reaches completion (or error) instead of polling **render_task_results(id)** alone.\n# \n# GET /render_tasks/{render_task_id}/results -> bytes\ndef render_task_results(\n    self,\n    # Id of render task\n    render_task_id: str,\n    transport_options: Optional[transport.PTransportSettings] = None,\n) -> bytes:\n";
            var actual = gen.methodSignature('', method);
            expect(actual).toEqual(expected);
        });
        it('binary or string return type run_url_encoded_query', function () {
            var method = testUtils_1.apiTestModel.methods['run_url_encoded_query'];
            var expected = "# ### Run an URL encoded query.\n# \n# This requires the caller to encode the specifiers for the query into the URL query part using\n# Looker-specific syntax as explained below.\n# \n# Generally, you would want to use one of the methods that takes the parameters as json in the POST body\n# for creating and/or running queries. This method exists for cases where one really needs to encode the\n# parameters into the URL of a single 'GET' request. This matches the way that the Looker UI formats\n# 'explore' URLs etc.\n# \n# The parameters here are very similar to the json body formatting except that the filter syntax is\n# tricky. Unfortunately, this format makes this method not currently callible via the 'Try it out!' button\n# in this documentation page. But, this is callable  when creating URLs manually or when using the Looker SDK.\n# \n# Here is an example inline query URL:\n# \n# ```\n# https://looker.mycompany.com:19999/api/3.0/queries/models/thelook/views/inventory_items/run/json?fields=category.name,inventory_items.days_in_inventory_tier,products.count&f[category.name]=socks&sorts=products.count+desc+0&limit=500&query_timezone=America/Los_Angeles\n# ```\n# \n# When invoking this endpoint with the Ruby SDK, pass the query parameter parts as a hash. The hash to match the above would look like:\n# \n# ```ruby\n# query_params =\n# {\n#   :fields => \"category.name,inventory_items.days_in_inventory_tier,products.count\",\n#   :\"f[category.name]\" => \"socks\",\n#   :sorts => \"products.count desc 0\",\n#   :limit => \"500\",\n#   :query_timezone => \"America/Los_Angeles\"\n# }\n# response = ruby_sdk.run_url_encoded_query('thelook','inventory_items','json', query_params)\n# \n# ```\n# \n# Again, it is generally easier to use the variant of this method that passes the full query in the POST body.\n# This method is available for cases where other alternatives won't fit the need.\n# \n# Supported formats:\n# \n# | result_format | Description\n# | :-----------: | :--- |\n# | json | Plain json\n# | json_detail | Row data plus metadata describing the fields, pivots, table calcs, and other aspects of the query\n# | csv | Comma separated values with a header\n# | txt | Tab separated values with a header\n# | html | Simple html\n# | md | Simple markdown\n# | xlsx | MS Excel spreadsheet\n# | sql | Returns the generated SQL rather than running the query\n# | png | A PNG image of the visualization of the query\n# | jpg | A JPG image of the visualization of the query\n# \n# GET /queries/models/{model_name}/views/{view_name}/run/{result_format} -> Union[str, bytes]\ndef run_url_encoded_query(\n    self,\n    # Model name\n    model_name: str,\n    # View name\n    view_name: str,\n    # Format of result\n    result_format: str,\n    transport_options: Optional[transport.PTransportSettings] = None,\n) -> Union[str, bytes]:\n";
            var actual = gen.methodSignature('', method);
            expect(actual).toEqual(expected);
        });
    });
    describe('method body', function () {
        it('asserts type of required input body params', function () {
            var method = testUtils_1.apiTestModel.methods['run_inline_query'];
            var expected = "assert isinstance(body, models.WriteQuery)\n";
            var actual = gen.bodyParamsTypeAssertions('', method.bodyParams);
            expect(actual).toEqual(expected);
        });
        it('encodes string path params', function () {
            var method = testUtils_1.apiTestModel.methods['run_url_encoded_query'];
            var expected = "model_name = self.encode_path_param(model_name)\nview_name = self.encode_path_param(view_name)\nresult_format = self.encode_path_param(result_format)\n";
            var actual = gen.encodePathParams('', method);
            expect(actual).toEqual(expected);
        });
        it('encodes only string path params', function () {
            var method = testUtils_1.apiTestModel.methods['run_look'];
            // should NOT escape look_id (int)
            var expected = 'result_format = self.encode_path_param(result_format)\n';
            var actual = gen.encodePathParams('', method);
            expect(actual).toEqual(expected);
        });
        it('asserts type of optional body params', function () {
            var method = testUtils_1.apiTestModel.methods["import_lookml_dashboard"];
            var expected = "if body:\n    assert isinstance(body, models.WriteDashboard)\n";
            var actual = gen.bodyParamsTypeAssertions('', method.bodyParams);
            expect(actual).toEqual(expected);
        });
        it('body type assertions have generic subscripts stripped away', function () {
            var sequenceBodyMethod = testUtils_1.apiTestModel.methods["set_role_groups"];
            var expected = "assert isinstance(body, Sequence)\n";
            var actual = gen.bodyParamsTypeAssertions('', sequenceBodyMethod.bodyParams);
            expect(actual).toEqual(expected);
            var mutableMappingBodyMethod = testUtils_1.apiTestModel.methods["fetch_remote_data_action_form"];
            expected = "assert isinstance(body, MutableMapping)\n";
            actual = gen.bodyParamsTypeAssertions('', mutableMappingBodyMethod.bodyParams);
            expect(actual).toEqual(expected);
        });
        it('does not assert type of query/path params', function () {
            var method = testUtils_1.apiTestModel.methods["lookml_model_explore"];
            var expected = '';
            var actual = gen.bodyParamsTypeAssertions('', method.bodyParams);
            expect(actual).toEqual(expected);
        });
        it('assert response is model add_group_group', function () {
            var method = testUtils_1.apiTestModel.methods['add_group_group'];
            var expected = "response = self.post(\n            f\"/groups/{group_id}/groups\",\n            models.Group,\n            body=body,\n            transport_options=transport_options\n)\nassert isinstance(response, models.Group)\nreturn response";
            var actual = gen.httpCall(indent, method);
            expect(actual).toEqual(expected);
        });
        it('assert response is None delete_group_from_group', function () {
            var method = testUtils_1.apiTestModel.methods['delete_group_from_group'];
            var expected = "response = self.delete(\n            f\"/groups/{group_id}/groups/{deleting_group_id}\",\n            None,\n            transport_options=transport_options\n)\nassert response is None\nreturn response";
            var actual = gen.httpCall(indent, method);
            expect(actual).toEqual(expected);
        });
        it('assert response is list active_themes', function () {
            var method = testUtils_1.apiTestModel.methods['active_themes'];
            var expected = "response = self.get(\n            f\"/themes/active\",\n            Sequence[models.Theme],\n            query_params={\"name\": name, \"ts\": ts, \"fields\": fields},\n            transport_options=transport_options\n)\nassert isinstance(response, list)\nreturn response";
            var actual = gen.httpCall(indent, method);
            expect(actual).toEqual(expected);
        });
        it('assert response is dict query_task_results', function () {
            var method = testUtils_1.apiTestModel.methods['query_task_results'];
            var expected = "response = self.get(\n            f\"/query_tasks/{query_task_id}/results\",\n            str,\n            transport_options=transport_options\n)\nassert isinstance(response, str)\nreturn response";
            var actual = gen.httpCall(indent, method);
            expect(actual).toEqual(expected);
        });
        it('assert response is bytes render_task_results', function () {
            var method = testUtils_1.apiTestModel.methods['render_task_results'];
            var expected = "response = self.get(\n            f\"/render_tasks/{render_task_id}/results\",\n            bytes,\n            transport_options=transport_options\n)\nassert isinstance(response, bytes)\nreturn response";
            var actual = gen.httpCall(indent, method);
            expect(actual).toEqual(expected);
        });
        it('assert response is bytes or str run_url_encoded_query', function () {
            var method = testUtils_1.apiTestModel.methods['run_url_encoded_query'];
            var expected = "response = self.get(\n            f\"/queries/models/{model_name}/views/{view_name}/run/{result_format}\",\n            Union[str, bytes],  # type: ignore\n            transport_options=transport_options\n)\nassert isinstance(response, (str, bytes))\nreturn response";
            var actual = gen.httpCall(indent, method);
            expect(actual).toEqual(expected);
        });
    });
    describe('type creation', function () {
        it('with arrays and hashes', function () {
            var type = testUtils_1.apiTestModel.types['Workspace'];
            var actual = gen.declareType(indent, type);
            expect(actual).toEqual("\n@attr.s(auto_attribs=True, kw_only=True)\nclass Workspace(model.Model):\n    \"\"\"\n    Attributes:\n        can: Operations the current user is able to perform on this object\n        id: The unique id of this user workspace. Predefined workspace ids include \"production\" and \"dev\"\n        projects: The local state of each project in the workspace\n    \"\"\"\n    can: Optional[MutableMapping[str, bool]] = None\n    id: Optional[str] = None\n    projects: Optional[Sequence[\"Project\"]] = None");
        });
        it('with refs, arrays and nullable', function () {
            var type = testUtils_1.apiTestModel.types['ApiVersion'];
            var actual = gen.declareType(indent, type);
            expect(actual).toEqual("\n@attr.s(auto_attribs=True, kw_only=True)\nclass ApiVersion(model.Model):\n    \"\"\"\n    Attributes:\n        looker_release_version: Current Looker release version number\n        current_version:\n        supported_versions: Array of versions supported by this Looker instance\n    \"\"\"\n    looker_release_version: Optional[str] = None\n    current_version: Optional[\"ApiVersionElement\"] = None\n    supported_versions: Optional[Sequence[\"ApiVersionElement\"]] = None");
        });
        it('input models', function () {
            // run method generation to populate inputTypes
            var method = testUtils_1.apiTestModel.methods['create_merge_query'];
            var param = method.bodyParams[0];
            gen.declareParameter(indent, param);
            var inputType = testUtils_1.apiTestModel.types['WriteMergeQuery'];
            var actual = gen.declareType(indent, inputType);
            expect(actual).toEqual("\n@attr.s(auto_attribs=True, kw_only=True, init=False)\nclass WriteMergeQuery(model.Model):\n    \"\"\"\n    Dynamically generated writeable type for MergeQuery\n\n    Attributes:\n        column_limit: Column Limit\n        dynamic_fields: Dynamic Fields\n        pivots: Pivots\n        sorts: Sorts\n        source_queries: Source Queries defining the results to be merged.\n        total: Total\n        vis_config: Visualization Config\n    \"\"\"\n    column_limit: Optional[str] = None\n    dynamic_fields: Optional[str] = None\n    pivots: Optional[Sequence[str]] = None\n    sorts: Optional[Sequence[str]] = None\n    source_queries: Optional[Sequence[\"MergeQuerySourceQuery\"]] = None\n    total: Optional[bool] = None\n    vis_config: Optional[MutableMapping[str, str]] = None\n\n    def __init__(self, *,\n            column_limit: Optional[str] = None,\n            dynamic_fields: Optional[str] = None,\n            pivots: Optional[Sequence[str]] = None,\n            sorts: Optional[Sequence[str]] = None,\n            source_queries: Optional[Sequence[\"MergeQuerySourceQuery\"]] = None,\n            total: Optional[bool] = None,\n            vis_config: Optional[MutableMapping[str, str]] = None):\n        self.column_limit = column_limit\n        self.dynamic_fields = dynamic_fields\n        self.pivots = pivots\n        self.sorts = sorts\n        self.source_queries = source_queries\n        self.total = total\n        self.vis_config = vis_config");
            var childInputType = testUtils_1.apiTestModel.types['MergeQuerySourceQuery'];
            var childActual = gen.declareType(indent, childInputType);
            expect(childActual).toEqual("\n@attr.s(auto_attribs=True, kw_only=True, init=False)\nclass MergeQuerySourceQuery(model.Model):\n    \"\"\"\n    Attributes:\n        merge_fields: An array defining which fields of the source query are mapped onto fields of the merge query\n        name: Display name\n        query_id: Id of the query to merge\n    \"\"\"\n    merge_fields: Optional[Sequence[\"MergeFields\"]] = None\n    name: Optional[str] = None\n    query_id: Optional[int] = None\n\n    def __init__(self, *,\n            merge_fields: Optional[Sequence[\"MergeFields\"]] = None,\n            name: Optional[str] = None,\n            query_id: Optional[int] = None):\n        self.merge_fields = merge_fields\n        self.name = name\n        self.query_id = query_id");
            var grandChildInputType = testUtils_1.apiTestModel.types['MergeFields'];
            var grandChildActual = gen.declareType(indent, grandChildInputType);
            expect(grandChildActual).toEqual("\n@attr.s(auto_attribs=True, kw_only=True, init=False)\nclass MergeFields(model.Model):\n    \"\"\"\n    Attributes:\n        field_name: Field name to map onto in the merged results\n        source_field_name: Field name from the source query\n    \"\"\"\n    field_name: Optional[str] = None\n    source_field_name: Optional[str] = None\n\n    def __init__(self, *,\n            field_name: Optional[str] = None,\n            source_field_name: Optional[str] = None):\n        self.field_name = field_name\n        self.source_field_name = source_field_name");
        });
    });
});
