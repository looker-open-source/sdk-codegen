/*

 MIT License

 Copyright (c) 2022 Looker Data Sciences, Inc.

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
import { ComponentsProvider } from '@looker/components'
import type { Store } from '@looker/redux'
import React from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Provider } from 'react-redux'
import { Router } from 'react-router'
import { HelmetProvider } from 'react-helmet-async'
import type { MemoryHistoryBuildOptions, History } from 'history'
import { createMemoryHistory } from 'history'
import type { RootState } from '../state'
import { createTestStore } from '../test-utils'

export interface MockedProviderProps {
  history?: History
  store?: Store<RootState>
}

/**
 * Mocks all providers needed to render any component or scene
 */
export const MockedProvider: React.FC<MockedProviderProps> = ({
  children,
  history = mockHistory(),
  store = createTestStore(),
}) => {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <Router history={history}>
        <HelmetProvider>
          <Provider store={store}>
            <ComponentsProvider disableStyleDefender>
              {children}
            </ComponentsProvider>
          </Provider>
        </HelmetProvider>
      </Router>
    </QueryClientProvider>
  )
}

export const mockHistory = (
  /**
   * Set the current route by passing in a string or to mock the entire
   * history stack pass in MemoryHistoryBuildOptions
   */
  route?: string | MemoryHistoryBuildOptions
) =>
  createMemoryHistory(
    typeof route === 'string' ? { initialEntries: [route] } : route
  )
