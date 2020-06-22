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

import * as OAS from 'openapi3-ts'
import { TestConfig } from './testUtils'
import {
  ArrayType,
  CriteriaToSet,
  DelimArrayType,
  IMethod,
  IMethodResponse,
  IntrinsicType,
  TagList,
  IType,
  keyValues,
  Method,
  methodRefs,
  SearchCriterion,
  SearchCriterionTerm,
  SetToCriteria,
  typeRefs,
  EnumType,
  IEnumType,
  mayQuote,
  ApiModel,
  titleCase,
  camelCase,
  firstCase,
} from './sdkModels'

const config = TestConfig()
const apiTestModel = config.apiTestModel

describe('sdkModels', () => {
  describe('mayQuote', () => {
    it('quotes foo-bar', () => {
      expect(mayQuote('foo-bar')).toEqual(`'foo-bar'`)
    })
    it('does not quote foo_bar', () => {
      expect(mayQuote('foo_bar')).toEqual(`foo_bar`)
    })
    it('quotes " foo_bar"', () => {
      expect(mayQuote(' foo_bar')).toEqual(`' foo_bar'`)
    })
    it('does not quote _foo_bar_', () => {
      expect(mayQuote('_foo_bar_')).toEqual(`_foo_bar_`)
    })
  })

  describe('camelCase', () => {
    it('empty is empty', () => {
      expect(camelCase('')).toEqual('')
    })
    it('foo-bar is fooBar', () => {
      expect(camelCase('foo-bar')).toEqual('fooBar')
    })
    it('foo_bar is fooBar', () => {
      expect(camelCase('foo_bar')).toEqual('fooBar')
    })
    it('foobar is foobar', () => {
      expect(camelCase('foobar')).toEqual('foobar')
    })
    it('FOOBAR is FOOBAR', () => {
      expect(camelCase('FOOBAR')).toEqual('FOOBAR')
    })
  })

  describe('titleCase', () => {
    it('empty is empty', () => {
      expect(titleCase('')).toEqual('')
    })
    it('foo-bar is FooBar', () => {
      expect(titleCase('foo-bar')).toEqual('FooBar')
    })
    it('foo_bar is FooBar', () => {
      expect(titleCase('foo_bar')).toEqual('FooBar')
    })
    it('foobar is foobar', () => {
      expect(titleCase('foobar')).toEqual('Foobar')
    })
    it('FOOBAR is Foobar', () => {
      expect(titleCase('FOOBAR')).toEqual('FOOBAR')
    })
  })

  describe('firstCase', () => {
    it('empty is empty', () => {
      expect(firstCase('')).toEqual('')
    })
    it('foo-bar is Foobar', () => {
      expect(firstCase('foo-bar')).toEqual('Foobar')
    })
    it('foo_bar is Foobar', () => {
      expect(firstCase('foo_bar')).toEqual('Foobar')
    })
    it('foobar is Foobar', () => {
      expect(firstCase('foobar')).toEqual('Foobar')
    })
    it('FOOBAR is Foobar', () => {
      expect(firstCase('FOOBAR')).toEqual('Foobar')
    })
  })

  describe('full names', () => {
    describe('for methods', () => {
      it('method full name is eponymous', () => {
        const method = apiTestModel.methods.search_looks
        expect(method).toBeDefined()
        expect(method.fullName).toEqual(method.name)
      })

      it('method.parameter full name has method name prefix', () => {
        const method = apiTestModel.methods.search_looks
        expect(method).toBeDefined()
        const item = method.params[0]
        expect(item.fullName).toEqual(`${method.name}.${item.name}`)
      })
    })

    describe('for types', () => {
      it('type full name is eponymous', () => {
        const method = apiTestModel.methods.search_looks
        expect(method).toBeDefined()
        expect(method.fullName).toEqual(method.name)
      })

      it('type.property full name has method name prefix', () => {
        const type = apiTestModel.types.Dashboard
        expect(type).toBeDefined()
        Object.values(type.properties).forEach((item) => {
          expect(item.fullName).toEqual(`${type.name}.${item.name}`)
        })
      })
    })
  })

  describe('request type determination', () => {
    it('search_looks', () => {
      const method = apiTestModel.methods.search_looks
      expect(method).toBeDefined()
      const actual = apiTestModel.getRequestType(method)
      expect(actual).toBeDefined()
      if (actual) {
        expect(actual.properties.title).toBeDefined()
      }
    })

    it('search_spaces', () => {
      const method = apiTestModel.methods.search_folders
      expect(method).toBeDefined()
      const actual = apiTestModel.getRequestType(method)
      expect(actual).toBeDefined()
      if (actual) {
        expect(actual.properties.fields).toBeDefined()
      }
    })

    // TODO create a mock spec that has a recursive type, since this no longer does
    // it ('detects recursive types', () => {
    //   const type = apiTestModel.types['LookmlModelExploreField']
    //   const actual = type.isRecursive()
    //   expect(actual).toEqual(true)
    //   type = apiTestModel.types['CredentialsApi3']
    //   actual = type.isRecursive()
    //   expect(actual).toEqual(false)
    // })
  })

  describe('response modes', () => {
    it('binary only', () => {
      const method = apiTestModel.methods.render_task_results
      expect(method).toBeDefined()
      expect(method.responseIsBinary()).toEqual(true)
      expect(method.responseIsString()).toEqual(false)
      expect(method.responseIsBoth()).toEqual(false)
    })

    it('string only', () => {
      const method = apiTestModel.methods.add_group_user
      expect(method).toBeDefined()
      expect(method.responseIsBinary()).toEqual(false)
      expect(method.responseIsString()).toEqual(true)
      expect(method.responseIsBoth()).toEqual(false)
    })

    it('both modes', () => {
      const method = apiTestModel.methods.run_look
      expect(method).toBeDefined()
      expect(method.responseIsBinary()).toEqual(true)
      expect(method.responseIsString()).toEqual(true)
      expect(method.responseIsBoth()).toEqual(true)
    })

    it('each response is described', () => {
      const method = apiTestModel.methods.run_look
      expect(method).toBeDefined()
      expect(method.responses.length).toBeGreaterThan(0)
      method.responses.forEach((r: IMethodResponse) => {
        expect(r.description).not.toEqual('')
      })
    })

    it('ok responses are unique', () => {
      const method = apiTestModel.methods.run_sql_query
      const actual = method.okResponses
      expect(actual.length).toEqual(4)
    })
  })

  describe('required properties', () => {
    it('CreateQueryTask', () => {
      const type = apiTestModel.types.CreateQueryTask
      expect(type).toBeDefined()
      const actual = apiTestModel.mayGetWriteableType(type)
      expect(actual).toBeDefined()
      expect(type.properties.query_id.required).toEqual(true)
      expect(type.properties.result_format.required).toEqual(true)
      expect(type.properties.source.required).toEqual(false)
    })

    it('WriteCreateQueryTask', () => {
      const type = apiTestModel.mayGetWriteableType(
        apiTestModel.types.CreateQueryTask
      )
      expect(type).toBeDefined()
      expect(type?.properties.query_id.required).toEqual(true)
      expect(type?.properties.result_format.required).toEqual(true)
      expect(type?.properties.source.required).toEqual(false)
    })
  })

  describe('writeable logic', () => {
    it('CredentialsApi3', () => {
      const type = apiTestModel.types.CredentialsApi3
      expect(type).toBeDefined()
      const writeable = type.writeable
      expect(type.readOnly).toEqual(true)
      expect(writeable.length).toEqual(0)
    })

    describe('DashboardElement', () => {
      it('writeable', () => {
        const type = apiTestModel.types.DashboardElement
        expect(type).toBeDefined()
        const writeable = type.writeable
        expect(type.readOnly).toEqual(false)
        expect(writeable.length).toEqual(18)
      })

      it('writeableType', () => {
        const type = apiTestModel.types.DashboardElement
        expect(type).toBeDefined()
        const actual = apiTestModel.mayGetWriteableType(type)
        expect(actual).toBeDefined()
        if (actual) {
          expect(actual.properties.body_text).toBeDefined()
          expect(actual.properties.body_text_as_html).not.toBeDefined()
          expect(actual.properties.dashboard_id).toBeDefined()
          expect(actual.properties.edit_uri).not.toBeDefined()
          expect(actual.properties.look_id).toBeDefined()
        }
      })
    })
  })

  describe('enum types', () => {
    const checkEnum = (type: IType, propName: string, values: any[]) => {
      const num = type.properties[propName].type as IEnumType
      expect(num).toBeDefined()
      if (!(num instanceof EnumType))
        console.error(`${type.name}.${propName} should be EnumType`)
      expect(num).toBeInstanceOf(EnumType)
      expect(num.name).toEqual(titleCase(propName))
      expect(num.values).toEqual(values)
    }

    it('registers enum types', () => {
      const types = apiTestModel.types
      expect(types[titleCase('supported_action_types')]).toBeDefined()
      expect(types[titleCase('supported_formattings')]).toBeDefined()
      expect(types[titleCase('pull_request_mode')]).toBeDefined()
    })

    describe('enum naming', () => {
      const rf1: OAS.SchemaObject = {
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
        description: 'RF1',
        nullable: true,
      }

      const rf2: OAS.SchemaObject = {
        name: 'result_format',
        type: 'string',
        'x-looker-values': ['pdf', 'png', 'jpeg'],
        description: 'RF2',
        nullable: true,
      }

      const rf3: OAS.SchemaObject = {
        type: 'string',
        'x-looker-values': ['csv', 'html', 'txt'],
        description: 'RF3',
        nullable: true,
      }

      const rf4: OAS.SchemaObject = {
        name: 'result_format',
        type: 'string',
        'x-looker-values': ['csv', 'html', 'txt', 'xlsx'],
        description: 'RF4',
        nullable: true,
      }

      const rf5: OAS.SchemaObject = {
        name: 'result_format',
        type: 'string',
        enum: [
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
        description: 'RF5',
        nullable: true,
      }

      it('enum types are renamed and not overwritten', () => {
        const api = new ApiModel({} as OAS.OpenAPIObject)
        const actual1 = api.resolveType(rf1)
        expect(actual1.name).toEqual('ResultFormat')

        // Returns first enum for same values
        // the `style` parameter is undefined because it is not part of this tests. Because Typescript arguments are
        // positional only (no named arguments) the parameter must be skipped with an "ignore this" value
        const actual5 = api.resolveType(rf5, undefined, 'Foo')
        expect(actual5.name).toEqual('ResultFormat')
        expect(actual5.description).toEqual(actual1.description)

        const actual2 = api.resolveType(rf2)
        expect(actual2.name).toEqual('ResultFormat1')

        const actual3 = api.resolveType(rf3, undefined, 'result_format')
        expect(actual3.name).toEqual('ResultFormat2')

        const actual4 = api.resolveType(rf4, undefined, undefined, 'Meth')
        expect(actual4.name).toEqual('MethResultFormat')
      })
    })

    it('enum from array type', () => {
      const type = apiTestModel.types.Integration
      expect(type).toBeDefined()
      checkEnum(type, 'supported_formats', [
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
      ])
      checkEnum(type, 'supported_action_types', ['cell', 'query', 'dashboard'])
      checkEnum(type, 'supported_formattings', ['formatted', 'unformatted'])
      checkEnum(type, 'supported_download_settings', ['push', 'url'])
    })

    it('enum from string type', () => {
      const type = apiTestModel.types.Project
      expect(type).toBeDefined()
      checkEnum(type, 'git_application_server_http_scheme', ['http', 'https'])
      checkEnum(type, 'pull_request_mode', [
        'off',
        'links',
        'recommended',
        'required',
      ])
    })
  })

  describe('rate limit', () => {
    it('x-looker-rate-limited', () => {
      const yes = ({
        'x-looker-rate-limited': true,
      } as unknown) as OAS.OperationObject
      const no = ({
        'x-looker-rate-limited': false,
      } as unknown) as OAS.OperationObject
      const nada = {} as OAS.OperationObject

      expect(Method.isRateLimited(yes)).toBe(true)
      expect(Method.isRateLimited(no)).toBe(false)
      expect(Method.isRateLimited(nada)).toBe(false)
    })

    it('X-RateLimit-Limit', () => {
      const yes = ({
        'X-RateLimit-Limit': 0,
      } as unknown) as OAS.OperationObject
      const no = ({
        'x-ratelimit-limit': 0,
      } as unknown) as OAS.OperationObject
      const nada = {} as OAS.OperationObject

      expect(Method.isRateLimited(yes)).toBe(true)
      expect(Method.isRateLimited(no)).toBe(false)
      expect(Method.isRateLimited(nada)).toBe(false)
    })

    it('X-RateLimit-Remaining', () => {
      const yes = ({
        'X-RateLimit-Remaining': 0,
      } as unknown) as OAS.OperationObject
      const no = ({
        'x-ratelimit-remaining': 0,
      } as unknown) as OAS.OperationObject
      const nada = {} as OAS.OperationObject

      expect(Method.isRateLimited(yes)).toBe(true)
      expect(Method.isRateLimited(no)).toBe(false)
      expect(Method.isRateLimited(nada)).toBe(false)
    })

    it('X-RateLimit-Reset', () => {
      const yes = ({
        'X-RateLimit-Reset': 0,
      } as unknown) as OAS.OperationObject
      const no = ({
        'x-ratelimit-reset': 0,
      } as unknown) as OAS.OperationObject
      const nada = {} as OAS.OperationObject

      expect(Method.isRateLimited(yes)).toBe(true)
      expect(Method.isRateLimited(no)).toBe(false)
      expect(Method.isRateLimited(nada)).toBe(false)
    })

    it('X-Rate-Limit-Limit', () => {
      const yes = ({
        'X-Rate-Limit-Limit': 0,
      } as unknown) as OAS.OperationObject
      const no = ({
        'x-rate-limit-limit': 0,
      } as unknown) as OAS.OperationObject
      const nada = {} as OAS.OperationObject

      expect(Method.isRateLimited(yes)).toBe(true)
      expect(Method.isRateLimited(no)).toBe(false)
      expect(Method.isRateLimited(nada)).toBe(false)
    })

    it('X-Rate-Limit-Remaining', () => {
      const yes = ({
        'X-Rate-Limit-Remaining': 0,
      } as unknown) as OAS.OperationObject
      const no = ({
        'x-rate-limit-remaining': 0,
      } as unknown) as OAS.OperationObject
      const nada = {} as OAS.OperationObject

      expect(Method.isRateLimited(yes)).toBe(true)
      expect(Method.isRateLimited(no)).toBe(false)
      expect(Method.isRateLimited(nada)).toBe(false)
    })

    it('X-Rate-Limit-Reset', () => {
      const yes = ({
        'X-Rate-Limit-Reset': 0,
      } as unknown) as OAS.OperationObject
      const no = ({
        'x-rate-limit-reset': 0,
      } as unknown) as OAS.OperationObject
      const nada = {} as OAS.OperationObject

      expect(Method.isRateLimited(yes)).toBe(true)
      expect(Method.isRateLimited(no)).toBe(false)
      expect(Method.isRateLimited(nada)).toBe(false)
    })

    it('scheduled_plan_run_once is rate limited', () => {
      const method = apiTestModel.methods.scheduled_plan_run_once
      expect(method).toBeDefined()
      expect(method.rateLimited).toBe(true)
    })

    it('dashboard is not rate limited', () => {
      const method = apiTestModel.methods.dashboard
      expect(method).toBeDefined()
      expect(method.rateLimited).toBe(false)
    })
  })

  const allMethods = (tags: TagList): Array<IMethod> => {
    const result: Array<IMethod> = []
    Object.entries(tags).forEach(([, methods]) => {
      Object.entries(methods).forEach(([, method]) => {
        result.push(method)
      })
    })
    return result
  }

  const obfuscate = (option: string, element: IType): IType => {
    switch (option) {
      case 'd':
        return new DelimArrayType(element, element.schema)
      case 'a':
        return new ArrayType(element, element.schema)
      default:
        return element
    }
  }

  describe('method and type xrefs', () => {
    describe('custom types', () => {
      it('intrinsic types have undefined custom types', () => {
        const actual = new IntrinsicType('integer')
        expect(actual.customType).toEqual('')
        expect(actual.name).toEqual('integer')
      })

      it('instanceof checks', () => {
        const element = new IntrinsicType('string')
        let actual: IType = {} as IType
        if (element.name === 'string') {
          actual = new ArrayType(element, element.schema)
        }
        expect(actual).toBeDefined()
        expect(actual.instanceOf('ArrayType')).toEqual(true)
        expect(actual.intrinsic).toEqual(false)

        actual = obfuscate('a', element)
        expect(actual).toBeDefined()
        expect(actual instanceof ArrayType).toEqual(true)
        expect(actual.instanceOf('ArrayType')).toEqual(true)

        actual = obfuscate('d', element)
        expect(actual).toBeDefined()
        expect(actual.instanceOf('DelimArrayType')).toEqual(true)

        let method = apiTestModel.methods.query_task_multi_results
        let schema = method.params[0].type.schema
        actual = apiTestModel.resolveType(schema, 'simple')
        expect(actual).toBeDefined()
        expect(actual.instanceOf('DelimArrayType')).toEqual(true)

        let response = method.primaryResponse
        schema = response.type.schema
        actual = apiTestModel.resolveType(schema, 'simple')
        expect(actual).toBeDefined()
        expect(actual.instanceOf('HashType')).toEqual(true)

        method = apiTestModel.methods.all_datagroups
        response = method.primaryResponse
        schema = response.type.schema
        actual = apiTestModel.resolveType(schema)
        expect(actual).toBeDefined()
        expect(actual.instanceOf('ArrayType')).toEqual(true)

        // actual = apiTestModel.resolveType(schema)
        // expect(actual).toBeDefined()
        // expect(actual instanceof ArrayType).toEqual(true)
      })

      it('array type uses element type as custom type', () => {
        const intType = new IntrinsicType('integer')
        const schema = { type: 'mock' } as OAS.SchemaObject
        let actual: IType = new ArrayType(intType, schema)
        expect(actual.customType).toEqual('')
        expect(actual.name).toEqual('integer[]')
        expect(actual instanceof ArrayType).toBeTruthy()
        actual = apiTestModel.types.DashboardBase
        expect(actual.customType).toBe('DashboardBase')
      })
    })

    it('type references custom types and methods referencing', () => {
      // LookModel SpaceBase FolderBase DashboardElement DashboardFilter DashboardLayout DashboardSettings
      const actual = apiTestModel.types.Dashboard
      const customTypes = keyValues(actual.customTypes)
      const types = typeRefs(apiTestModel, actual.customTypes)
      const methodKeys = keyValues(actual.methodRefs)
      const methods = methodRefs(apiTestModel, actual.methodRefs)
      expect(types.length).toEqual(customTypes.length)
      expect(customTypes.join(' ')).toEqual(
        'DashboardAppearance DashboardElement DashboardFilter DashboardLayout FolderBase LookModel WriteDashboard'
      )
      expect(methods.length).toEqual(methodKeys.length)
      expect(methodKeys.join(' ')).toEqual(
        'create_dashboard dashboard folder_dashboards import_lookml_dashboard search_dashboards sync_lookml_dashboard update_dashboard'
      )
    })

    it('missing method references are silently skipped', () => {
      const keys = new Set(['login', 'logout', 'Bogosity'])
      const actual = methodRefs(apiTestModel, keys)
      expect(actual.length).toEqual(2)
    })

    it('missing type references are silently skipped', () => {
      const keys = new Set(['Dashboard', 'User', 'Bogosity'])
      const actual = typeRefs(apiTestModel, keys)
      expect(actual.length).toEqual(2)
    })

    it('method references custom types from parameters and responses', () => {
      const actual = apiTestModel.methods.run_inline_query
      const customTypes = keyValues(actual.customTypes).join(' ')
      expect(customTypes).toEqual(
        'Error Query RequestRunInlineQuery ValidationError WriteQuery'
      )
    })
  })

  describe('searching', () => {
    const modelAndTypeNames = new Set([
      SearchCriterion.method,
      SearchCriterion.type,
      SearchCriterion.name,
    ])
    const standardSet = new Set([
      SearchCriterion.method,
      SearchCriterion.type,
      SearchCriterion.name,
      SearchCriterion.property,
      SearchCriterion.argument,
      SearchCriterion.description,
    ])
    const modelNames = new Set([SearchCriterion.method, SearchCriterion.name])
    const responseCriteria = new Set([SearchCriterion.response])
    const statusCriteria = new Set([SearchCriterion.status])
    const activityCriteria = new Set([SearchCriterion.activityType])

    describe('searchString', () => {
      it('type.searchString', () => {
        const query = apiTestModel.types.Query
        let text = query.searchString(modelAndTypeNames)
        expect(text).toContain('Query')
        text = query.searchString(standardSet)
        expect(text).toContain('slug')
      })

      it('model.searchString', () => {
        const query = apiTestModel.methods.query_for_slug
        let text = query.searchString(modelAndTypeNames)
        expect(text).toContain('query_for_slug')
        text = query.searchString(standardSet)
        expect(text).toContain('slug')
      })
    })

    describe('model search', () => {
      it('target not found', () => {
        const actual = apiTestModel.search(
          'you will not find me anywhere in there, nuh uh'
        )
        expect(actual).toBeDefined()
        const methods = allMethods(actual.tags)
        expect(Object.entries(methods).length).toEqual(0)
        expect(Object.entries(actual.types).length).toEqual(0)
      })

      it('search anywhere', () => {
        const actual = apiTestModel.search('dashboard', modelAndTypeNames)
        const methods = allMethods(actual.tags)
        expect(Object.entries(methods).length).toEqual(33)
        expect(Object.entries(actual.types).length).toEqual(27)
      })

      it('search for word', () => {
        let actual = apiTestModel.search('\\bdashboard\\b', modelAndTypeNames)
        let methods = allMethods(actual.tags)
        expect(Object.entries(methods).length).toEqual(6)
        expect(Object.entries(actual.types).length).toEqual(1)
        actual = apiTestModel.search('\\bdashboardbase\\b', modelAndTypeNames)
        methods = allMethods(actual.tags)
        expect(Object.entries(methods).length).toEqual(1)
        expect(Object.entries(actual.types).length).toEqual(1)
      })

      it('search for slug', () => {
        const actual = apiTestModel.search('\\bslug\\b', standardSet)
        const methods = allMethods(actual.tags)
        expect(Object.entries(methods).length).toEqual(33)
        expect(Object.entries(actual.types).length).toEqual(21)
      })

      it('find rate limited endpoints', () => {
        const actual = apiTestModel.search('rate limited', modelAndTypeNames)
        const methods = allMethods(actual.tags)
        expect(Object.entries(methods).length).toEqual(8)
        expect(Object.entries(actual.types).length).toEqual(0)
      })

      it('just model names', () => {
        const actual = apiTestModel.search('\\bdashboard\\b', modelNames)
        expect(Object.entries(allMethods(actual.tags)).length).toEqual(1)
        expect(Object.entries(actual.types).length).toEqual(0)
      })

      it('deprecated items', () => {
        const actual = apiTestModel.search('deprecated', statusCriteria)
        expect(Object.entries(allMethods(actual.tags)).length).toEqual(6)
        expect(Object.entries(actual.types).length).toEqual(3)
      })

      it('beta items', () => {
        const actual = apiTestModel.search('beta', statusCriteria)
        expect(Object.entries(allMethods(actual.tags)).length).toEqual(201)
        expect(Object.entries(actual.types).length).toEqual(103)
      })

      it('stable items', () => {
        const actual = apiTestModel.search('stable', statusCriteria)
        expect(Object.entries(allMethods(actual.tags)).length).toEqual(153)
        expect(Object.entries(actual.types).length).toEqual(89)
      })

      it('db queries', () => {
        const actual = apiTestModel.search('db_query', activityCriteria)
        expect(Object.entries(allMethods(actual.tags)).length).toEqual(35)
        expect(Object.entries(actual.types).length).toEqual(0)
      })
    })

    describe('response search', () => {
      it('find binary responses', () => {
        const actual = apiTestModel.search('binary', responseCriteria)
        expect(Object.entries(allMethods(actual.tags)).length).toEqual(6)
        expect(Object.entries(actual.types).length).toEqual(0)
      })
    })

    describe('criteria transformations', () => {
      it('criterion name array to criteria', () => {
        const expected = new Set([
          SearchCriterion.method,
          SearchCriterion.type,
          SearchCriterion.name,
        ])
        // this declaration pattern assures correct enum names
        const names: SearchCriterionTerm[] = ['method', 'type', 'name']
        const actual = CriteriaToSet(names)
        expect(actual).toEqual(expected)
      })

      it('criteria to criterion name array', () => {
        const criteria = new Set([
          SearchCriterion.method,
          SearchCriterion.type,
          SearchCriterion.name,
        ])
        const expected: SearchCriterionTerm[] = ['method', 'type', 'name']
        const actual = SetToCriteria(criteria)
        expect(actual).toEqual(expected)
      })

      it('strings to criteria', () => {
        const expected = new Set([
          SearchCriterion.method,
          SearchCriterion.type,
          SearchCriterion.name,
        ])
        const values = ['method', 'type', 'name']
        const names = values as SearchCriterionTerm[]
        const actual = CriteriaToSet(names)
        expect(actual).toEqual(expected)
      })

      it('criteria is case insensitive', () => {
        const expected = new Set([
          SearchCriterion.method,
          SearchCriterion.type,
          SearchCriterion.name,
        ])
        const values = ['Method', 'Type', 'name']
        const names = values as SearchCriterionTerm[]
        const actual = CriteriaToSet(names)
        expect(actual).toEqual(expected)
      })

      it('criteria to strings', () => {
        const criteria = new Set([
          SearchCriterion.method,
          SearchCriterion.type,
          SearchCriterion.name,
        ])
        const expected = ['method', 'type', 'name']
        const actual = SetToCriteria(criteria)
        expect(actual).toEqual(expected)
      })
    })
  })

  describe('tagging', () => {
    it('methods are tagged', () => {
      const actual = apiTestModel.tags
      expect(Object.entries(actual).length).toEqual(26)
    })

    it('methods are in the right tag', () => {
      const actual = apiTestModel.tags.Theme
      expect(Object.entries(actual).length).toEqual(11)
    })
  })

  describe('json stringify works', () => {
    it('handles login', () => {
      const item = apiTestModel.methods.login
      expect(item).toBeDefined()
      const actual = JSON.stringify(item, null, 2)
      expect(actual).toBeDefined()
      expect(actual).toContain('"name": "login"')
    })

    it('handles Dashboard', () => {
      const item = apiTestModel.types.Dashboard
      expect(item).toBeDefined()
      const actual = JSON.stringify(item, null, 2)
      expect(actual).toBeDefined()
      expect(actual).toContain('"name": "Dashboard"')
      expect(actual).toContain('"customType": "Dashboard"')
    })

    it('handles dashboard_dashboard_elements', () => {
      const item = apiTestModel.methods.dashboard_dashboard_elements
      expect(item).toBeDefined()
      const actual = JSON.stringify(item, null, 2)
      expect(actual).toBeDefined()
      expect(actual).toContain('"name": "dashboard_dashboard_elements"')
    })
  })
})
