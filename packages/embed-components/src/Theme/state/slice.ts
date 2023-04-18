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
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSliceHooks } from '@looker/redux'
import type { ITheme } from '@looker/sdk'
import { saga } from './sagas'

export interface ThemesState {
  defaultTheme: ITheme
  themes: ITheme[]
  selectedTheme: ITheme
  initialized: boolean
  error?: string
  working: boolean
}

export const defaultThemesState: ThemesState = {
  initialized: false,
  defaultTheme: {} as ITheme,
  selectedTheme: {} as ITheme,
  themes: [],
  working: false,
}

type GetThemesSuccessAction = Pick<ThemesState, 'themes'>

type GetDefaultThemeSuccessAction = Pick<ThemesState, 'defaultTheme'>

export type SelectThemeAction = Record<'id', string>

type SelectThemeSuccessAction = Pick<ThemesState, 'selectedTheme'>

type SetFailureAction = Record<'error', string>

type LoadThemeDataSuccessAction = Pick<
  ThemesState,
  'defaultTheme' | 'themes' | 'selectedTheme'
>

export const THEMES_SLICE_NAME = 'themes'

export const themesSlice = createSlice({
  name: THEMES_SLICE_NAME,
  initialState: defaultThemesState,
  reducers: {
    initAction() {
      // noop
    },
    initSuccessAction(state) {
      state.initialized = true
    },
    loadThemeDataAction(state) {
      state.working = true
    },
    loadThemeDataSuccessAction(
      state,
      action: PayloadAction<LoadThemeDataSuccessAction>
    ) {
      state = { ...state, ...action.payload, working: false }
    },
    getThemesAction(state) {
      state.working = true
    },
    getThemesSuccessAction(
      state,
      action: PayloadAction<GetThemesSuccessAction>
    ) {
      state = { ...state, ...action.payload, working: false }
    },
    getDefaultThemeAction(state) {
      state.working = true
    },
    getDefaultThemeSuccessAction(
      state,
      action: PayloadAction<GetDefaultThemeSuccessAction>
    ) {
      state = { ...state, ...action.payload, working: false }
    },
    selectThemeAction(state, _action: PayloadAction<SelectThemeAction>) {
      state.working = true
    },
    selectThemeSuccessAction(
      state,
      action: PayloadAction<SelectThemeSuccessAction>
    ) {
      state = { ...state, ...action.payload, working: false }
    },
    setFailureAction(state, action: PayloadAction<SetFailureAction>) {
      state = { ...state, ...action.payload, working: false }
    },
  },
})
export const themeActions = themesSlice.actions
export const {
  useActions: useThemeActions,
  useStoreState: useThemesStoreState,
} = createSliceHooks(themesSlice, saga)
