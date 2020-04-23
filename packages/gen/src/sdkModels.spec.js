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
var sdkModels_1 = require("./sdkModels");
var testUtils_1 = require("../../script/testUtils");
describe('sdkModels', function () {
    describe('request type determination', function () {
        it('search_looks', function () {
            var method = testUtils_1.apiTestModel.methods['search_looks'];
            expect(method).toBeDefined();
            var actual = testUtils_1.apiTestModel.getRequestType(method);
            expect(actual).toBeDefined();
            if (actual) {
                expect(actual.properties['title']).toBeDefined();
            }
        });
        it('search_spaces', function () {
            var method = testUtils_1.apiTestModel.methods['search_folders'];
            expect(method).toBeDefined();
            var actual = testUtils_1.apiTestModel.getRequestType(method);
            expect(actual).toBeDefined();
            if (actual) {
                expect(actual.properties['fields']).toBeDefined();
            }
        });
        // TODO create a mock spec that has a recursive type, since this no longer does
        // it ('detects recursive types', () => {
        //   const type = apiTestModel.types['LookmlModelExploreField']
        //   const actual = type.isRecursive()
        //   expect(actual).toEqual(true)
        //   type = apiTestModel.types['CredentialsApi3']
        //   actual = type.isRecursive()
        //   expect(actual).toEqual(false)
        // })
    });
    describe('response modes', function () {
        it('binary only', function () {
            var method = testUtils_1.apiTestModel.methods['render_task_results'];
            expect(method).toBeDefined();
            expect(method.responseIsBinary()).toEqual(true);
            expect(method.responseIsString()).toEqual(false);
            expect(method.responseIsBoth()).toEqual(false);
        });
        it('string only', function () {
            var method = testUtils_1.apiTestModel.methods['add_group_user'];
            expect(method).toBeDefined();
            expect(method.responseIsBinary()).toEqual(false);
            expect(method.responseIsString()).toEqual(true);
            expect(method.responseIsBoth()).toEqual(false);
        });
        it('both modes', function () {
            var method = testUtils_1.apiTestModel.methods['run_look'];
            expect(method).toBeDefined();
            expect(method.responseIsBinary()).toEqual(true);
            expect(method.responseIsString()).toEqual(true);
            expect(method.responseIsBoth()).toEqual(true);
        });
        it('each response is described', function () {
            var method = testUtils_1.apiTestModel.methods['run_look'];
            expect(method).toBeDefined();
            expect(method.responses.length).toBeGreaterThan(0);
            method.responses.forEach((function (r) {
                expect(r.description).not.toEqual("");
            }));
        });
    });
    describe('required properties', function () {
        it('CreateQueryTask', function () {
            var type = testUtils_1.apiTestModel.types['CreateQueryTask'];
            expect(type).toBeDefined();
            var actual = testUtils_1.apiTestModel.getWriteableType(type);
            expect(actual).toBeDefined();
            expect(type.properties['query_id'].required).toEqual(true);
            expect(type.properties['result_format'].required).toEqual(true);
            expect(type.properties['source'].required).toEqual(false);
        });
        it('WriteCreateQueryTask', function () {
            var type = testUtils_1.apiTestModel.getWriteableType(testUtils_1.apiTestModel.types['CreateQueryTask']);
            expect(type).toBeDefined();
            expect(type.properties['query_id'].required).toEqual(true);
            expect(type.properties['result_format'].required).toEqual(true);
            expect(type.properties['source'].required).toEqual(false);
        });
    });
    describe('writeable logic', function () {
        it('CredentialsApi3', function () {
            var type = testUtils_1.apiTestModel.types['CredentialsApi3'];
            expect(type).toBeDefined();
            var writeable = type.writeable;
            expect(type.readOnly).toEqual(true);
            expect(writeable.length).toEqual(0);
        });
        describe('DashboardElement', function () {
            it('writeable', function () {
                var type = testUtils_1.apiTestModel.types['DashboardElement'];
                expect(type).toBeDefined();
                var writeable = type.writeable;
                expect(type.readOnly).toEqual(false);
                expect(writeable.length).toEqual(18);
            });
            it('writeableType', function () {
                var type = testUtils_1.apiTestModel.types['DashboardElement'];
                expect(type).toBeDefined();
                var actual = testUtils_1.apiTestModel.getWriteableType(type);
                expect(actual).toBeDefined();
                if (actual) {
                    expect(actual.properties['body_text']).toBeDefined();
                    expect(actual.properties['body_text_as_html']).not.toBeDefined();
                    expect(actual.properties['dashboard_id']).toBeDefined();
                    expect(actual.properties['edit_uri']).not.toBeDefined();
                    expect(actual.properties['look_id']).toBeDefined();
                }
            });
        });
    });
    var allMethods = function (tags) {
        var result = [];
        Object.entries(tags).forEach(function (_a) {
            var methods = _a[1];
            Object.entries(methods).forEach(function (_a) {
                var method = _a[1];
                result.push(method);
            });
        });
        return result;
    };
    describe('method and type xrefs', function () {
        describe('custom types', function () {
            it('intrinsic types have undefined custom types', function () {
                var actual = new sdkModels_1.IntrinsicType('integer');
                expect(actual.customType).toEqual('');
                expect(actual.name).toEqual('integer');
            });
            it('array type uses element type as custom type', function () {
                var intType = new sdkModels_1.IntrinsicType('integer');
                var schema = { type: 'mock' };
                var actual = new sdkModels_1.ArrayType(intType, schema);
                expect(actual.customType).toEqual('');
                expect(actual.name).toEqual('integer[]');
                actual = testUtils_1.apiTestModel.types['DashboardBase'];
                expect(actual.customType).toBe('DashboardBase');
            });
        });
        it('type references custom types and methods referencing', function () {
            // LookModel SpaceBase FolderBase DashboardElement DashboardFilter DashboardLayout DashboardSettings
            var actual = testUtils_1.apiTestModel.types['Dashboard'];
            var customTypes = sdkModels_1.keyValues(actual.customTypes);
            var types = sdkModels_1.typeRefs(testUtils_1.apiTestModel, actual.customTypes);
            var methodKeys = sdkModels_1.keyValues(actual.methodRefs);
            var methods = sdkModels_1.methodRefs(testUtils_1.apiTestModel, actual.methodRefs);
            expect(types.length).toEqual(customTypes.length);
            expect(customTypes.join(" ")).toEqual('DashboardAppearance DashboardElement DashboardFilter DashboardLayout FolderBase LookModel');
            expect(methods.length).toEqual(methodKeys.length);
            expect(methodKeys.join(" ")).toEqual('create_dashboard dashboard folder_dashboards import_lookml_dashboard search_dashboards sync_lookml_dashboard update_dashboard');
        });
        it('missing method references are silently skipped', function () {
            var keys = new Set(['login', 'logout', 'Bogosity']);
            var actual = sdkModels_1.methodRefs(testUtils_1.apiTestModel, keys);
            expect(actual.length).toEqual(2);
        });
        it('missing type references are silently skipped', function () {
            var keys = new Set(['Dashboard', 'User', 'Bogosity']);
            var actual = sdkModels_1.typeRefs(testUtils_1.apiTestModel, keys);
            expect(actual.length).toEqual(2);
        });
        it('method references custom types from parameters and responses', function () {
            var actual = testUtils_1.apiTestModel.methods['run_inline_query'];
            var customTypes = sdkModels_1.keyValues(actual.customTypes).join(" ");
            expect(customTypes).toEqual('Error Query ValidationError');
        });
    });
    describe('searching', function () {
        var modelAndTypeNames = new Set([sdkModels_1.SearchCriterion.method, sdkModels_1.SearchCriterion.type, sdkModels_1.SearchCriterion.name]);
        var modelNames = new Set([sdkModels_1.SearchCriterion.method, sdkModels_1.SearchCriterion.name]);
        var responseCriteria = new Set([sdkModels_1.SearchCriterion.response]);
        var statusCriteria = new Set([sdkModels_1.SearchCriterion.status]);
        var activityCriteria = new Set([sdkModels_1.SearchCriterion.activityType]);
        describe('model search', function () {
            it('target not found', function () {
                var actual = testUtils_1.apiTestModel.search('you will not find me anywhere in there, nuh uh');
                expect(actual).toBeDefined();
                var methods = allMethods(actual.tags);
                expect(Object.entries(methods).length).toEqual(0);
                expect(Object.entries(actual.types).length).toEqual(0);
            });
            it('search anywhere', function () {
                var actual = testUtils_1.apiTestModel.search('dashboard', modelAndTypeNames);
                var methods = allMethods(actual.tags);
                expect(Object.entries(methods).length).toEqual(32);
                expect(Object.entries(actual.types).length).toEqual(15);
            });
            it('search for word', function () {
                var actual = testUtils_1.apiTestModel.search('\\bdashboard\\b', modelAndTypeNames);
                var methods = allMethods(actual.tags);
                expect(Object.entries(methods).length).toEqual(6);
                expect(Object.entries(actual.types).length).toEqual(1);
                actual = testUtils_1.apiTestModel.search('\\bdashboardbase\\b', modelAndTypeNames);
                methods = allMethods(actual.tags);
                expect(Object.entries(methods).length).toEqual(1);
                expect(Object.entries(actual.types).length).toEqual(1);
            });
            it('just model names', function () {
                var actual = testUtils_1.apiTestModel.search('\\bdashboard\\b', modelNames);
                expect(Object.entries(allMethods(actual.tags)).length).toEqual(1);
                expect(Object.entries(actual.types).length).toEqual(0);
            });
            it('deprecated items', function () {
                var actual = testUtils_1.apiTestModel.search('deprecated', statusCriteria);
                expect(Object.entries(allMethods(actual.tags)).length).toEqual(6);
                expect(Object.entries(actual.types).length).toEqual(4);
            });
            it('beta items', function () {
                var actual = testUtils_1.apiTestModel.search('beta', statusCriteria);
                expect(Object.entries(allMethods(actual.tags)).length).toEqual(198);
                expect(Object.entries(actual.types).length).toEqual(98);
            });
            it('stable items', function () {
                var actual = testUtils_1.apiTestModel.search('stable', statusCriteria);
                expect(Object.entries(allMethods(actual.tags)).length).toEqual(153);
                expect(Object.entries(actual.types).length).toEqual(88);
            });
            it('db queries', function () {
                var actual = testUtils_1.apiTestModel.search('db_query', activityCriteria);
                expect(Object.entries(allMethods(actual.tags)).length).toEqual(35);
                expect(Object.entries(actual.types).length).toEqual(0);
            });
        });
        describe('response search', function () {
            it('find binary responses', function () {
                var actual = testUtils_1.apiTestModel.search('binary', responseCriteria);
                expect(Object.entries(allMethods(actual.tags)).length).toEqual(6);
                expect(Object.entries(actual.types).length).toEqual(0);
            });
            it('find rate limited responses', function () {
                var actual = testUtils_1.apiTestModel.search('429', responseCriteria);
                var methods = allMethods(actual.tags);
                expect(Object.entries(methods).length).toEqual(107);
                expect(Object.entries(actual.types).length).toEqual(0);
            });
        });
        describe('criteria transformations', function () {
            it('criterion name array to criteria', function () {
                var expected = new Set([sdkModels_1.SearchCriterion.method, sdkModels_1.SearchCriterion.type, sdkModels_1.SearchCriterion.name]);
                // this declaration pattern assures correct enum names
                var names = ['method', 'type', 'name'];
                var actual = sdkModels_1.CriteriaToSet(names);
                expect(actual).toEqual(expected);
            });
            it('criteria to criterion name array', function () {
                var criteria = new Set([sdkModels_1.SearchCriterion.method, sdkModels_1.SearchCriterion.type, sdkModels_1.SearchCriterion.name]);
                var expected = ['method', 'type', 'name'];
                var actual = sdkModels_1.SetToCriteria(criteria);
                expect(actual).toEqual(expected);
            });
            it('strings to criteria', function () {
                var expected = new Set([sdkModels_1.SearchCriterion.method, sdkModels_1.SearchCriterion.type, sdkModels_1.SearchCriterion.name]);
                var values = ['method', 'type', 'name'];
                var names = values;
                var actual = sdkModels_1.CriteriaToSet(names);
                expect(actual).toEqual(expected);
            });
            it('criteria is case insensitive', function () {
                var expected = new Set([sdkModels_1.SearchCriterion.method, sdkModels_1.SearchCriterion.type, sdkModels_1.SearchCriterion.name]);
                var values = ['Method', 'Type', 'name'];
                var names = values;
                var actual = sdkModels_1.CriteriaToSet(names);
                expect(actual).toEqual(expected);
            });
            it('criteria to strings', function () {
                var criteria = new Set([sdkModels_1.SearchCriterion.method, sdkModels_1.SearchCriterion.type, sdkModels_1.SearchCriterion.name]);
                var expected = ['method', 'type', 'name'];
                var actual = sdkModels_1.SetToCriteria(criteria);
                expect(actual).toEqual(expected);
            });
        });
    });
    describe('tagging', function () {
        it('methods are tagged', function () {
            var actual = testUtils_1.apiTestModel.tags;
            expect(Object.entries(actual).length).toEqual(25);
        });
        it('methods are in the right tag', function () {
            var actual = testUtils_1.apiTestModel.tags['Theme'];
            expect(Object.entries(actual).length).toEqual(11);
        });
    });
    describe('json stringify works', function () {
        it('handles login', function () {
            var item = testUtils_1.apiTestModel.methods['login'];
            expect(item).toBeDefined();
            var actual = JSON.stringify(item, null, 2);
            expect(actual).toBeDefined();
            expect(actual).toContain('"name": "login"');
        });
        it('handles Dashboard', function () {
            var item = testUtils_1.apiTestModel.types['Dashboard'];
            expect(item).toBeDefined();
            var actual = JSON.stringify(item, null, 2);
            expect(actual).toBeDefined();
            expect(actual).toContain('"name": "Dashboard"');
            expect(actual).toContain('"customType": "Dashboard"');
        });
        it('handles dashboard_dashboard_elements', function () {
            var item = testUtils_1.apiTestModel.methods['dashboard_dashboard_elements'];
            expect(item).toBeDefined();
            var actual = JSON.stringify(item, null, 2);
            expect(actual).toBeDefined();
            expect(actual).toContain('"name": "dashboard_dashboard_elements"');
        });
    });
});
