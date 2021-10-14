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
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSliceHooks } from '@looker/redux'
import { saga } from './sagas'

export interface SettingState {
  initialized: boolean
  sdkLanguage: string
  error?: Error
}

export const defaultSettingsState: SettingState = {
  initialized: false,
  sdkLanguage: 'Python',
}

export interface SetSdkLanguageAction {
  sdkLanguage: string
}

export interface InitSuccessPayload extends SetSdkLanguageAction {}

export const slice = createSlice({
  name: 'settings',
  initialState: defaultSettingsState,
  reducers: {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    init() {},
    initSuccess(state, action: PayloadAction<InitSuccessPayload>) {
      state.initialized = true
      state.sdkLanguage = action.payload.sdkLanguage
    },
    initFailure(state, action: PayloadAction<Error>) {
      state.initialized = false
      state.error = action.payload
    },
    setSdkLanguage(state, action: PayloadAction<SetSdkLanguageAction>) {
      state.sdkLanguage = action.payload.sdkLanguage
    },
  },
})

export const actions = slice.actions
export const { useActions, useStoreState } = createSliceHooks(slice, saga)
