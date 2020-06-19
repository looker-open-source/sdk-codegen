import { SearchCriterionTerm } from '@looker/sdk-codegen'
import { searchReducer, defaultSearchState } from './reducer'

describe('Search reducer', () => {
  test('it sets default state', () => {
    const state = searchReducer(undefined, { type: 'INIT', payload: {} })
    expect(state).toEqual(defaultSearchState)
  })

  test('it sets pattern with provided value', () => {
    const action = {
      type: 'SET_PATTERN',
      payload: {
        pattern: 'query',
      },
    }
    const state = searchReducer(defaultSearchState, action)
    expect(state).toEqual({
      ...defaultSearchState,
      pattern: action.payload.pattern,
    })
  })

  test('it sets criteria with provided values', () => {
    const action = {
      type: 'SET_CRITERIA',
      payload: {
        criteria: ['activityType'] as SearchCriterionTerm[],
      },
    }
    const state = searchReducer(defaultSearchState, action)
    expect(state).toEqual({
      ...defaultSearchState,
      criteria: action.payload.criteria,
    })
  })
})
