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

import { readFileSync } from 'fs';
import type * as OAS from 'openapi3-ts';
import { TestConfig, rootFile } from './testUtils';
import type {
  IEnumType,
  IMethod,
  IMethodResponse,
  IParameter,
  IType,
  KeyedCollection,
  SearchCriterionTerm,
  TagList,
} from './sdkModels';
import {
  ApiModel,
  ArrayType,
  DelimArrayType,
  EnumType,
  IntrinsicType,
  MetaType,
  Method,
  SearchAll,
  SearchCriterion,
  camelCase,
  criteriaToSet,
  describeParam,
  firstCase,
  isSpecialName,
  keyValues,
  mayQuote,
  methodRefs,
  safeName,
  setToCriteria,
  titleCase,
  typeRefs,
} from './sdkModels';

describe('sdkModels', () => {
  describe('enum naming', () => {
    const rf: OAS.SchemaObject = {
      name: 'result_format',
      type: 'string',
      'x-looker-values': [
        'inline_json',
        'json',
        'json_detail',
        'json_fe',
        'csv',
        'html',
        'md',
        'txt',
        'xlsx',
        'gsxml',
      ],
      description: 'RF',
      nullable: true,
    };

    const rf1: OAS.SchemaObject = {
      name: 'result_format',
      type: 'string',
      'x-looker-values': ['pdf', 'png', 'jpeg'],
      description: 'RF2',
      nullable: true,
    };

    const rf2: OAS.SchemaObject = {
      type: 'string',
      'x-looker-values': ['csv', 'html', 'txt'],
      description: 'RF2',
      nullable: true,
    };

    const rf3: OAS.SchemaObject = {
      name: 'result_format',
      type: 'string',
      'x-looker-values': ['csv', 'html', 'txt', 'xlsx'],
      description: 'RF3',
      nullable: true,
    };

    // Only change description. Should end up as the same enum
    const rf4: OAS.SchemaObject = { ...rf, ...{ description: 'RF4' } };

    it('enum types are renamed and not overwritten', () => {
      const api = new ApiModel({} as OAS.OpenAPIObject);
      const actual = api.resolveType(rf) as EnumType;
      expect(actual.name).toEqual('ResultFormat');

      // Returns first enum for enums with identical values
      // the `style` parameter is undefined because it is not part of this test. Because TypeScript arguments are
      // positional only (no named arguments) the parameter must be skipped with an "ignore this" value
      const actual4 = api.resolveType(rf4, undefined, 'Foo') as EnumType;
      expect(actual4.values).toEqual(actual.values);
      expect(actual4.name).toEqual('ResultFormat');
      expect(actual4.description).toEqual(actual.description);

      // Creates unique names
      const actual1 = api.resolveType(rf1);
      expect(actual1.name).toEqual('ResultFormat1');

      const actual2 = api.resolveType(rf2, undefined, 'result_format');
      expect(actual2.name).toEqual('ResultFormat2');

      const actual3 = api.resolveType(rf3, undefined, undefined, 'Meth');
      expect(actual3.name).toEqual('MethResultFormat');
    });
  });

  describe('fromSpec', () => {
    let config;
    let apiTestModel: ApiModel;
    beforeAll(() => {
      config = TestConfig();
      apiTestModel = config.apiTestModel;
    });
    const checkSorted = (list: KeyedCollection<any>) => {
      const actual = Object.keys(list);
      const expected = actual.sort((a, b) => a.localeCompare(b));
      expect(actual).toEqual(expected);
    };

    it('API 4 models', () => {
      const api4 = readFileSync(rootFile('spec/Looker.4.0.oas.json'), 'utf-8');
      const api = ApiModel.fromString(api4);
      const actual = Object.keys(api.typeTags);
      expect(actual).toHaveLength(31);
    });

    describe('ordering', () => {
      it('has types in sorted order', () => {
        checkSorted(apiTestModel.types);
      });

      it('has tags in sorted order', () => {
        checkSorted(apiTestModel.tags);
      });

      it('has methods in sorted order', () => {
        checkSorted(apiTestModel.methods);
      });

      describe('methods inside tags are in natural order', () => {
        it('has Query methods in natural order', () => {
          const actual = Object.keys(apiTestModel.tags.Query);
          const expected = [
            'create_query_task',
            'query_task_multi_results',
            'query_task',
            'query_task_results',
            'query',
            'query_for_slug',
            'create_query',
            'run_query',
            'run_inline_query',
            'run_url_encoded_query',
            'merge_query',
            'create_merge_query',
            'all_running_queries',
            'kill_query',
            'sql_query',
            'create_sql_query',
            'run_sql_query',
          ];
          expect(actual).toEqual(expected);
        });

        it('has Theme methods in natural order', () => {
          const actual = Object.keys(apiTestModel.tags.Theme);
          const expected = [
            'all_themes',
            'create_theme',
            'search_themes',
            'default_theme',
            'set_default_theme',
            'active_themes',
            'theme_or_default',
            'validate_theme',
            'theme',
            'update_theme',
            'delete_theme',
          ];
          expect(actual).toEqual(expected);
        });
      });
    });

    describe('mayQuote', () => {
      it('quotes foo-bar', () => {
        expect(mayQuote('foo-bar')).toEqual(`'foo-bar'`);
      });
      it('does not quote foo_bar', () => {
        expect(mayQuote('foo_bar')).toEqual(`foo_bar`);
      });
      it('quotes " foo_bar"', () => {
        expect(mayQuote(' foo_bar')).toEqual(`' foo_bar'`);
      });
      it('does not quote _foo_bar_', () => {
        expect(mayQuote('_foo_bar_')).toEqual(`_foo_bar_`);
      });
    });

    describe('camelCase', () => {
      it.each<[string, string]>([
        ['', ''],
        ['foo-bar', 'fooBar'],
        ['foo -bar', 'fooBar'],
        ['foo- bar', 'fooBar'],
        ['foo --  bar', 'fooBar'],
        ['foo bar', 'fooBar'],
        ['foo bar--', 'fooBar'],
        ['foo bar   ', 'fooBar'],
        ['foo_bar', 'fooBar'],
        ['foo   bar', 'fooBar'],
        ['foo -  bar  - - baz', 'fooBarBaz'],
        ['Foo  -  Bar', 'FooBar'],
        ['FOOBAR', 'FOOBAR'],
      ])('"%s" is "%s"', (actual, expected) => {
        expect(camelCase(actual)).toEqual(expected);
      });
    });

    describe('safeName', () => {
      it.each<[string, string]>([
        ['', ''],
        ['foo-bar', 'foo_bar'],
        ['foo -bar', 'foo_bar'],
        ['foo- bar', 'foo_bar'],
        ['foo --  bar', 'foo_bar'],
        ['foo bar', 'foo_bar'],
        ['foo bar--', 'foo_bar_'],
        ['foo bar   ', 'foo_bar_'],
        ['foo_bar', 'foo_bar'],
        ['foo   bar', 'foo_bar'],
        ['foo -  bar  - - baz', 'foo_bar_baz'],
        ['Foo  -  Bar', 'Foo_Bar'],
        ['FOOBAR', 'FOOBAR'],
      ])('"%s" is "%s"', (actual, expected) => {
        expect(safeName(actual)).toEqual(expected);
      });
    });

    describe('titleCase', () => {
      it.each<[string, string]>([
        ['', ''],
        ['foo-bar', 'FooBar'],
        ['foo -bar', 'FooBar'],
        ['foo- bar', 'FooBar'],
        ['foo --  bar', 'FooBar'],
        ['foo bar', 'FooBar'],
        ['foo bar--', 'FooBar'],
        ['foo bar   ', 'FooBar'],
        ['foo_bar', 'FooBar'],
        ['foo   bar', 'FooBar'],
        ['foo -  bar  - - baz', 'FooBarBaz'],
        ['Foo  -  Bar', 'FooBar'],
        ['FOOBAR', 'FOOBAR'],
      ])('"%s" is "%s"', (actual, expected) => {
        expect(titleCase(actual)).toEqual(expected);
      });
    });

    describe('firstCase', () => {
      it('empty is empty', () => {
        expect(firstCase('')).toEqual('');
      });
      it('foo-bar is Foobar', () => {
        expect(firstCase('foo-bar')).toEqual('Foobar');
      });
      it('foo_bar is Foobar', () => {
        expect(firstCase('foo_bar')).toEqual('Foobar');
      });
      it('foobar is Foobar', () => {
        expect(firstCase('foobar')).toEqual('Foobar');
      });
      it('FOOBAR is Foobar', () => {
        expect(firstCase('FOOBAR')).toEqual('Foobar');
      });
    });

    describe('full names', () => {
      describe('for methods', () => {
        it('method full name is eponymous', () => {
          const method = apiTestModel.methods.search_looks;
          expect(method).toBeDefined();
          expect(method.fullName).toEqual(method.name);
        });

        it('method.parameter full name has method name prefix', () => {
          const method = apiTestModel.methods.search_looks;
          expect(method).toBeDefined();
          const item = method.params[0];
          expect(item.fullName).toEqual(`${method.name}.${item.name}`);
        });
      });

      describe('for types', () => {
        it('type full name is eponymous', () => {
          const method = apiTestModel.methods.search_looks;
          expect(method).toBeDefined();
          expect(method.fullName).toEqual(method.name);
        });

        it('type.property full name has method name prefix', () => {
          const type = apiTestModel.types.Dashboard;
          expect(type).toBeDefined();
          Object.values(type.properties).forEach(item => {
            expect(item.fullName).toEqual(`${type.name}.${item.name}`);
          });
        });
      });
    });

    describe('special needs', () => {
      it('HyphenType has special needs', () => {
        const type = apiTestModel.types.HyphenType;
        expect(type).toBeDefined();
        expect(type.hasSpecialNeeds).toEqual(true);
        expect(type.properties.project_name.hasSpecialNeeds).toEqual(false);
        expect(type.properties.project_digest.hasSpecialNeeds).toEqual(true);
        expect(type.properties.computation_time.hasSpecialNeeds).toEqual(true);
        expect(type.properties.project_name.jsonName).toEqual('project_name');
        expect(type.properties.project_digest.jsonName).toEqual(
          'project-digest'
        );
        expect(type.properties.computation_time.jsonName).toEqual(
          'computation time'
        );
      });
      it('Dashboard has no special needs', () => {
        const type = apiTestModel.types.Dashboard;
        expect(type).toBeDefined();
        expect(type.hasSpecialNeeds).toEqual(false);
      });
    });

    describe('request type determination', () => {
      it('search_looks', () => {
        const method = apiTestModel.methods.search_looks;
        expect(method).toBeDefined();
        const actual = apiTestModel.getRequestType(method);
        expect(actual).toBeDefined();
        if (actual) {
          expect(actual.properties.title).toBeDefined();
          expect(actual.name).toEqual('RequestSearchLooks');
        }
      });

      it('search_folders', () => {
        const method = apiTestModel.methods.search_folders;
        expect(method).toBeDefined();
        const actual = apiTestModel.getRequestType(method);
        expect(actual).toBeDefined();
        if (actual) {
          expect(actual.properties.fields).toBeDefined();
          expect(actual.name).toEqual('RequestSearchFolders');
        }
      });

      it('detects recursive types', () => {
        let type = apiTestModel.types.LookmlModelExploreField;
        let actual = type.isRecursive();
        expect(actual).toEqual(true);
        type = apiTestModel.types.CredentialsApi3;
        actual = type.isRecursive();
        expect(actual).toEqual(false);
      });
    });

    describe('response modes', () => {
      it('binary only', () => {
        const method = apiTestModel.methods.render_task_results;
        expect(method).toBeDefined();
        expect(method.responseIsBinary()).toEqual(true);
        expect(method.responseIsString()).toEqual(false);
        expect(method.responseIsBoth()).toEqual(false);
      });

      it('string only', () => {
        const method = apiTestModel.methods.add_group_user;
        expect(method).toBeDefined();
        expect(method.responseIsBinary()).toEqual(false);
        expect(method.responseIsString()).toEqual(true);
        expect(method.responseIsBoth()).toEqual(false);
      });

      it('both modes', () => {
        const method = apiTestModel.methods.run_look;
        expect(method).toBeDefined();
        expect(method.responseIsBinary()).toEqual(true);
        expect(method.responseIsString()).toEqual(true);
        expect(method.responseIsBoth()).toEqual(true);
      });

      it('each response is described', () => {
        const method = apiTestModel.methods.run_look;
        expect(method).toBeDefined();
        expect(method.responses.length).toBeGreaterThan(0);
        method.responses.forEach((r: IMethodResponse) => {
          expect(r.description).not.toEqual('');
        });
      });

      it('ok responses are unique', () => {
        const method = apiTestModel.methods.run_sql_query;
        const actual = method.okResponses;
        expect(actual).toHaveLength(4);
      });
    });

    describe('required properties', () => {
      it('CreateQueryTask', () => {
        const type = apiTestModel.types.CreateQueryTask;
        expect(type).toBeDefined();
        const actual = apiTestModel.mayGetWriteableType(type);
        expect(actual).toBeDefined();
        /* eslint-disable jest-dom/prefer-required */
        expect(type.properties.query_id.required).toEqual(true);
        expect(type.properties.result_format.required).toEqual(true);
        expect(type.properties.source.required).toEqual(false);
        /* eslint-enable jest-dom/prefer-required */
        expect(Object.keys(type.requiredProperties)).toEqual([
          'query_id',
          'result_format',
        ]);
        expect(Object.keys(type.optionalProperties)).toEqual([
          'can',
          'source',
          'deferred',
          'look_id',
          'dashboard_id',
        ]);
      });

      it('WhitelabelConfiguration has a writer', () => {
        const type = apiTestModel.types.WhitelabelConfiguration;
        expect(type).toBeDefined();
        const actual = apiTestModel.mayGetWriteableType(type);
        expect(actual).toBeDefined();
      });

      it('generates writeable type for nested types with some readonly properties', () => {
        const setting = apiTestModel.types.Setting;
        const whitelabel = apiTestModel.types.WhitelabelConfiguration;
        const prop = setting.properties.whitelabel;
        expect(prop.type).toEqual(whitelabel);
        expect(prop.readOnly).toEqual(false);
        expect(whitelabel.readOnly).toEqual(false);
        const type = apiTestModel.mayGetWriteableType(setting);
        expect(type).toBeDefined();
        // Code concession for linting that doesn't understand "toBeDefined()" test
        expect(type?.name).toEqual('WriteSetting');
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const writeWhite = type!.properties.whitelabel;
        expect(writeWhite).toBeDefined();
        expect(writeWhite.type.name).toEqual('WriteWhitelabelConfiguration');
        const whiteProps = writeWhite.type.properties;
        expect(whiteProps.can).toBeUndefined();
        expect(whiteProps.id).toBeUndefined();
        expect(whiteProps.logo_file).toBeDefined();
        expect(whiteProps.logo_url).toBeUndefined();
        expect(whiteProps.favicon_file).toBeDefined();
        expect(whiteProps.favicon_url).toBeUndefined();
        expect(whiteProps.default_title).toBeDefined();
      });

      it('generates and annotates a writeable type collection ', () => {
        const source = apiTestModel.types.MergeQuery;
        const actual = apiTestModel.mayGetWriteableType(source);
        const props = actual?.properties;
        const sq = props?.source_queries;
        expect(sq).toBeDefined();
        expect(sq?.type.name).toEqual('MergeQuerySourceQuery[]');
      });

      it('does not generate writeable type if type contains no readonly properties', () => {
        const source = apiTestModel.types.CreateDashboardRenderTask;
        const actual = apiTestModel.mayGetWriteableType(source);
        expect(actual).toBeUndefined();
      });

      it('does not generate writeable type if type contains only writeable properties', () => {
        const source = apiTestModel.types.ContentMetaGroupUser;
        const actual = apiTestModel.mayGetWriteableType(source);
        expect(actual).toBeUndefined();
        expect(source.description).toMatch(
          /WARNING: no writeable properties found for POST, PUT, or PATCH/
        );
      });

      it('WriteCreateQueryTask', () => {
        const type = apiTestModel.mayGetWriteableType(
          apiTestModel.types.CreateQueryTask
        );
        expect(type).toBeDefined();
        expect(type?.properties.query_id.required).toEqual(true);
        expect(type?.properties.result_format.required).toEqual(true);
        expect(type?.properties.source.required).toEqual(false);
      });
    });

    describe('deprecations', () => {
      describe('describeParam', () => {
        it('supports Highlander deprecation', () => {
          const param = {
            name: 'foo',
            description: 'there can be only one deprecated parameter!',
            deprecated: true,
          } as IParameter;
          const actual = describeParam(param);
          expect(actual).toEqual(param.description);
        });
        it('tags missing deprecations', () => {
          const param = {
            name: 'foo',
            description: 'obsolete parameter',
            deprecated: true,
          } as IParameter;
          const actual = describeParam(param);
          expect(actual).toEqual('(DEPRECATED) obsolete parameter');
        });
        it('does not tag undeprecated parameters', () => {
          const param = {
            name: 'foo',
            description: 'obsolete parameter',
            deprecated: false,
          } as IParameter;
          const actual = describeParam(param);
          expect(actual).toEqual(param.description);
        });
      });

      it('has deprecated methods', () => {
        const keys = Object.keys(apiTestModel.methods);
        expect(keys).toContain('old_login');
        const method = apiTestModel.methods.old_login;
        expect(method).toBeDefined();
        expect(method.deprecated).toEqual(true);
      });

      it('has deprecated parameters', () => {
        const method = apiTestModel.methods.old_login;
        const param = method.params.find(p => p.name === 'old_cred');
        expect(param).toBeDefined();
        expect(param?.deprecated).toEqual(true);
      });

      it('has deprecated properties', () => {
        const type = apiTestModel.types.SqlQueryCreate;
        const prop = type.properties.connection_id;
        expect(prop).toBeDefined();
        expect(prop.deprecated).toEqual(true);
      });
    });
    describe('writeable logic', () => {
      it('CredentialsApi3', () => {
        const type = apiTestModel.types.CredentialsApi3;
        expect(type).toBeDefined();
        const writeable = type.writeable;
        expect(type.readOnly).toEqual(true);
        expect(writeable).toHaveLength(0);
      });

      describe('DashboardElement', () => {
        it('writeable', () => {
          const type = apiTestModel.types.DashboardElement;
          expect(type).toBeDefined();
          const writeable = type.writeable;
          expect(type.readOnly).toEqual(false);
          expect(writeable).toHaveLength(18);
        });

        it('writeableType', () => {
          const type = apiTestModel.types.DashboardElement;
          expect(type).toBeDefined();
          const actual = apiTestModel.mayGetWriteableType(type);
          expect(actual).toBeDefined();
          if (actual) {
            expect(actual.properties.body_text).toBeDefined();
            expect(actual.properties.body_text_as_html).not.toBeDefined();
            expect(actual.properties.dashboard_id).toBeDefined();
            expect(actual.properties.edit_uri).not.toBeDefined();
            expect(actual.properties.look_id).toBeDefined();
          }
        });
      });
    });

    describe('special symbol names', () => {
      it.each<[string, boolean]>([
        ['IFoo', false],
        ['If00', false],
        ['I_foo', false],
        ['ba a a', true],
        ['foo', false],
        ['hi-fen', true],
        ['_a', false],
        ['$1', true],
        ['ABC', false],
        ['ABC ', true],
        [' ABC', true],
        ['012', true],
        ['_012', false],
        ['', false],
      ])('isSpecialName("%s") is %s', (actual, expected) => {
        expect(isSpecialName(actual)).toEqual(expected);
      });
    });

    describe('enum types', () => {
      const checkEnum = (num: IEnumType, propName: string, values: any[]) => {
        if (!(num instanceof EnumType))
          console.error(`${propName} should be EnumType`);
        expect(num).toBeInstanceOf(EnumType);
        expect(num.name).toEqual(titleCase(propName));
        expect(num.values).toEqual(values);
        expect(num.parentTypes.size).toBeGreaterThan(0);
      };

      const checkSingleEnum = (
        type: IType,
        propName: string,
        values: any[]
      ) => {
        checkEnum(
          type.properties[propName].type as IEnumType,
          propName,
          values
        );
      };

      const checkEnumArray = (type: IType, propName: string, values: any[]) => {
        const arr = type.properties[propName].type;
        expect(arr).toBeInstanceOf(ArrayType);
        checkEnum(arr.elementType as IEnumType, propName, values);
      };

      it('registers enum types', () => {
        const types = apiTestModel.types;
        expect(types[titleCase('supported_action_types')]).toBeDefined();
        expect(types[titleCase('supported_formattings')]).toBeDefined();
        expect(types[titleCase('pull_request_mode')]).toBeDefined();
      });

      it('enum from array type', () => {
        const type = apiTestModel.types.Integration;
        expect(type).toBeDefined();
        checkEnumArray(type, 'supported_formats', [
          'txt',
          'csv',
          'inline_json',
          'json',
          'json_label',
          'json_detail',
          'json_detail_lite_stream',
          'xlsx',
          'html',
          'wysiwyg_pdf',
          'assembled_pdf',
          'wysiwyg_png',
          'csv_zip',
        ]);
        checkEnumArray(type, 'supported_action_types', [
          'cell',
          'query',
          'dashboard',
        ]);
        checkEnumArray(type, 'supported_formattings', [
          'formatted',
          'unformatted',
        ]);
        checkEnumArray(type, 'supported_download_settings', ['push', 'url']);
      });

      it('enum from string type', () => {
        const type = apiTestModel.types.Project;
        expect(type).toBeDefined();
        checkSingleEnum(type, 'git_application_server_http_scheme', [
          'http',
          'https',
        ]);
        checkSingleEnum(type, 'pull_request_mode', [
          'off',
          'links',
          'recommended',
          'required',
        ]);
      });

      it('all enums have parents', () => {
        const orphans = Object.values(apiTestModel.types).filter(
          t => t instanceof EnumType && t.parentTypes.size === 0
        );
        expect(orphans).toHaveLength(0);
      });
    });

    describe('rate limit', () => {
      it('x-looker-rate-limited', () => {
        const yes = {
          'x-looker-rate-limited': true,
        } as unknown as OAS.OperationObject;
        const no = {
          'x-looker-rate-limited': false,
        } as unknown as OAS.OperationObject;
        const nada = {} as OAS.OperationObject;

        expect(Method.isRateLimited(yes)).toBe(true);
        expect(Method.isRateLimited(no)).toBe(false);
        expect(Method.isRateLimited(nada)).toBe(false);
      });

      it('X-RateLimit-Limit', () => {
        const yes = {
          'X-RateLimit-Limit': 0,
        } as unknown as OAS.OperationObject;
        const no = {
          'x-ratelimit-limit': 0,
        } as unknown as OAS.OperationObject;
        const nada = {} as OAS.OperationObject;

        expect(Method.isRateLimited(yes)).toBe(true);
        expect(Method.isRateLimited(no)).toBe(false);
        expect(Method.isRateLimited(nada)).toBe(false);
      });

      it('X-RateLimit-Remaining', () => {
        const yes = {
          'X-RateLimit-Remaining': 0,
        } as unknown as OAS.OperationObject;
        const no = {
          'x-ratelimit-remaining': 0,
        } as unknown as OAS.OperationObject;
        const nada = {} as OAS.OperationObject;

        expect(Method.isRateLimited(yes)).toBe(true);
        expect(Method.isRateLimited(no)).toBe(false);
        expect(Method.isRateLimited(nada)).toBe(false);
      });

      it('X-RateLimit-Reset', () => {
        const yes = {
          'X-RateLimit-Reset': 0,
        } as unknown as OAS.OperationObject;
        const no = {
          'x-ratelimit-reset': 0,
        } as unknown as OAS.OperationObject;
        const nada = {} as OAS.OperationObject;

        expect(Method.isRateLimited(yes)).toBe(true);
        expect(Method.isRateLimited(no)).toBe(false);
        expect(Method.isRateLimited(nada)).toBe(false);
      });

      it('X-Rate-Limit-Limit', () => {
        const yes = {
          'X-Rate-Limit-Limit': 0,
        } as unknown as OAS.OperationObject;
        const no = {
          'x-rate-limit-limit': 0,
        } as unknown as OAS.OperationObject;
        const nada = {} as OAS.OperationObject;

        expect(Method.isRateLimited(yes)).toBe(true);
        expect(Method.isRateLimited(no)).toBe(false);
        expect(Method.isRateLimited(nada)).toBe(false);
      });

      it('X-Rate-Limit-Remaining', () => {
        const yes = {
          'X-Rate-Limit-Remaining': 0,
        } as unknown as OAS.OperationObject;
        const no = {
          'x-rate-limit-remaining': 0,
        } as unknown as OAS.OperationObject;
        const nada = {} as OAS.OperationObject;

        expect(Method.isRateLimited(yes)).toBe(true);
        expect(Method.isRateLimited(no)).toBe(false);
        expect(Method.isRateLimited(nada)).toBe(false);
      });

      it('X-Rate-Limit-Reset', () => {
        const yes = {
          'X-Rate-Limit-Reset': 0,
        } as unknown as OAS.OperationObject;
        const no = {
          'x-rate-limit-reset': 0,
        } as unknown as OAS.OperationObject;
        const nada = {} as OAS.OperationObject;

        expect(Method.isRateLimited(yes)).toBe(true);
        expect(Method.isRateLimited(no)).toBe(false);
        expect(Method.isRateLimited(nada)).toBe(false);
      });

      it('scheduled_plan_run_once is rate limited', () => {
        const method = apiTestModel.methods.scheduled_plan_run_once;
        expect(method).toBeDefined();
        expect(method.rateLimited).toBe(true);
      });

      it('dashboard is not rate limited', () => {
        const method = apiTestModel.methods.dashboard;
        expect(method).toBeDefined();
        expect(method.rateLimited).toBe(false);
      });
    });

    const allMethods = (tags: TagList): Array<IMethod> => {
      const result: Array<IMethod> = [];
      Object.entries(tags).forEach(([, methods]) => {
        Object.entries(methods).forEach(([, method]) => {
          result.push(method);
        });
      });
      return result;
    };

    const obfuscate = (option: string, element: IType): IType => {
      switch (option) {
        case 'd':
          return new DelimArrayType(element, element.schema);
        case 'a':
          return new ArrayType(element, element.schema);
        default:
          return element;
      }
    };

    describe('method and type xrefs', () => {
      describe('custom types', () => {
        it('determines parent type of array types', () => {
          const arrayType = apiTestModel.types.DashboardElement;
          const parents = arrayType.parentTypes;
          expect(parents).toEqual(new Set(['DashboardElement[]', 'Dashboard']));
        });

        it('determines parent type of enum types', () => {
          const enumType = apiTestModel.types.LinkedContentType;
          const parents = enumType.parentTypes;
          expect(parents).toEqual(new Set(['Command']));
        });

        it('determines parent type of complex hash types', () => {
          const hashProp = apiTestModel.types.ComplexHashProp;
          expect(hashProp.parentTypes).toEqual(
            new Set(['Hash[ComplexHashProp]', 'ComplexHash'])
          );
        });

        it('intrinsic types have undefined custom types', () => {
          const actual = new IntrinsicType('integer');
          expect(actual.customType).toEqual('');
          expect(actual.name).toEqual('integer');
        });

        it('instanceof checks', () => {
          const element = new IntrinsicType('string');
          let actual: IType = {} as IType;
          if (element.name === 'string') {
            actual = new ArrayType(element, element.schema);
          }
          expect(actual).toBeDefined();
          expect(actual.instanceOf('ArrayType')).toEqual(true);
          expect(actual.intrinsic).toEqual(false);

          actual = obfuscate('a', element);
          expect(actual).toBeDefined();
          expect(actual instanceof ArrayType).toEqual(true);
          expect(actual.instanceOf('ArrayType')).toEqual(true);

          actual = obfuscate('d', element);
          expect(actual).toBeDefined();
          expect(actual.instanceOf('DelimArrayType')).toEqual(true);

          let method = apiTestModel.methods.query_task_multi_results;
          let schema = method.params[0].type.schema;
          actual = apiTestModel.resolveType(schema, 'simple');
          expect(actual).toBeDefined();
          expect(actual.instanceOf('DelimArrayType')).toEqual(true);

          let response = method.primaryResponse;
          schema = response.type.schema;
          actual = apiTestModel.resolveType(schema, 'simple');
          expect(actual).toBeDefined();
          expect(actual.instanceOf('HashType')).toEqual(true);

          method = apiTestModel.methods.all_datagroups;
          response = method.primaryResponse;
          schema = response.type.schema;
          actual = apiTestModel.resolveType(schema);
          expect(actual).toBeDefined();
          expect(actual.instanceOf('ArrayType')).toEqual(true);

          // actual = apiTestModel.resolveType(schema)
          // expect(actual).toBeDefined()
          // expect(actual instanceof ArrayType).toEqual(true)
        });

        it('array type uses element type as custom type', () => {
          const intType = new IntrinsicType('integer');
          const schema = { type: 'mock' } as unknown as OAS.SchemaObject;
          let actual: IType = new ArrayType(intType, schema);
          expect(actual.customType).toEqual('');
          expect(actual.name).toEqual('integer[]');
          expect(actual instanceof ArrayType).toBeTruthy();
          actual = apiTestModel.types.DashboardBase;
          expect(actual.customType).toBe('DashboardBase');
        });
      });

      it('type references custom types and methods referencing', () => {
        // LookModel SpaceBase FolderBase DashboardElement DashboardFilter DashboardLayout DashboardSettings
        const actual = apiTestModel.types.Dashboard;
        const customTypes = keyValues(actual.customTypes);
        const types = typeRefs(apiTestModel, actual.customTypes);
        const methodKeys = keyValues(actual.methodRefs);
        const methods = methodRefs(apiTestModel, actual.methodRefs);
        expect(types).toHaveLength(customTypes.length);
        expect(customTypes.join(' ')).toEqual(
          'DashboardAppearance DashboardElement DashboardFilter DashboardLayout FolderBase LookModel WriteDashboard'
        );
        expect(methods).toHaveLength(methodKeys.length);
        expect(methodKeys.join(' ')).toEqual(
          'create_dashboard dashboard folder_dashboards import_lookml_dashboard search_dashboards sync_lookml_dashboard update_dashboard'
        );
      });

      it('missing method references are silently skipped', () => {
        const keys = new Set(['login', 'logout', 'Bogosity']);
        const actual = methodRefs(apiTestModel, keys);
        expect(actual).toHaveLength(2);
      });

      it('missing type references are silently skipped', () => {
        const keys = new Set(['Dashboard', 'User', 'Bogosity']);
        const actual = typeRefs(apiTestModel, keys);
        expect(actual).toHaveLength(2);
      });

      it('method references custom types from parameters and responses', () => {
        const actual = apiTestModel.methods.run_inline_query;
        const customTypes = keyValues(actual.customTypes).join(' ');
        expect(customTypes).toEqual(
          'Error Query RequestRunInlineQuery ValidationError WriteQuery'
        );
      });
    });

    describe('searching', () => {
      const modelAndTypeNames = new Set([
        SearchCriterion.method,
        SearchCriterion.type,
        SearchCriterion.name,
      ]);
      const standardSet = new Set([
        SearchCriterion.method,
        SearchCriterion.type,
        SearchCriterion.name,
        SearchCriterion.property,
        SearchCriterion.argument,
        SearchCriterion.description,
      ]);
      const modelNames = new Set([
        SearchCriterion.method,
        SearchCriterion.name,
      ]);
      const responseCriteria = new Set([SearchCriterion.response]);
      const statusCriteria = new Set([SearchCriterion.status]);
      const activityCriteria = new Set([SearchCriterion.activityType]);

      describe('searchString', () => {
        it('type.searchString', () => {
          const query = apiTestModel.types.Query;
          let text = query.searchString(modelAndTypeNames);
          expect(text).toContain('Query');
          text = query.searchString(standardSet);
          expect(text).toContain('slug');
        });

        it('model.searchString', () => {
          const query = apiTestModel.methods.query_for_slug;
          let text = query.searchString(modelAndTypeNames);
          expect(text).toContain('query_for_slug');
          text = query.searchString(standardSet);
          expect(text).toContain('slug');
        });
      });

      describe('specification search', () => {
        it('target not found', () => {
          const actual = apiTestModel.search(
            'you will not find me anywhere in there, nuh uh'
          );
          expect(actual).toBeDefined();
          const methods = allMethods(actual.tags);
          expect(Object.entries(methods)).toHaveLength(0);
          expect(Object.entries(actual.types)).toHaveLength(0);
        });

        it('finds rate limited followed somewhere by db_query', () => {
          const plan = apiTestModel.methods.scheduled_plan_run_once;
          const text = plan.searchString(SearchAll);
          expect(text).toContain('rate limited');
          expect(text).toContain('db_query');
          const actual = apiTestModel.search('rate limited((.|\\n)*)db_query');
          expect(actual).toBeDefined();
          const methods = allMethods(actual.tags);
          expect(Object.entries(methods)).toHaveLength(2);
          expect(Object.entries(actual.types)).toHaveLength(0);
        });

        it('search anywhere', () => {
          const actual = apiTestModel.search('dashboard', modelAndTypeNames);
          const methods = allMethods(actual.tags);
          expect(Object.entries(methods)).toHaveLength(33);
          const types = Object.entries(actual.types);
          expect(types).toHaveLength(29);
        });

        it('search special names', () => {
          const type = apiTestModel.types.HyphenType;
          expect(type).toBeDefined();
          const search = type.searchString(standardSet);
          expect(search).toContain('computation time');
          expect(search).toContain('project-digest');
          let actual = apiTestModel.search('computation time', standardSet);
          let methods = allMethods(actual.tags);
          expect(Object.entries(methods)).toHaveLength(0);
          expect(Object.entries(actual.types)).toHaveLength(1);
          actual = apiTestModel.search('project-digest', standardSet);
          methods = allMethods(actual.tags);
          expect(Object.entries(methods)).toHaveLength(0);
          expect(Object.entries(actual.types)).toHaveLength(1);
        });

        it('search for word', () => {
          let actual = apiTestModel.search(
            '\\bdashboard\\b',
            modelAndTypeNames
          );
          let methods = allMethods(actual.tags);
          expect(Object.entries(methods)).toHaveLength(18);
          expect(Object.entries(actual.types)).toHaveLength(1);
          actual = apiTestModel.search(
            '\\bdashboardbase\\b',
            modelAndTypeNames
          );
          methods = allMethods(actual.tags);
          expect(Object.entries(methods)).toHaveLength(1);
          expect(Object.entries(actual.types)).toHaveLength(1);
        });

        it('search for slug', () => {
          const actual = apiTestModel.search('\\bslug\\b', standardSet);
          const methods = allMethods(actual.tags);
          expect(Object.entries(methods)).toHaveLength(33);
          expect(Object.entries(actual.types)).toHaveLength(21);
        });

        it('find rate_limited endpoints', () => {
          const actual = apiTestModel.search('rate_limited', SearchAll);
          const methods = allMethods(actual.tags);
          expect(Object.entries(methods)).toHaveLength(11);
          expect(Object.entries(actual.types)).toHaveLength(0);
        });

        it('finds rate_limited followed somewhere by db_query', () => {
          const plan = apiTestModel.methods.scheduled_plan_run_once;
          const text = plan.searchString(SearchAll);
          expect(text).toContain('rate limited');
          expect(text).toContain('db_query');
          const actual = apiTestModel.search('rate_limited.*db_query');
          expect(actual).toBeDefined();
          const methods = allMethods(actual.tags);
          expect(Object.entries(methods)).toHaveLength(2);
          expect(Object.entries(actual.types)).toHaveLength(0);
        });

        it('just model names', () => {
          const actual = apiTestModel.search('\\bdashboard\\b', modelNames);
          const methods = allMethods(actual.tags);
          expect(Object.entries(methods)).toHaveLength(16);
          expect(Object.entries(actual.types)).toHaveLength(0);
        });

        it('deprecated items', () => {
          const actual = apiTestModel.search('deprecated', statusCriteria);
          expect(Object.entries(allMethods(actual.tags))).toHaveLength(8);
          expect(Object.entries(actual.types)).toHaveLength(3);
        });

        it('beta items', () => {
          const actual = apiTestModel.search('beta', statusCriteria);
          expect(Object.entries(allMethods(actual.tags))).toHaveLength(238);
          const types = Object.entries(actual.types);
          expect(types).toHaveLength(129);
        });

        it('stable items', () => {
          const actual = apiTestModel.search('stable', statusCriteria);
          const methods = allMethods(actual.tags);
          expect(Object.entries(methods)).toHaveLength(155);
          expect(Object.entries(actual.types)).toHaveLength(91);
        });

        it('db queries', () => {
          const actual = apiTestModel.search('db_query', activityCriteria);
          expect(Object.entries(allMethods(actual.tags))).toHaveLength(37);
          expect(Object.entries(actual.types)).toHaveLength(0);
        });
      });

      describe('response search', () => {
        it('find binary responses', () => {
          const actual = apiTestModel.search('binary', responseCriteria);
          expect(Object.entries(allMethods(actual.tags))).toHaveLength(7);
          expect(Object.entries(actual.types)).toHaveLength(0);
        });
      });

      describe('criteria transformations', () => {
        it('criterion name array to criteria', () => {
          const expected = new Set([
            SearchCriterion.method,
            SearchCriterion.type,
            SearchCriterion.name,
          ]);
          // this declaration pattern assures correct enum names
          const names: SearchCriterionTerm[] = ['method', 'type', 'name'];
          const actual = criteriaToSet(names);
          expect(actual).toEqual(expected);
        });

        it('criteria to criterion name array', () => {
          const criteria = new Set([
            SearchCriterion.method,
            SearchCriterion.type,
            SearchCriterion.name,
          ]);
          const expected: SearchCriterionTerm[] = ['method', 'type', 'name'];
          const actual = setToCriteria(criteria);
          expect(actual).toEqual(expected);
        });

        it('strings to criteria', () => {
          const expected = new Set([
            SearchCriterion.method,
            SearchCriterion.type,
            SearchCriterion.name,
          ]);
          const values = ['method', 'type', 'name'];
          const names = values as SearchCriterionTerm[];
          const actual = criteriaToSet(names);
          expect(actual).toEqual(expected);
        });

        it('criteria is case sensitive', () => {
          const expected = new Set([
            SearchCriterion.method,
            SearchCriterion.name,
          ]);
          const values = ['method', 'Type', 'name'];
          const names = values as SearchCriterionTerm[];
          const actual = criteriaToSet(names);
          expect(actual).toEqual(expected);
        });

        it('criteria to strings', () => {
          const criteria = new Set([
            SearchCriterion.method,
            SearchCriterion.type,
            SearchCriterion.name,
          ]);
          const expected = ['method', 'type', 'name'];
          const actual = setToCriteria(criteria);
          expect(actual).toEqual(expected);
        });
      });
    });

    describe('tagging', () => {
      describe('method tagging', () => {
        it('methods are tagged', () => {
          const actual = apiTestModel.tags;
          expect(Object.entries(actual)).toHaveLength(28);
        });

        it('methods are in the right tag', () => {
          const actual = apiTestModel.tags.Theme;
          expect(Object.entries(actual)).toHaveLength(11);
        });
      });

      describe('type tagging', () => {
        it('types are tagged', () => {
          const actual = apiTestModel.typeTags;
          expect(Object.entries(actual)).toHaveLength(28);
        });

        it('types are in the right tag', () => {
          const actual = apiTestModel.typeTags.Theme;
          expect(Object.entries(actual)).toHaveLength(7);
        });

        it('specification metaType is MetaType.Specification', () => {
          const actual = apiTestModel.types.Error;
          expect(actual.metaType).toEqual(MetaType.Specification);
          expect(actual.metaType.toString()).toEqual('Specification');
        });

        it('request metaType is MetaType.Request', () => {
          const actual = apiTestModel.types.RequestActiveThemes;
          expect(actual.metaType).toEqual(MetaType.Request);
          expect(actual.metaType.toString()).toEqual('Request');
        });

        it('write metaType is MetaType.Request', () => {
          const actual = apiTestModel.types.WriteQuery;
          expect(actual.metaType).toEqual(MetaType.Write);
          expect(actual.metaType.toString()).toEqual('Write');
        });

        it('enum metaType is MetaType.Enumerated', () => {
          const actual = apiTestModel.types.ResultFormat;
          expect(actual.metaType).toEqual(MetaType.Enumerated);
          expect(actual.metaType.toString()).toEqual('Enumerated');
        });

        it('intrinsic metaType is MetaType.Intrinsic', () => {
          const actual = apiTestModel.types.datetime;
          expect(actual.metaType).toEqual(MetaType.Intrinsic);
          expect(actual.metaType.toString()).toEqual('Intrinsic');
        });
      });
    });

    describe('json stringify works', () => {
      it('handles login', () => {
        const item = apiTestModel.methods.login;
        expect(item).toBeDefined();
        const actual = JSON.stringify(item, null, 2);
        expect(actual).toBeDefined();
        expect(actual).toContain('"name": "login"');
      });

      it('handles Dashboard', () => {
        const item = apiTestModel.types.Dashboard;
        expect(item).toBeDefined();
        const actual = JSON.stringify(item, null, 2);
        expect(actual).toBeDefined();
        expect(actual).toContain('"name": "Dashboard"');
        expect(actual).toContain('"customType": "Dashboard"');
      });

      it('handles dashboard_dashboard_elements', () => {
        const item = apiTestModel.methods.dashboard_dashboard_elements;
        expect(item).toBeDefined();
        const actual = JSON.stringify(item, null, 2);
        expect(actual).toBeDefined();
        expect(actual).toContain('"name": "dashboard_dashboard_elements"');
      });
    });

    describe('summary', () => {
      it('should summarize a property', () => {
        const actual = apiTestModel.types.Dashboard.properties.id.summary();
        expect(actual).toEqual('Dashboard.id:string readOnly');
      });

      it('should summarize a parameter', () => {
        const method = apiTestModel.methods.create_dashboard;
        const actual = method.allParams[0].summary();
        expect(actual).toEqual('create_dashboard.body:Dashboard required');
      });
    });

    describe('signature', () => {
      it('should summarize a method with params', () => {
        const actual = apiTestModel.methods.create_look.signature();
        expect(actual).toEqual(
          'create_look(body:LookWithQuery, [fields:string])'
        );
      });

      it('should summarize a method without params', () => {
        const actual = apiTestModel.methods.logout.signature();
        expect(actual).toEqual('logout()');
      });

      it('should summarize a parameter', () => {
        const allParams = apiTestModel.methods.create_look.allParams;
        const actual = allParams
          .find(param => param.name === 'fields')
          ?.signature();
        expect(actual).toEqual('[fields:string]');
      });
    });

    describe('asHashString', () => {
      it('should hash a property', () => {
        const prop = apiTestModel.types.Dashboard.properties.id;
        const actual = prop.asHashString();
        expect(actual).toEqual('id:string readOnly');
      });
    });

    describe('id', () => {
      it('method.id should be httpMethod + endpoint', () => {
        const method = apiTestModel.methods.create_look;
        const actual = method.id;
        expect(actual).toEqual(`${method.httpMethod} ${method.endpoint}`);
      });
    });
  });
});
