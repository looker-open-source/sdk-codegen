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
import type { PayloadAction } from '@reduxjs/toolkit'
import { takeEvery, put, call, select } from 'typed-redux-saga'
import type { ConfigValues } from '../utils'
import { getVersions, validateUrl } from '../utils'
import type {
  ClearConfigActionPayload,
  SetUrlActionPayload,
  OAuthFormState,
  SaveConfigPayload,
} from './slice'
import { OAuthFormSlice, OAuthFormActions } from './slice'

/**
 * get saved configData from localStorage key
 */
const getLocalStorageConfig = (configKey: string): ConfigValues => {
  const EmptyConfig = {
    base_url: '',
    looker_url: '',
  }
  const data = localStorage.getItem(configKey)
  const result = data ? JSON.parse(data) : EmptyConfig

  return result
}

/**
 * checks for saved configData in localStorage
 */
function* initSaga(action: PayloadAction<string>) {
  const { initSuccessAction, setFailureAction } = OAuthFormActions
  try {
    const result = yield* call(getLocalStorageConfig, action.payload)
    yield* put(initSuccessAction(result))
  } catch (error: any) {
    yield* put(setFailureAction(error.message))
  }
}

/**
 * updates the new url and adds or removes form validation message
 */
function* setUrlSaga(action: PayloadAction<SetUrlActionPayload>) {
  const { updateValidationMessages, setUrlActionSuccess } = OAuthFormActions
  try {
    const url = validateUrl(action.payload.value)
    if (!url) throw new Error(`${action.payload.value} is not a valid url`)

    // clear the error message if one was there
    yield* put(
      updateValidationMessages({
        elementName: action.payload.name,
        newMessage: null,
      })
    )
  } catch (error: any) {
    yield* put(
      updateValidationMessages({
        elementName: action.payload.name,
        newMessage: {
          message: error.message,
          type: 'error',
        },
      })
    )
  } finally {
    // update the form element
    const url = validateUrl(action.payload.value)
    yield* put(setUrlActionSuccess(url || action.payload.value))
  }
}

/**
 * clears form, removes local storage config key and triggers callback function
 */
function* clearConfigSaga(action: PayloadAction<ClearConfigActionPayload>) {
  const { clearConfigActionSuccess, setFailureAction, updateMessageBarAction } =
    OAuthFormActions
  try {
    const { configKey, setHasConfig, isAuthenticated } = action.payload
    localStorage.removeItem(configKey)
    if (setHasConfig) setHasConfig(false)
    if (isAuthenticated) {
      yield* put(
        updateMessageBarAction({
          intent: 'warn',
          text: 'Please reload the browser page to log out',
        })
      )
    }
    yield* put(clearConfigActionSuccess())
  } catch (error: any) {
    yield* put(setFailureAction(error.message))
  }
}

/**
 * verify button clicked, verifys apiServerUrl and populates OAuth server URL if valid
 */
function* verifySaga() {
  const apiServerUrl = yield* select((storeState) => {
    const formState: OAuthFormState = storeState[OAuthFormSlice.name]
    return formState.apiServerUrl
  })
  const { verifyActionFailure, verifyActionSuccess, clearMessageBarAction } =
    OAuthFormActions

  try {
    yield* put(clearMessageBarAction())
    const versionsUrl = `${apiServerUrl}/versions`

    const versions = yield* call(getVersions, versionsUrl)
    if (!versions) throw new Error()

    yield* put(verifyActionSuccess(versions.web_server_url))
  } catch (error: any) {
    yield* put(verifyActionFailure(error.message))
  }
}

/**
 * save button clicked, verify api server url and if valid save config data to localstorage
 */
function* saveConfigSaga(action: PayloadAction<SaveConfigPayload>) {
  const apiServerUrl = yield* select((storeState) => {
    const formState: OAuthFormState = storeState[OAuthFormSlice.name]
    return formState.apiServerUrl
  })
  const {
    verifyActionFailure,
    clearMessageBarAction,
    saveConfigActionSuccess,
  } = OAuthFormActions
  const { configKey, setHasConfig, client_id, redirect_uri } = action.payload

  try {
    yield* put(clearMessageBarAction())
    const versionsUrl = `${apiServerUrl}/versions`

    const versions = yield* call(getVersions, versionsUrl)
    if (!versions) throw new Error()

    const data = {
      base_url: versions.api_server_url,
      looker_url: versions.web_server_url,
      client_id,
      redirect_uri,
    }
    localStorage.setItem(configKey, JSON.stringify(data))
    if (setHasConfig) setHasConfig(true)

    yield* put(
      saveConfigActionSuccess({
        base_url: versions.api_server_url,
        looker_url: versions.web_server_url,
      })
    )
  } catch (error: any) {
    yield* put(verifyActionFailure(error.message))
  }
}

export function* saga() {
  const {
    initAction,
    setUrlAction,
    clearConfigAction,
    verifyAction,
    saveConfigAction,
  } = OAuthFormActions
  yield* takeEvery(initAction, initSaga)
  yield* takeEvery(setUrlAction, setUrlSaga)
  yield* takeEvery(clearConfigAction, clearConfigSaga)
  yield* takeEvery(verifyAction, verifySaga)
  yield* takeEvery(saveConfigAction, saveConfigSaga)
}
