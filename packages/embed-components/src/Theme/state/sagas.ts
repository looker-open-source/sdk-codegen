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
import { takeEvery, put, call } from 'typed-redux-saga'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { ITheme } from '@looker/sdk'
import {
  registerThemeService,
  getThemeService,
  EmbedUrl,
} from '@looker/embed-services'
import { themeActions } from './slice'
import type { SelectThemeAction } from './slice'

/**
 * Registers theme service with factory
 */
function* initSaga() {
  const { initSuccessAction, setFailureAction } = themeActions
  try {
    registerThemeService()
    yield* put(initSuccessAction())
  } catch (error: any) {
    yield* put(setFailureAction({ error: error.message }))
  }
}

/**
 * Gets all themes, default and url themes, and sets the selected theme
 */
function* loadThemeDataSaga() {
  const { loadThemeDataSuccessAction, setFailureAction } = themeActions
  try {
    const service = getThemeService()
    yield* call([service, 'load'])
    const searchParams = new EmbedUrl().searchParams
    const urlThemeName = searchParams.theme
    let urlTheme: ITheme | undefined
    if (urlThemeName) {
      urlTheme = service.find('name', urlThemeName)
    }
    yield* put(
      loadThemeDataSuccessAction({
        themes: service.items,
        defaultTheme: service.defaultTheme!,
        selectedTheme: (urlTheme ?? service.defaultTheme!)!,
      })
    )
  } catch (error: any) {
    yield* put(setFailureAction({ error: error.message }))
  }
}

/**
 * Sets the selected theme by id or name
 * @param action containing id or name of theme to select
 */
function* selectThemeSaga(action: PayloadAction<SelectThemeAction>) {
  const { selectThemeSuccessAction, setFailureAction } = themeActions
  try {
    const service = getThemeService()
    yield* call([service, 'getAll'])
    const key = action.payload.key
    let item: ITheme | undefined = service.indexedItems[key]
    if (!item) {
      item = service.find(['id', 'name'], `^${key}$`)
    }
    yield* put(
      selectThemeSuccessAction({ selectedTheme: item ?? service.defaultTheme! })
    )
  } catch (error: any) {
    yield* put(
      setFailureAction({
        error: error.message,
      })
    )
  }
}

export function* saga() {
  const { initAction, loadThemeDataAction, selectThemeAction } = themeActions
  yield* takeEvery(initAction, initSaga)
  yield* takeEvery(loadThemeDataAction, loadThemeDataSaga)
  yield* takeEvery(selectThemeAction, selectThemeSaga)
}
