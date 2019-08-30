import * as Models from './sdkModels'

const apiModel = Models.ApiModel.fromFile('Looker.3.1.oas.json')

describe('sdkModels', () => {

  describe('request type determination', () => {

    it('search_looks', () => {
      const method = apiModel.methods['search_looks']
      const actual = apiModel.getRequestType(method)
      expect(actual).toBeDefined()
      if (actual) {
        expect(actual.properties['title']).toBeDefined()
      }
    })

    it('search_spaces', () => {
      const method = apiModel.methods['search_spaces']
      const actual = apiModel.getRequestType(method)
      expect(actual).toBeDefined()
      if (actual) {
        expect(actual.properties['fields']).toBeDefined()
      }
    })

  })

  describe('required properties', () => {

    it('CreateQueryTask', () => {
      const type = apiModel.types['CreateQueryTask']
      const actual = apiModel.getWriteableType(type)
      expect(actual).toBeDefined()
      expect(type.properties['query_id'].required).toEqual(true)
      expect(type.properties['result_format'].required).toEqual(true)
      expect(type.properties['source'].required).toEqual(false)
    })

    it('WriteCreateQueryTask', () => {
      const type = apiModel.getWriteableType(apiModel.types['CreateQueryTask'])
      expect(type).toBeDefined()
      expect(type!.properties['query_id'].required).toEqual(true)
      expect(type!.properties['result_format'].required).toEqual(true)
      expect(type!.properties['source'].required).toEqual(false)
    })
  })

  describe('writeable logic', () => {

    it('CredentialsApi3', () => {
      const type = apiModel.types['CredentialsApi3']
      const writeable = type.writeable
      expect(type.readOnly).toEqual(true)
      expect(writeable.length).toEqual(0)
    })

    describe('DashboardElement', () => {
      it('writeable', () => {
        const type = apiModel.types['DashboardElement']
        const writeable = type.writeable
        expect(type.readOnly).toEqual(false)
        expect(writeable.length).toEqual(17)
      })

      it('writeableType', () => {
        const type = apiModel.types['DashboardElement']
        const actual = apiModel.getWriteableType(type)
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
