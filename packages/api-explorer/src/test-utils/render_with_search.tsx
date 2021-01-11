/*

 MIT License

 Copyright (c) 2020 Looker Data Sciences, Inc.

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.

 */

import React, { ReactElement } from 'react'
import { RenderOptions } from '@testing-library/react'

import { renderWithTheme } from '@looker/components-test-utils'
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
) =>
  renderWithTheme(withSearchProvider(component, { pattern, criteria }), options)

export const renderWithSearchAndRouter = (
  component: ReactElement<any>,
  pattern = defaultSearchState.pattern,
  criteria = defaultSearchState.criteria,
  initialRouterEntries?: string[],
  options?: Omit<RenderOptions, 'queries'>
) => {
  const RoutedComponent = withRouter(component, initialRouterEntries)
  return renderWithTheme(
    withSearchProvider(RoutedComponent, { pattern, criteria }),
    options
  )
}
