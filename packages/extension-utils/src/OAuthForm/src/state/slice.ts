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
import type { Dispatch } from 'react'
import { createSliceHooks } from '@looker/redux'
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type {
  MessageBarIntent,
  ValidationMessageProps,
  ValidationMessages,
} from '@looker/components'
import omit from 'lodash/omit'
import type { ConfigValues } from '../utils'
import { saga } from './sagas'

export const SLICE_NAME = 'OAuthForm'
export interface MessageBarData {
  intent: MessageBarIntent
  text: string
}

export interface OAuthFormState {
  apiServerUrl: string
  fetchedUrl: string
  webUrl: string
  messageBar: MessageBarData
  validationMessages: ValidationMessages
  savedConfig: ConfigValues
}

export const defaultOAuthFormState: OAuthFormState = {
  apiServerUrl: '',
  fetchedUrl: '',
  webUrl: '',
  messageBar: {
    text: '',
    intent: 'positive',
  },
  validationMessages: {},
  savedConfig: { base_url: '', looker_url: '' },
}

export interface ClearConfigActionPayload {
  configKey: string
  setHasConfig?: Dispatch<boolean>
  isAuthenticated: boolean
}

export interface SetUrlActionPayload {
  name: string
  value: string
}

interface UpdateValidationMessagesPayload {
  elementName: string
  newMessage: ValidationMessageProps | null
}

export interface SaveConfigPayload {
  configKey: string
  setHasConfig?: Dispatch<boolean>
  client_id: string
  redirect_uri: string
}

export interface SaveConfigSuccessPayload {
  base_url: string
  looker_url: string
}

export const OAuthFormSlice = createSlice({
  name: SLICE_NAME,
  initialState: defaultOAuthFormState,
  reducers: {
    initAction(_state, _action: PayloadAction<string>) {
      // noop
    },
    initSuccessAction(state, action: PayloadAction<ConfigValues>) {
      state.apiServerUrl = action.payload.base_url
      state.webUrl = action.payload.looker_url
    },
    setUrlAction(_state, _action: PayloadAction<SetUrlActionPayload>) {
      // noop
    },
    setUrlActionSuccess(state, action: PayloadAction<string>) {
      state.apiServerUrl = action.payload
      state.webUrl = ''
    },
    updateValidationMessages(
      state,
      action: PayloadAction<UpdateValidationMessagesPayload>
    ) {
      let newValidationMessages = state.validationMessages

      if (action.payload.newMessage !== null) {
        newValidationMessages[action.payload.elementName] =
          action.payload.newMessage
      } else {
        newValidationMessages = omit(
          newValidationMessages,
          action.payload.elementName
        )
      }
      state.validationMessages = newValidationMessages
    },
    clearConfigAction(
      _state,
      _action: PayloadAction<ClearConfigActionPayload>
    ) {
      // noop
    },
    clearConfigActionSuccess() {
      return { ...defaultOAuthFormState }
    },
    verifyConfigAction(state) {
      state.fetchedUrl = `${state.apiServerUrl}/versions`
    },
    verifyConfigActionSuccess(state, action: PayloadAction<string>) {
      state.messageBar = {
        intent: 'positive',
        text: `Configuration is valid`,
      }
      state.webUrl = action.payload
    },
    verifyConfigActionFailure(state, action: PayloadAction<string>) {
      state.messageBar = { intent: 'critical', text: action.payload }
      state.webUrl = ''
    },
    saveConfigAction(_state, _action: PayloadAction<SaveConfigPayload>) {
      // noop
    },
    saveConfigActionSuccess(
      state,
      action: PayloadAction<SaveConfigSuccessPayload>
    ) {
      const { base_url, looker_url } = action.payload
      state.savedConfig = {
        base_url,
        looker_url,
      }
      state.messageBar = {
        intent: 'positive',
        text: `Saved ${looker_url} as OAuth server`,
      }
    },
    clearMessageBarAction(state) {
      state.messageBar.text = ''
    },
    updateMessageBarAction(state, action: PayloadAction<MessageBarData>) {
      state.messageBar = action.payload
    },
    setFailureAction(state, action: PayloadAction<string>) {
      state.messageBar = { intent: 'critical', text: action.payload }
    },
  },
})

export const OAuthFormActions = OAuthFormSlice.actions
export const {
  useActions: useOAuthFormActions,
  useStoreState: useOAuthFormState,
} = createSliceHooks(OAuthFormSlice, saga)
