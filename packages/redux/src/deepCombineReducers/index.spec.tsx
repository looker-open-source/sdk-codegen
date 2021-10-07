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
import type { DeepReducersMapObject } from '.'
import { deepCombineReducers } from '.'

test('should handle plain function reducers', () => {
  const reducer = (state: any) => state
  expect(deepCombineReducers(reducer)).toBe(reducer)
})

test('should handle reducer object maps', () => {
  interface IState {
    a?: string
    b?: string
  }
  const reducer = {
    a: () => 'a',
    b: () => 'b',
  }
  const combined = deepCombineReducers<IState>(reducer)
  expect(combined({}, { type: 'init' })).toEqual({ a: 'a', b: 'b' })
})

test('should handle recursive reducer object maps', () => {
  interface IState {
    a?: string
    b?: string
    c?: {
      nested?: string
    }
  }
  const reducer = {
    a: () => 'a',
    b: () => 'b',
    c: {
      nested: () => 'nested',
    },
  }
  const combined = deepCombineReducers<IState>(reducer)
  expect(combined({}, { type: 'init' })).toEqual({
    a: 'a',
    b: 'b',
    c: { nested: 'nested' },
  })
})

test('should handle reducers that are both functions and nested objects', () => {
  interface IState {
    a?: string
    b?: string
    c?: {
      nested?: string
      notNested?: string
    }
  }
  const reducerAndNested = ((state: Record<string, unknown>) => {
    return { ...state, notNested: 'notNested' }
  }) as DeepReducersMapObject<IState['c']>
  reducerAndNested!.nested = () => 'nested'
  const reducer = {
    a: () => 'a',
    b: () => 'b',
    c: reducerAndNested,
  }
  const initialState = {
    a: 'initiala',
    b: 'initialb',
    c: {},
  }
  const combined = deepCombineReducers<IState>(reducer)
  expect(combined(initialState, { type: 'init' })).toEqual({
    a: 'a',
    b: 'b',
    c: { notNested: 'notNested', nested: 'nested' },
  })
})
