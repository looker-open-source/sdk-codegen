import { SearchCriterionTerm } from '@looker/sdk-codegen'
import { SearchAction } from './reducer'

export const setPattern = (pattern: string): SearchAction => ({
  type: 'SET_PATTERN',
  payload: {
    pattern,
  },
})

export const setCriteria = (criteria: SearchCriterionTerm[]): SearchAction => ({
  type: 'SET_CRITERIA',
  payload: {
    criteria,
  },
})
