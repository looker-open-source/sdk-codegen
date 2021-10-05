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
import { createSlice } from '@reduxjs/toolkit'
import { renderHook } from '@testing-library/react-hooks'
import { useStore } from 'react-redux'
import { useSlice } from '.'

jest.mock('react-redux', () => ({
  useStore: jest.fn(),
}))

const mockUseStore = {
  addReducer: jest.fn(),
}

const slice = createSlice({
  initialState: {},
  name: 'test',
  reducers: {
    test() {},
  },
})

beforeEach(() => {
  mockUseStore.addReducer.mockReset()

  // @ts-ignore
  useStore.mockReset().mockReturnValue(mockUseStore)
})

test('calls useStore', () => {
  renderHook(() => useSlice(slice))
  expect(useStore).toHaveBeenCalledTimes(1)
  expect(useStore).toHaveBeenCalledWith()
})

test('calls addReducer', () => {
  renderHook(() => useSlice(slice))
  expect(mockUseStore.addReducer).toHaveBeenCalledTimes(1)
  expect(mockUseStore.addReducer).toHaveBeenCalledWith(
    slice.name,
    slice.reducer
  )
})
