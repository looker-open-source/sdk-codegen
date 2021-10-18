/*

 MIT License

 Copyright (c) 2021 Looker Data Sciences, Inc.

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
import type { ReactElement } from 'react'
import React from 'react'
import { Provider } from 'react-redux'
import type { Store } from 'redux'
import { renderWithTheme } from '@looker/components-test-utils'
import type { RenderOptions } from '@testing-library/react'
import { createStore } from '@looker/redux'

import type { RootState } from '../state'
import { defaultSettingsState, store as defaultStore } from '../state'
import { slice as settingsSlice } from '../state/settings'
import { registerEnvAdaptor, StandaloneEnvAdaptor } from '../utils'
import { renderWithRouter } from '.'

export const withReduxProvider = (
  consumers: ReactElement<any>,
  store: Store<RootState> = defaultStore
) => {
  registerEnvAdaptor(new StandaloneEnvAdaptor())
  return <Provider store={store}>{consumers}</Provider>
}

export const renderWithReduxProvider = (
  consumers: ReactElement<any>,
  store?: Store<RootState>,
  options?: Omit<RenderOptions, 'queries'>
) => renderWithTheme(withReduxProvider(consumers, store), options)

export const renderWithRouterAndReduxProvider = (
  consumers: ReactElement<any>,
  initialEntries: string[] = ['/'],
  store?: Store<RootState>,
  options?: Omit<RenderOptions, 'queries'>
) =>
  renderWithRouter(withReduxProvider(consumers, store), initialEntries, options)

const preloadedState: RootState = {
  settings: defaultSettingsState,
}

export const createMockStore = (overrides: Partial<RootState>) =>
  createStore({
    preloadedState: {
      settings: { ...preloadedState.settings, ...overrides?.settings },
    },
    reducer: { settings: settingsSlice.reducer },
  })
