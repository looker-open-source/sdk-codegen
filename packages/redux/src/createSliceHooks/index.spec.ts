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
import type { SliceCaseReducers } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { renderHook } from '@testing-library/react-hooks'
import { useActions } from '../useActions'
import { useStoreState } from '../useStoreState'
import { createSliceHooks } from '.'

jest.mock('../useActions', () => ({
  useActions: jest.fn(),
}))

jest.mock('../useStoreState', () => ({
  useStoreState: jest.fn(),
}))

interface State {
  test: boolean
}

function* saga() {}

const slice = createSlice<State, SliceCaseReducers<State>>({
  initialState: { test: true },
  name: 'test',
  reducers: {
    test() {},
  },
})

test('creates slice hooks', () => {
  const hooks = createSliceHooks(slice, saga)
  expect(typeof hooks.useActions).toBe('function')
  expect(typeof hooks.useStoreState).toBe('function')
})

test('hooks.useActions calls the useActions core hook ', () => {
  const hooks = createSliceHooks(slice, saga)
  renderHook(() => hooks.useActions())
  expect(useActions).toHaveBeenCalledTimes(1)
  expect(useActions).toHaveBeenCalledWith(slice)
})

test('hooks.useStateState calls the useStoreState core hook', () => {
  const hooks = createSliceHooks(slice, saga)
  renderHook(() => hooks.useStoreState())
  expect(useStoreState).toHaveBeenCalledTimes(1)
  expect(useStoreState).toHaveBeenCalledWith(slice, saga)
})
