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
import type {
  ConfigureStoreOptions,
  Middleware,
  ReducersMapObject,
} from '@reduxjs/toolkit'
import { configureStore } from '@reduxjs/toolkit'
// @ts-ignore - this causes compile issues because it doesn't have types.
import createSagaMiddleware from 'redux-saga'
import set from 'lodash/set'
import type { Store } from '../types'
import { deepCombineReducers } from '../deepCombineReducers'

export interface CreateStoreOptions<State>
  extends Partial<ConfigureStoreOptions<State>> {
  middleware?: Middleware[]
  reducer?: ReducersMapObject<State>
}

/**
 * Creates a store that is pre-configured for Looker usage and is enhanced to dynamically add reducers and sagas.
 *
 * @param devTools
 * @param middleware
 * @param preloadedState The initial state to preload into the store.
 * @param reducer The initial reducer that goes along with initial state.
 */
export const createStore = <State>({
  devTools = false,
  middleware = [],
  preloadedState,
  reducer = {
    // If no reducer is provided initially we
    // must start with at least one reducer
    _: (state: State) => state ?? null,
    // cast as unknown because _ doesn't exist on State
  } as unknown as ReducersMapObject<State>,
}: CreateStoreOptions<State> = {}): Store<State> => {
  const currentReducers = {
    ...reducer,
  }
  const reducerSet = new WeakSet()
  const sagasSet = new WeakSet()
  const sagaMiddleware = createSagaMiddleware()
  const store = configureStore({
    devTools: devTools || process.env.NODE_ENV !== 'production',
    middleware: [sagaMiddleware, ...middleware],
    reducer: currentReducers,
    preloadedState,
  }) as Store<State>

  // Dynamically adds a reducer to the store if it has not been added yet.
  store.addReducer = (path, reducer) => {
    if (!reducerSet.has(reducer)) {
      reducerSet.add(reducer)
      set(currentReducers, path, reducer)
      store.replaceReducer(deepCombineReducers(currentReducers))
    }
  }

  // Dynamically adds a saga to the store if it has not been added yet.
  store.addSaga = (saga) => {
    if (!sagasSet.has(saga)) {
      sagasSet.add(saga)
      sagaMiddleware.run(saga)
    }
  }

  return store
}
