import { buildMethodPath, buildTypePath } from './path'

describe('path utils', () => {
  describe('buildMethodPath', () => {
    test('it builds a method path', () => {
      const path = buildMethodPath('3.1', 'Dashboard', 'create_dashboard')
      expect(path).toEqual('/3.1/methods/Dashboard/create_dashboard')
    })
  })

  describe('buildTypePath', () => {
    const path = buildTypePath('3.1', 'WriteDashboard')
    expect(path).toEqual('/3.1/types/WriteDashboard')
  })
})
