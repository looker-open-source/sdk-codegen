import * as Models from "./sdkModels"
import { debug } from "./utils"

const apiModel = Models.ApiModel.fromFile('./Looker.3.1.oas.json')

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


})
