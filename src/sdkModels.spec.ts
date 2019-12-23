import * as Models from './sdkModels'

export const apiTestModel = Models.ApiModel.fromFile('Looker.4.0.oas.json', 'Looker.4.0.json')

describe('sdkModels', () => {

  describe('request type determination', () => {

    it('search_looks', () => {
      const method = apiTestModel.methods['search_looks']
      const actual = apiTestModel.getRequestType(method)
      expect(actual).toBeDefined()
      if (actual) {
        expect(actual.properties['title']).toBeDefined()
      }
    })

    it('search_spaces', () => {
      const method = apiTestModel.methods['search_spaces']
      const actual = apiTestModel.getRequestType(method)
      expect(actual).toBeDefined()
      if (actual) {
        expect(actual.properties['fields']).toBeDefined()
      }
    })

    // TODO create a mock spec that has a recursive type, since this no longer does
    // it ('detects recursive types', () => {
    //   let type = apiTestModel.types['LookmlModelExploreField']
    //   let actual = type.isRecursive()
    //   expect(actual).toEqual(true)
    //   type = apiTestModel.types['CredentialsApi3']
    //   actual = type.isRecursive()
    //   expect(actual).toEqual(false)
    // })
  })

  describe('response modes', () => {

    it('binary only', () => {
      const method = apiTestModel.methods['render_task_results']
      expect(method.responseIsBinary()).toEqual(true)
      expect(method.responseIsString()).toEqual(false)
      expect(method.responseIsBoth()).toEqual(false)
    })

    it('string only', () => {
      const method = apiTestModel.methods['add_group_user']
      expect(method.responseIsBinary()).toEqual(false)
      expect(method.responseIsString()).toEqual(true)
      expect(method.responseIsBoth()).toEqual(false)
    })

    it('both modes', () => {
      const method = apiTestModel.methods['run_look']
      expect(method.responseIsBinary()).toEqual(true)
      expect(method.responseIsString()).toEqual(true)
      expect(method.responseIsBoth()).toEqual(true)
    })

  })

  describe('required properties', () => {

    it('CreateQueryTask', () => {
      const type = apiTestModel.types['CreateQueryTask']
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
      const writeable = type.writeable
      expect(type.readOnly).toEqual(true)
      expect(writeable.length).toEqual(0)
    })

    describe('DashboardElement', () => {
      it('writeable', () => {
        const type = apiTestModel.types['DashboardElement']
        const writeable = type.writeable
        expect(type.readOnly).toEqual(false)
        expect(writeable.length).toEqual(17)
      })

      it('writeableType', () => {
        const type = apiTestModel.types['DashboardElement']
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

})
