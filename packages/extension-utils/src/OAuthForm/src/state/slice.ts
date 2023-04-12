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
import { createSliceHooks } from '@looker/redux'
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { MessageBarIntent, ValidationMessages } from '@looker/components'
import type { ConfigValues } from '../utils'

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
  } as MessageBarData,
  validationMessages: {} as ValidationMessages,
  savedConfig: { base_url: '', looker_url: '' },
}

interface HandleUrlChangePayload {
  apiServerUrl: string
  webUrl: string
  validationMessages: ValidationMessages
}

interface ConfigPayload {
  base_url: string
  looker_url: string
  client_id: string
  redirect_uri: string
}

export const OAuthFormSlice = createSlice({
  name: SLICE_NAME,
  initialState: defaultOAuthFormState,
  reducers: {
    clearFormAction(_state) {
      return { ...defaultOAuthFormState }
    },
    saveNewConfigAction(state, action: PayloadAction<ConfigPayload>) {
      state.savedConfig = {
        base_url: action.payload.base_url,
        looker_url: action.payload.looker_url,
      }
      state.messageBar = {
        intent: 'positive',
        text: `Saved ${action.payload.looker_url} as OAuth server`,
      }
    },
    setApiServerUrlAction(state, action: PayloadAction<string>) {
      state.apiServerUrl = action.payload
    },
    setFetchedUrlAction(state, action: PayloadAction<string>) {
      state.fetchedUrl = action.payload
    },
    setWebUrlAction(state, action: PayloadAction<string>) {
      state.webUrl = action.payload
    },
    updateApiServerUrlAction(
      state,
      action: PayloadAction<HandleUrlChangePayload>
    ) {
      state.apiServerUrl = action.payload.apiServerUrl
      state.webUrl = action.payload.webUrl
      state.validationMessages = action.payload.validationMessages
    },
    updateMessageBarAction(state, action: PayloadAction<MessageBarData>) {
      state.messageBar = action.payload
    },
    verifyErrorAction(state, action: PayloadAction<string>) {
      state.messageBar = { intent: 'critical', text: action.payload }
      state.webUrl = ''
    },
  },
})

export const oAuthFormActions = OAuthFormSlice.actions
export const {
  useActions: useOAuthFormActions,
  useStoreState: useOAuthFormState,
} = createSliceHooks(OAuthFormSlice)
