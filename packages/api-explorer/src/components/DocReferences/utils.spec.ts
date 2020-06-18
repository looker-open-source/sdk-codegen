import { api } from '../../test-data'
import { buildPath } from './utils'

describe('DocReferences utils', () => {
  describe('buildPath', () => {
    test('given a method it builds a method path', () => {
      const path = buildPath(api, api.methods.create_dashboard, '3.1')
      expect(path).toEqual('/3.1/methods/Dashboard/create_dashboard')
    })

    test('given a type it creates a type path', () => {
      const path = buildPath(api, api.types.Dashboard, '3.1')
      expect(path).toEqual('/3.1/types/Dashboard')
    })
  })
})
