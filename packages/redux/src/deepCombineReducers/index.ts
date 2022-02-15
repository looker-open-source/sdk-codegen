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
import type { Reducer, ReducersMapObject, AnyAction, Action } from 'redux'

export type DeepReducersMapObject<S = any, A extends Action = AnyAction> = {
  [K in keyof S]: Reducer<S[K], A> | DeepReducersMapObject<S[K]>
}

// We use many action types throughout helltool that are not
// all the same type.   Ideally this would default to AnyAction
// rather than Any.   Before trying to engineer these action types
// to be more type safe, consider looking at existing solutions such as
// the typescript-fsa library.
type HelltoolActionType = any

/**
 * Same function as combineReducers from react-redux with the additional functionality
 * of being able to combine nested reducers.
 * @example
 * const reducer = deepCombineReducers({
 *   foo: fooReducer
 *   bar: {
 *     nestedBar: nestedBarReducer
 *   }
 * })
 */
export const deepCombineReducers = <S>(
  reducers:
    | DeepReducersMapObject<S, HelltoolActionType>
    | Reducer<S, HelltoolActionType>
): Reducer<S, HelltoolActionType> => {
  // the majority of this implementation is copy pasted from redux
  // https://github.com/reduxjs/redux/blob/master/src/combineReducers.ts
  const reducerKeys = Object.keys(reducers)

  if (!reducerKeys.length) {
    return reducers as Reducer
  }

  return function combination(state: S = {} as S, action: HelltoolActionType) {
    const nextState: S = { ...state }
    // Most of this function is copy pasted from redux.  They might be doing a loop like this
    // for performance reasons.
    for (let i = 0; i < reducerKeys.length; i++) {
      const key = reducerKeys[i] as keyof S
      const reducer = deepCombineReducers((reducers as ReducersMapObject)[key])
      const previousStateForKey = nextState[key]
      const nextStateForKey = reducer(previousStateForKey, action)
      nextState[key] = nextStateForKey
    }
    return typeof reducers === 'function'
      ? reducers(nextState, action)
      : nextState
  }
}
