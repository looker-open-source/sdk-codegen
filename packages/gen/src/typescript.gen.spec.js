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
var typescript_gen_1 = require("./typescript.gen");
var testUtils_1 = require("../../script/testUtils");
var gen = new typescript_gen_1.TypescriptGen(testUtils_1.apiTestModel);
var indent = '';
describe('typescript generator', function () {
    it('comment header', function () {
        var text = 'line 1\nline 2';
        var actual = gen.commentHeader(indent, text);
        var expected = "/**\n * line 1\n * line 2\n */\n";
        expect(actual).toEqual(expected);
    });
    describe('parameter declarations', function () {
        it('required parameter', function () {
            var param = testUtils_1.apiTestModel.methods['run_query'].params[0];
            var actual = gen.declareParameter(indent, param);
            expect(actual).toEqual("/**\n * @param {number} query_id Id of query\n */\nquery_id: number");
        });
        it('optional parameter', function () {
            var param = testUtils_1.apiTestModel.methods['run_query'].params[2];
            var actual = gen.declareParameter(indent, param);
            expect(actual).toEqual("/**\n * @param {number} limit Row limit (may override the limit in the saved query).\n */\nlimit?: number");
        });
        it('required typed parameter', function () {
            var param = testUtils_1.apiTestModel.methods['create_query_render_task'].params[2];
            var actual = gen.declareParameter(indent, param);
            expect(actual).toEqual("/**\n * @param {number} width Output width in pixels\n */\nwidth: number");
        });
        it('csv formatted parameter', function () {
            var param = testUtils_1.apiTestModel.methods['query_task_multi_results'].params[0];
            var actual = gen.declareParameter(indent, param);
            expect(actual).toEqual("/**\n * @param {DelimArray<string>} query_task_ids List of Query Task IDs\n */\nquery_task_ids: DelimArray<string>");
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
            var method = testUtils_1.apiTestModel.methods['create_query'];
            expect(method.pathArgs).toEqual([]);
            var body = method.getParams('body');
            expect(body.length).toEqual(1);
            expect(body[0].type.name).toEqual('Query');
            var param = gen.declareParameter(indent, body[0]);
            expect(param).toEqual("/**\n * @param {Partial<IWriteQuery>} body\n */\nbody: Partial<IWriteQuery>");
            expect(method.bodyArg).toEqual('body');
            expect(method.queryArgs).toEqual(['fields']);
            expect(method.headerArgs).toEqual([]);
            expect(method.cookieArgs).toEqual([]);
        });
        it('body for create_dashboard', function () {
            var method = testUtils_1.apiTestModel.methods['create_dashboard'];
            expect(method.pathArgs).toEqual([]);
            var body = method.getParams('body');
            expect(body.length).toEqual(1);
            expect(body[0].type.name).toEqual('Dashboard');
            var param = gen.declareParameter(indent, body[0]);
            expect(param).toEqual("/**\n * @param {Partial<IWriteDashboard>} body\n */\nbody: Partial<IWriteDashboard>");
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
            expect(args).toEqual('null, body, options');
        });
        it('create_query', function () {
            var method = testUtils_1.apiTestModel.methods['create_query'];
            var args = gen.httpArgs('', method).trim();
            expect(args).toEqual('{fields}, body, options');
        });
        it('create_dashboard', function () {
            var method = testUtils_1.apiTestModel.methods['create_dashboard'];
            var args = gen.httpArgs('', method).trim();
            expect(args).toEqual('null, body, options');
        });
    });
    describe('method signature', function () {
        // TODO find a new method with an optional body, or modify these tests to use other non-Looker spec input
        it('optional body and additional param', function () {
            var method = testUtils_1.apiTestModel.methods['create_user_credentials_email'];
            expect(method).toBeDefined();
            var expected = "/**\n * ### Email/password login information for the specified user.\n * \n * POST /users/{user_id}/credentials_email -> ICredentialsEmail\n */\nasync create_user_credentials_email(\n  /**\n   * @param {number} user_id id of user\n   */\n  user_id: number,\n  /**\n   * @param {Partial<IWriteCredentialsEmail>} body\n   */\n  body: Partial<IWriteCredentialsEmail>,\n  /**\n   * @param {string} fields Requested fields.\n   */\n  fields?: string,\n  options?: Partial<ITransportSettings>) {\n";
            var actual = gen.methodSignature('', method);
            expect(actual).toEqual(expected);
        });
        it('no params', function () {
            var method = testUtils_1.apiTestModel.methods['all_datagroups'];
            expect(method).toBeDefined();
            var expected = "/**\n * ### Get information about all datagroups.\n * \n * GET /datagroups -> IDatagroup[]\n */\nasync all_datagroups(\n  options?: Partial<ITransportSettings>) {\n";
            var actual = gen.methodSignature('', method);
            expect(actual).toEqual(expected);
        });
    });
    describe('method body', function () {
        it('encodes string path params', function () {
            var method = testUtils_1.apiTestModel.methods['run_url_encoded_query'];
            var expected = "  model_name = encodeParam(model_name)\n  view_name = encodeParam(view_name)\n  result_format = encodeParam(result_format)\n";
            var actual = gen.encodePathParams('', method);
            expect(actual).toEqual(expected);
        });
        // TODO eventually add method that has a date type path param
        it('encodes only string or date path params', function () {
            var method = testUtils_1.apiTestModel.methods['run_look'];
            // should NOT escape request.look_id (int)
            var expected = '  request.result_format = encodeParam(request.result_format)\n';
            var actual = gen.encodePathParams('', method);
            expect(actual).toEqual(expected);
        });
        it('assert response is model add_group_group', function () {
            var method = testUtils_1.apiTestModel.methods['add_group_group'];
            var expected = 'return this.post<IGroup, IError>(`/groups/${group_id}/groups`, null, body, options)';
            var actual = gen.httpCall(indent, method);
            expect(actual).toEqual(expected);
        });
        it('assert response is None delete_group_from_group', function () {
            var method = testUtils_1.apiTestModel.methods['delete_group_from_group'];
            var expected = 'return this.delete<void, IError>(`/groups/${group_id}/groups/${deleting_group_id}`, null, null, options)';
            var actual = gen.httpCall(indent, method);
            expect(actual).toEqual(expected);
        });
        it('assert response is list active_themes', function () {
            var method = testUtils_1.apiTestModel.methods['active_themes'];
            var expected = "return this.get<ITheme[], IError>('/themes/active', \n  {name: request.name, ts: request.ts, fields: request.fields}, null, options)";
            var actual = gen.httpCall(indent, method);
            expect(actual).toEqual(expected);
        });
    });
    describe('type creation', function () {
        it('request type with body', function () {
            var method = testUtils_1.apiTestModel.methods['create_dashboard_render_task'];
            var type = testUtils_1.apiTestModel.getRequestType(method);
            expect(type).toBeDefined();
            if (type) {
                var dashboard_id = type.properties['dashboard_id'];
                var actual_dashboard_id = gen.declareProperty(indent, dashboard_id);
                expect(actual_dashboard_id).toEqual("/**\n * Id of dashboard to render. The ID can be a LookML dashboard also.\n */\ndashboard_id: string");
                var body = type.properties['body'];
                var actual_body = gen.declareProperty(indent, body);
                expect(actual_body).toEqual("/**\n * body parameter for dynamically created request type\n */\nbody: ICreateDashboardRenderTask");
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
        });
        it('with arrays and hashes', function () {
            var type = testUtils_1.apiTestModel.types['Workspace'];
            var actual = gen.declareType(indent, type);
            expect(actual).toEqual("export interface IWorkspace{\n  /**\n   * Operations the current user is able to perform on this object (read-only)\n   */\n  can?: IDictionary<boolean>\n  /**\n   * The unique id of this user workspace. Predefined workspace ids include \"production\" and \"dev\" (read-only)\n   */\n  id?: string\n  /**\n   * The local state of each project in the workspace (read-only)\n   */\n  projects?: IProject[]\n}");
        });
        it('with refs, arrays and nullable', function () {
            var type = testUtils_1.apiTestModel.types['ApiVersion'];
            var actual = gen.declareType(indent, type);
            expect(actual).toEqual("export interface IApiVersion{\n  /**\n   * Current Looker release version number (read-only)\n   */\n  looker_release_version?: string\n  current_version?: IApiVersionElement\n  /**\n   * Array of versions supported by this Looker instance (read-only)\n   */\n  supported_versions?: IApiVersionElement[]\n}");
        });
        it('required properties', function () {
            var type = testUtils_1.apiTestModel.types['CreateQueryTask'];
            var actual = gen.declareType(indent, type);
            expect(actual).toEqual("export interface ICreateQueryTask{\n  /**\n   * Operations the current user is able to perform on this object (read-only)\n   */\n  can?: IDictionary<boolean>\n  /**\n   * Id of query to run\n   */\n  query_id: number\n  /**\n   * Desired async query result format. Valid values are: \"json\", \"json_detail\", \"json_fe\", \"csv\", \"html\", \"md\", \"txt\", \"xlsx\", \"gsxml\".\n   */\n  result_format: string\n  /**\n   * Source of query task\n   */\n  source?: string\n  /**\n   * Create the task but defer execution\n   */\n  deferred?: boolean\n  /**\n   * Id of look associated with query.\n   */\n  look_id?: number\n  /**\n   * Id of dashboard associated with query.\n   */\n  dashboard_id?: string\n}");
        });
    });
});
