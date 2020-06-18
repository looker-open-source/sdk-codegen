import { ApiModel } from '@looker/sdk-codegen'

import { specs } from '../../test-data'
import { specReducer } from './reducer'
import { fetchSpec } from './utils'

describe('Spec Reducer', () => {
  test('it selects a spec', () => {
    const action = {
      type: 'SELECT_SPEC',
      key: '4.0',
      payload: specs,
    }
    const state = specReducer(fetchSpec('3.1', specs), action)
    expect(state.api).toBeInstanceOf(ApiModel)
    expect(state.key).toEqual('4.0')
    expect(state.status).toEqual(action.payload['4.0'].status)
  })
})
