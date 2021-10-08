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

import type { RootState } from '../state'
import { configureStore } from '../state'
import type { IApixEnvAdaptor } from '../utils'
import { StandaloneEnvAdaptor } from '../utils'
import { EnvAdaptorContext } from '../context'
import { renderWithRouter } from '.'

const defaultStore = configureStore()

export const withReduxProvider = (
  consumers: ReactElement<any>,
  store: Store<RootState> = defaultStore,
  envAdaptor: IApixEnvAdaptor = new StandaloneEnvAdaptor()
) => {
  return (
    <Provider store={store}>
      <EnvAdaptorContext.Provider value={{ envAdaptor }}>
        {consumers}
      </EnvAdaptorContext.Provider>
    </Provider>
  )
}

export const renderWithReduxProvider = (
  consumers: ReactElement<any>,
  store?: Store<RootState>,
  envAdaptor?: IApixEnvAdaptor,
  options?: Omit<RenderOptions, 'queries'>
) => renderWithTheme(withReduxProvider(consumers, store, envAdaptor), options)

export const renderWithRouterAndReduxProvider = (
  consumers: ReactElement<any>,
  initialEntries: string[] = ['/'],
  store?: Store<RootState>,
  envAdaptor?: IApixEnvAdaptor,
  options?: Omit<RenderOptions, 'queries'>
) =>
  renderWithRouter(
    withReduxProvider(consumers, store, envAdaptor),
    initialEntries,
    options
  )
