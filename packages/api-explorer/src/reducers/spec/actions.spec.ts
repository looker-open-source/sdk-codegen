import { specs } from '../../test-data'
import { selectSpec } from './actions'

describe('Spec reducer actions', () => {
  test('returns a SELECT_SPEC action object with provided values', () => {
    const action = selectSpec(specs, '3.1')
    expect(action).toEqual({
      type: 'SELECT_SPEC',
      key: '3.1',
      payload: specs,
    })
  })
})
