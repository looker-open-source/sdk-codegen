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

import * as OAS from 'openapi3-ts'
import {
  ArrayType,
  CriteriaToSet,
  IMethod, IMethodResponse,
  IntrinsicType,
  ITagList, IType, keyValues, methodRefs,
  SearchCriterion,
  SearchCriterionTerm,
  SetToCriteria, typeRefs,
} from './sdkModels'

import { apiTestModel } from '../../script/testUtils'

describe('sdkModels', () => {

  describe('request type determination', () => {

    it('search_looks', () => {
      const method = apiTestModel.methods['search_looks']
      expect(method).toBeDefined()
      const actual = apiTestModel.getRequestType(method)
      expect(actual).toBeDefined()
      if (actual) {
        expect(actual.properties['title']).toBeDefined()
      }
    })

    it('search_spaces', () => {
      const method = apiTestModel.methods['search_folders']
      expect(method).toBeDefined()
      const actual = apiTestModel.getRequestType(method)
      expect(actual).toBeDefined()
      if (actual) {
        expect(actual.properties['fields']).toBeDefined()
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
      const method = apiTestModel.methods['render_task_results']
      expect(method).toBeDefined()
      expect(method.responseIsBinary()).toEqual(true)
      expect(method.responseIsString()).toEqual(false)
      expect(method.responseIsBoth()).toEqual(false)
    })

    it('string only', () => {
      const method = apiTestModel.methods['add_group_user']
      expect(method).toBeDefined()
      expect(method.responseIsBinary()).toEqual(false)
      expect(method.responseIsString()).toEqual(true)
      expect(method.responseIsBoth()).toEqual(false)
    })

    it('both modes', () => {
      const method = apiTestModel.methods['run_look']
      expect(method).toBeDefined()
      expect(method.responseIsBinary()).toEqual(true)
      expect(method.responseIsString()).toEqual(true)
      expect(method.responseIsBoth()).toEqual(true)
    })

    it('each response is described', () => {
      const method = apiTestModel.methods['run_look']
      expect(method).toBeDefined()
      expect(method.responses.length).toBeGreaterThan(0)
      method.responses.forEach(((r: IMethodResponse) => {
        expect(r.description).not.toEqual("")
      }))
    })
  })

  describe('required properties', () => {

    it('CreateQueryTask', () => {
      const type = apiTestModel.types['CreateQueryTask']
      expect(type).toBeDefined()
      const actual = apiTestModel.getWriteableType(type)
      expect(actual).toBeDefined()
      expect(type.properties['query_id'].required).toEqual(true)
      expect(type.properties['result_format'].required).toEqual(true)
      expect(type.properties['source'].required).toEqual(false)
    })

    it('WriteCreateQueryTask', () => {
      const type = apiTestModel.getWriteableType(apiTestModel.types['CreateQueryTask'])
      expect(type).toBeDefined()
      expect(type!.properties['query_id'].required).toEqual(true)
      expect(type!.properties['result_format'].required).toEqual(true)
      expect(type!.properties['source'].required).toEqual(false)
    })
  })

  describe('writeable logic', () => {

    it('CredentialsApi3', () => {
      const type = apiTestModel.types['CredentialsApi3']
      expect(type).toBeDefined()
      const writeable = type.writeable
      expect(type.readOnly).toEqual(true)
      expect(writeable.length).toEqual(0)
    })

    describe('DashboardElement', () => {
      it('writeable', () => {
        const type = apiTestModel.types['DashboardElement']
        expect(type).toBeDefined()
        const writeable = type.writeable
        expect(type.readOnly).toEqual(false)
        expect(writeable.length).toEqual(18)
      })

      it('writeableType', () => {
        const type = apiTestModel.types['DashboardElement']
        expect(type).toBeDefined()
        const actual = apiTestModel.getWriteableType(type)
        expect(actual).toBeDefined()
        if (actual) {
          expect(actual.properties['body_text']).toBeDefined()
          expect(actual.properties['body_text_as_html']).not.toBeDefined()
          expect(actual.properties['dashboard_id']).toBeDefined()
          expect(actual.properties['edit_uri']).not.toBeDefined()
          expect(actual.properties['look_id']).toBeDefined()
        }
      })

    })

  })

  const allMethods = (tags: ITagList): Array<IMethod> => {
    const result: Array<IMethod> = []
    Object.entries(tags).forEach(([, methods]) => {
      Object.entries(methods).forEach(([, method]) => {
        result.push(method)
      })
    })
    return result
  }

  describe('method and type xrefs', () => {
    describe('custom types', () => {
      it('intrinsic types have undefined custom types', () => {
        const actual = new IntrinsicType('integer')
        expect(actual.customType).toEqual('')
        expect(actual.name).toEqual('integer')
      })

      it('array type uses element type as custom type', () => {
        const intType = new IntrinsicType('integer')
        const schema = { type: 'mock' } as OAS.SchemaObject
        let actual: IType = new ArrayType(intType, schema)
        expect(actual.customType).toEqual('')
        expect(actual.name).toEqual('integer[]')
        actual = apiTestModel.types['DashboardBase']
        expect(actual.customType).toBe('DashboardBase')
      })
    })

    it('type references custom types and methods referencing', () => {
      // LookModel SpaceBase FolderBase DashboardElement DashboardFilter DashboardLayout DashboardSettings
      const actual = apiTestModel.types['Dashboard']
      const customTypes = keyValues(actual.customTypes)
      const types = typeRefs(apiTestModel, actual.customTypes)
      const methodKeys = keyValues(actual.methodRefs)
      const methods = methodRefs(apiTestModel, actual.methodRefs)
      expect(types.length).toEqual(customTypes.length)
      expect(customTypes.join(" ")).toEqual(
        'DashboardAppearance DashboardElement DashboardFilter DashboardLayout FolderBase LookModel')
      expect(methods.length).toEqual(methodKeys.length)
      expect(methodKeys.join(" ")).toEqual(
        'create_dashboard dashboard folder_dashboards import_lookml_dashboard search_dashboards sync_lookml_dashboard update_dashboard')
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
      const actual = apiTestModel.methods['run_inline_query']
      const customTypes = keyValues(actual.customTypes).join(" ")
      expect(customTypes).toEqual('Error Query ValidationError')
    })

  })

  describe('searching', () => {

    const modelAndTypeNames = new Set([SearchCriterion.method, SearchCriterion.type, SearchCriterion.name])
    const modelNames = new Set([SearchCriterion.method, SearchCriterion.name])
    const responseCriteria = new Set([SearchCriterion.response])
    const statusCriteria = new Set([SearchCriterion.status])
    const activityCriteria = new Set([SearchCriterion.activityType])

    describe('model search', () => {
      it('target not found', () => {
        const actual = apiTestModel.search('you will not find me anywhere in there, nuh uh')
        expect(actual).toBeDefined()
        const methods = allMethods(actual.tags)
        expect(Object.entries(methods).length).toEqual(0)
        expect(Object.entries(actual.types).length).toEqual(0)
      })

      it('search anywhere', () => {
        const actual = apiTestModel.search('dashboard', modelAndTypeNames)
        const methods = allMethods(actual.tags)
        expect(Object.entries(methods).length).toEqual(32)
        expect(Object.entries(actual.types).length).toEqual(15)
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

      it('just model names', () => {
        const actual = apiTestModel.search('\\bdashboard\\b', modelNames)
        expect(Object.entries(allMethods(actual.tags)).length).toEqual(1)
        expect(Object.entries(actual.types).length).toEqual(0)
      })

      it('deprecated items', () => {
        const actual = apiTestModel.search('deprecated', statusCriteria)
        expect(Object.entries(allMethods(actual.tags)).length).toEqual(6)
        expect(Object.entries(actual.types).length).toEqual(4)
      })

      it('beta items', () => {
        const actual = apiTestModel.search('beta', statusCriteria)
        expect(Object.entries(allMethods(actual.tags)).length).toEqual(198)
        expect(Object.entries(actual.types).length).toEqual(98)
      })

      it('stable items', () => {
        const actual = apiTestModel.search('stable', statusCriteria)
        expect(Object.entries(allMethods(actual.tags)).length).toEqual(153)
        expect(Object.entries(actual.types).length).toEqual(88)
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

      it('find rate limited responses', () => {
        const actual = apiTestModel.search('429', responseCriteria)
        const methods = allMethods(actual.tags)
        expect(Object.entries(methods).length).toEqual(107)
        expect(Object.entries(actual.types).length).toEqual(0)
      })
    })

    describe('criteria transformations', () => {
      it('criterion name array to criteria', () => {
        const expected = new Set([SearchCriterion.method, SearchCriterion.type, SearchCriterion.name])
        // this declaration pattern assures correct enum names
        const names: SearchCriterionTerm[] = ['method', 'type', 'name']
        const actual = CriteriaToSet(names)
        expect(actual).toEqual(expected)
      })

      it('criteria to criterion name array', () => {
        const criteria = new Set([SearchCriterion.method, SearchCriterion.type, SearchCriterion.name])
        const expected: SearchCriterionTerm[] = ['method', 'type', 'name']
        const actual = SetToCriteria(criteria)
        expect(actual).toEqual(expected)
      })

      it('strings to criteria', () => {
        const expected = new Set([SearchCriterion.method, SearchCriterion.type, SearchCriterion.name])
        const values = ['method', 'type', 'name']
        const names = values as SearchCriterionTerm[]
        const actual = CriteriaToSet(names)
        expect(actual).toEqual(expected)
      })

      it('criteria is case insensitive', () => {
        const expected = new Set([SearchCriterion.method, SearchCriterion.type, SearchCriterion.name])
        const values = ['Method', 'Type', 'name']
        const names = values as SearchCriterionTerm[]
        const actual = CriteriaToSet(names)
        expect(actual).toEqual(expected)
      })

      it('criteria to strings', () => {
        const criteria = new Set([SearchCriterion.method, SearchCriterion.type, SearchCriterion.name])
        const expected = ['method', 'type', 'name']
        const actual = SetToCriteria(criteria)
        expect(actual).toEqual(expected)
      })
    })
  })

  describe('tagging', () => {
    it('methods are tagged', () => {
      const actual = apiTestModel.tags
      expect(Object.entries(actual).length).toEqual(25)
    })

    it('methods are in the right tag', () => {
      const actual = apiTestModel.tags['Theme']
      expect(Object.entries(actual).length).toEqual(11)
    })

  })

  describe('json stringify works', () => {
    it('handles login', () => {
      const item = apiTestModel.methods['login']
      expect(item).toBeDefined()
      const actual = JSON.stringify(item, null, 2)
      expect(actual).toBeDefined()
      expect(actual).toContain('"name": "login"')
    })

    it('handles Dashboard', () => {
      const item = apiTestModel.types['Dashboard']
      expect(item).toBeDefined()
      const actual = JSON.stringify(item, null, 2)
      expect(actual).toBeDefined()
      expect(actual).toContain('"name": "Dashboard"')
      expect(actual).toContain('"customType": "Dashboard"')
    })

    it('handles dashboard_dashboard_elements', () => {
      const item = apiTestModel.methods['dashboard_dashboard_elements']
      expect(item).toBeDefined()
      const actual = JSON.stringify(item, null, 2)
      expect(actual).toBeDefined()
      expect(actual).toContain('"name": "dashboard_dashboard_elements"')
    })
  })
})
