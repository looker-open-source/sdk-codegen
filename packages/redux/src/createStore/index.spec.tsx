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
import { configureStore } from '@reduxjs/toolkit'
import reduxSaga from 'redux-saga'
import { deepCombineReducers } from '../deepCombineReducers'
import { createStore } from '.'

jest.mock('@reduxjs/toolkit', () => ({
  configureStore: jest.fn(),
}))

jest.mock('../deepCombineReducers', () => ({
  deepCombineReducers: jest.fn(),
}))

jest.mock('redux-saga', () => jest.fn())

const mockConfigureStore = {
  replaceReducer: jest.fn(),
  dispatch: jest.fn(),
}

const mockReduxSaga = {
  run: jest.fn(),
}

beforeEach(() => {
  // @ts-ignore
  deepCombineReducers.mockReset().mockReturnValue('deepCombineReducers')

  // @ts-ignore
  configureStore.mockReset().mockReturnValue(mockConfigureStore)

  // @ts-ignore
  reduxSaga.mockReset().mockReturnValue(mockReduxSaga)
})

test('extended APIs exist', () => {
  const store = createStore()
  expect(typeof store.addReducer).toBe('function')
  expect(typeof store.addSaga).toBe('function')
})

test('configureStore', () => {
  const preloadedState = {}
  createStore({ preloadedState })
  expect(configureStore).toHaveBeenCalledTimes(1)
  expect(configureStore).toHaveBeenCalledWith(
    // @ts-ignore not on type yet
    expect.objectContaining({
      devTools: true,
      preloadedState,
    })
  )
})

test('addReducer', () => {
  const reducers = {
    test1: () => {},
    test2: () => {},
  }
  const store = createStore({ reducer: { test1: reducers.test1 } })
  store.addReducer('test2' as any, reducers.test2)
  expect(deepCombineReducers).toHaveBeenCalledTimes(1)
  expect(deepCombineReducers).toHaveBeenCalledWith(reducers)
  expect(mockConfigureStore.replaceReducer).toHaveBeenCalledTimes(1)
  expect(mockConfigureStore.replaceReducer).toHaveBeenCalledWith(
    'deepCombineReducers'
  )
})

test('addSaga', () => {
  const store = createStore()
  function* saga() {}
  store.addSaga(saga)
  expect(mockReduxSaga.run).toHaveBeenCalledTimes(1)
  expect(mockReduxSaga.run).toHaveBeenCalledWith(saga)
})
