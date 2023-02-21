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
import { fireEvent, render } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import { call, put, takeEvery } from 'typed-redux-saga/macro'
import { createStore } from '../createStore'
import { createSliceHooks } from '.'

test('reducers and sagas', async () => {
  interface State {
    text: string
  }

  const slice = createSlice({
    name: 'test',
    initialState: {
      text: 'click',
    } as State,
    reducers: {
      getText(state) {
        state.text = 'loading'
      },
      setText(state) {
        state.text = 'done'
      },
    },
  })

  function* sagas() {
    yield* takeEvery(slice.actions.getText, function* () {
      yield* call(() => Promise.resolve())
      yield* put(slice.actions.setText())
    })
  }

  const hooks = createSliceHooks(slice, sagas)
  const store = createStore()

  const Component = () => {
    const actions = hooks.useActions()
    const state = hooks.useStoreState()
    return <button onClick={() => actions.getText}>{state.text}</button>
  }

  const r = render(
    <Provider store={store}>
      <Component />
    </Provider>
  )

  fireEvent.click(await r.findByText('click'))
  expect(r.getByText('loading')).toBeInTheDocument()
  expect(await r.findByText('done')).toBeInTheDocument()
})
