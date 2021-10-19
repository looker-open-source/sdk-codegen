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

export interface UserDefinedSettings {
  sdkLanguage: string
}

export interface SettingState extends UserDefinedSettings {
  initialized: boolean
  error?: Error
}

export const defaultSettings = {
  sdkLanguage: 'Python',
}

export const defaultSettingsState: SettingState = {
  ...defaultSettings,
  initialized: false,
}

export interface SetSdkLanguageAction {
  sdkLanguage: string
}

export type InitSuccessPayload = UserDefinedSettings

export const slice = createSlice({
  name: 'settings',
  initialState: defaultSettingsState,
  reducers: {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    initAction() {},
    initSuccessAction(state, action: PayloadAction<InitSuccessPayload>) {
      state.sdkLanguage = action.payload.sdkLanguage
      state.initialized = true
    },
    initFailureAction(state, action: PayloadAction<Error>) {
      state.error = action.payload
      state.initialized = false
    },
    setSdkLanguageAction(state, action: PayloadAction<SetSdkLanguageAction>) {
      state.sdkLanguage = action.payload.sdkLanguage
    },
  },
})

export const actions = slice.actions
export const { useActions, useStoreState: useSettingsStoreState } =
  createSliceHooks(slice, saga)