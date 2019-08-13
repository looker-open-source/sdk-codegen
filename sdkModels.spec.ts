import * as Models from "./sdkModels"
import { debug } from "./utils"

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
      debug('requestType', actual)
    })

    it('search_spaces', () => {
      const method = apiModel.methods['search_spaces']
      const actual = apiModel.getRequestType(method)
      expect(actual).toBeDefined()
      if (actual) {
        expect(actual.properties['fields']).toBeDefined()
      }
      debug('requestType', actual)
    })

  })

  describe('writeable logic', () => {

    it('CredentialsApi3', () => {
      const type = apiModel.types['CredentialsApi3']
      const writeable = type.writeable
      expect(type.readOnly).toEqual(true)
      expect(writeable.length).toEqual(0)
    })

    it('CredentialsApi3[]', () => {
      const type = apiModel.types['CredentialsApi3[]']
      const writeable = type.writeable
      expect(type.readOnly).toEqual(true)
      expect(writeable.length).toEqual(0)
    })

    describe('DashboardElement', () => {
      it('writeable', () => {
        const type = apiModel.types['DashboardElement']
        const writeable = type.writeable
        expect(type.readOnly).toEqual(false)
        expect(writeable.length).toEqual(14)
      })

      it('writeableType', () => {
        const type = apiModel.types['DashboardElement']
        const actual = apiModel.getWriteableType(type)
        expect(actual).toBeDefined()
        if (actual) {
          expect(actual.properties['body_text']).toBeDefined()
          expect(actual.properties['body_text_as_html']).toBeDefined()
          expect(actual.properties['dashboard_id']).toBeDefined()
          expect(actual.properties['edit_uri']).toBeDefined()
          expect(actual.properties['look_id']).toBeDefined()
        }
        debug('writeType', actual)
      })

    })

  })

})
