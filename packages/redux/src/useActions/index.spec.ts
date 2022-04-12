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
import { createSlice } from '@reduxjs/toolkit'
import { renderHook } from '@testing-library/react-hooks'
import { useDispatch } from 'react-redux'
import { bindActionCreators } from 'redux'
import { useActions } from '.'

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}))

jest.mock('redux', () => ({
  bindActionCreators: jest.fn(),
}))

const boundActionCreators = {}
const dispatch = () => {}
const sliceOptions = {
  initialState: {},
  name: 'test',
  reducers: {
    test() {},
  },
}

beforeEach(() => {
  // @ts-ignore
  useDispatch.mockReset().mockReturnValue(dispatch)

  // @ts-ignore
  bindActionCreators.mockReset().mockReturnValue(boundActionCreators)
})

test('calls dispatch', () => {
  const slice = createSlice(sliceOptions)
  renderHook(() => useActions(slice))
  expect(useDispatch).toHaveBeenCalledTimes(1)
  expect(useDispatch).toHaveBeenCalledWith()
})

test('calls bindActionCreators only once for each slice', () => {
  const slice1 = createSlice(sliceOptions)
  const slice2 = createSlice(sliceOptions)

  // First call should be called.
  renderHook(() => useActions(slice1))
  expect(bindActionCreators).toHaveBeenCalledTimes(1)

  // Second call should not be called.
  renderHook(() => useActions(slice1))
  expect(bindActionCreators).toHaveBeenCalledTimes(1)

  // @ts-ignore we don't care about the type of dispatch in our testing.
  expect(bindActionCreators).toHaveBeenCalledWith(slice1.actions, dispatch)

  // Third call, but with a different slice should be called.
  renderHook(() => useActions(slice2))
  expect(bindActionCreators).toHaveBeenCalledTimes(2)

  // @ts-ignore we don't care about the type of dispatch in our testing.
  expect(bindActionCreators).toHaveBeenCalledWith(slice2.actions, dispatch)
})

test('returns result of bindActionCreators', () => {
  const slice = createSlice(sliceOptions)
  const actions = renderHook(() => useActions(slice))
  expect(actions.result.current).toBe(boundActionCreators)
})
