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
import type { Slice } from '@reduxjs/toolkit'
import { bindActionCreators } from 'redux'
import { useDispatch } from 'react-redux'

const dispatchMap = new WeakMap()

/**
 * Binds a slice's action creators to dispatch().
 *
 * @param slice The slice who's actions we will pass to bindActionCreators.
 */
export const useActions = (slice: Slice) => {
  const dispatch = useDispatch()

  // We must keep record of which bound action creators belong to which
  // dispatch instance so that if a new store instance is created (i.e. tests)
  // they get rebound and stored.
  if (!dispatchMap.has(dispatch)) {
    dispatchMap.set(dispatch, new WeakMap())
  }

  const boundActionCreatorsMap = dispatchMap.get(dispatch)

  if (!boundActionCreatorsMap.has(slice)) {
    boundActionCreatorsMap.set(
      slice,
      bindActionCreators(slice.actions, dispatch)
    )
  }

  return boundActionCreatorsMap.get(slice)
}
