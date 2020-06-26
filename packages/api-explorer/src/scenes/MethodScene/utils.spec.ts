import { api } from '../../test-data'
import { copyAndCleanResponse, responsePropsToOmit } from './utils'

describe('cleanResponse', () => {
  test('it omits the right paths', () => {
    const obj = api.methods.theme.primaryResponse
    const actual = copyAndCleanResponse(obj)
    expect(actual).not.toHaveProperty(responsePropsToOmit)
    Object.values(actual).forEach((val) => {
      if (val instanceof Object) {
        expect(val).not.toHaveProperty(responsePropsToOmit)
      }
    })
  })
})
