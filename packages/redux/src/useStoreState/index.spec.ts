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
import { renderHook } from '@testing-library/react-hooks'
import { createSlice } from '@reduxjs/toolkit'
import { useSelector } from 'react-redux'
import { useSaga } from '../useSaga'
import { useSlice } from '../useSlice'
import { useStoreState } from '.'

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}))

jest.mock('../useSaga', () => ({
  useSaga: jest.fn(),
}))

jest.mock('../useSlice', () => ({
  useSlice: jest.fn(),
}))

function* saga() {}

const slice = createSlice({
  initialState: {},
  name: 'test',
  reducers: {},
})

beforeEach(() => {
  // @ts-ignore
  useSaga.mockReset()

  // @ts-ignore
  useSelector.mockReset().mockImplementation((fn) => fn({ test: true }))

  // @ts-ignore
  useSlice.mockReset()
})

test('calls useSlice', () => {
  renderHook(() => useStoreState(slice))
  expect(useSlice).toHaveBeenCalledTimes(1)
  expect(useSlice).toHaveBeenCalledWith(slice)
})

test('calls useSaga', () => {
  renderHook(() => useStoreState(slice, saga))
  expect(useSaga).toHaveBeenCalledTimes(1)
  expect(useSaga).toHaveBeenCalledWith(saga)
})

test('calls useSelector', () => {
  renderHook(() => useStoreState(slice))
  expect(useSelector).toHaveReturnedTimes(1)
})

test('returns the store state', () => {
  const state = renderHook(() => useStoreState(slice))
  expect(state.result.current).toBe(true)
})
