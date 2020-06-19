import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'

import { SearchContext, defaultSearchContextValue } from '../context'
import { defaultSearchState, SearchState } from '../reducers'
import { withRouter } from './router'

const withSearchProvider = (
  consumer: ReactElement<any>,
  searchSettings: SearchState
) => (
  <SearchContext.Provider
    value={{
      searchSettings,
      setSearchSettings: defaultSearchContextValue.setSearchSettings,
    }}
  >
    {consumer}
  </SearchContext.Provider>
)

export const renderWithSearch = (
  component: ReactElement<any>,
  pattern = defaultSearchState.pattern,
  criteria = defaultSearchState.criteria,
  options?: Omit<RenderOptions, 'queries'>
) => render(withSearchProvider(component, { pattern, criteria }), options)

export const renderWithSearchAndRouter = (
  component: ReactElement<any>,
  pattern = defaultSearchState.pattern,
  criteria = defaultSearchState.criteria,
  initialRouterEntries?: string[],
  options?: Omit<RenderOptions, 'queries'>
) => {
  const RoutedComponent = withRouter(component, initialRouterEntries)
  return render(
    withSearchProvider(RoutedComponent, { pattern, criteria }),
    options
  )
}
