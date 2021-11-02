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
import { takeEvery, call, put, select } from 'typed-redux-saga'

import { getEnvAdaptor } from '@looker/extension-utils'
import { StoreConstants } from '@looker/run-it'
import type { RootState } from '../store'
import { settingActions, defaultSettings } from './slice'

/**
 * Serializes state to local storage
 */
function* serializeToLocalStorageSaga() {
  const adaptor = getEnvAdaptor()
  const settings = yield* select((state: RootState) => ({
    sdkLanguage: state.settings.sdkLanguage,
  }))
  adaptor.localStorageSetItem(
    StoreConstants.LOCALSTORAGE_SETTINGS_KEY,
    JSON.stringify(settings)
  )
}

/**
 * Returns default settings overridden with any persisted state in local storage
 */
async function deserializeLocalStorage() {
  const adaptor = getEnvAdaptor()
  const settings = await adaptor.localStorageGetItem(
    StoreConstants.LOCALSTORAGE_SETTINGS_KEY
  )
  return settings
    ? { ...defaultSettings, ...JSON.parse(settings) }
    : defaultSettings
}

/**
 * Initializes the store with default settings and existing persisted settings
 */
function* initSaga() {
  const { initSettingsSuccessAction, initSettingsFailureAction } =
    settingActions
  try {
    const settings = yield* call(deserializeLocalStorage)
    yield* put(initSettingsSuccessAction(settings))
  } catch (error: any) {
    yield* put(initSettingsFailureAction(error))
  }
}

export function* saga() {
  const { initSettingsAction, setSdkLanguageAction } = settingActions

  yield* takeEvery(initSettingsAction, initSaga)
  yield* takeEvery(setSdkLanguageAction, serializeToLocalStorageSaga)
}
