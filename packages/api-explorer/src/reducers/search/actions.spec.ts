import { SearchCriterionTerm } from '@looker/sdk-codegen'
import { setPattern, setCriteria } from './actions'

describe('Search reducer actions', () => {
  test('it sets up a set pattern action object with provided values', () => {
    const action = setPattern('query')
    expect(action).toEqual({
      type: 'SET_PATTERN',
      payload: {
        pattern: 'query',
      },
    })
  })

  test('it sets up a set criteria action object with provided values', () => {
    const criteria: SearchCriterionTerm[] = ['method', 'description']
    const action = setCriteria(criteria)
    expect(action).toEqual({
      type: 'SET_CRITERIA',
      payload: {
        criteria,
      },
    })
  })
})
