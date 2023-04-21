/*

 MIT License

 Copyright (c) 2023 Looker Data Sciences, Inc.

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
import { createSliceHooks } from '@looker/redux'
import type { IAPIMethods } from '@looker/sdk-rtl'
import type { PayloadAction } from '@reduxjs/toolkit'
import { saga } from './sagas'

export interface FactoryState {
  initialized: boolean
  error?: string
}

export const defaultFactoryState: FactoryState = {
  initialized: false,
}

export interface InitFactoryAction {
  sdk: IAPIMethods
}

type SetFailureAction = Record<'error', string>

export const FACTORY_SLICE_NAME = 'factory'

export const factorySlice = createSlice({
  name: FACTORY_SLICE_NAME,
  initialState: defaultFactoryState,
  reducers: {
    initFactoryAction(_state, _action: PayloadAction<InitFactoryAction>) {
      // noop
    },
    initFactorySuccessAction(state) {
      state.initialized = true
    },
    destroyFactoryAction() {
      // noop
    },
    setFailureAction(state, action: PayloadAction<SetFailureAction>) {
      state.error = action.payload.error
    },
  },
})

export const factoryActions = factorySlice.actions
export const {
  useActions: useFactoryActions,
  useStoreState: useFactoryStoreState,
} = createSliceHooks(factorySlice, saga)
