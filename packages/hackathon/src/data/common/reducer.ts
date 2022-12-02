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

import type { CommonAction } from './actions'
import { Actions } from './actions'

export interface MessageDetail {
  messageText: string
  intent: 'critical' | 'inform' | 'positive' | 'warn'
}

export interface CommonState {
  message?: MessageDetail
  loading: boolean
}

const defaultState: Readonly<CommonState> = Object.freeze({ loading: false })

export const commonReducer = (
  state: CommonState = defaultState,
  action: CommonAction
): CommonState => {
  switch (action.type) {
    case Actions.ERROR:
      return {
        ...state,
        message: { messageText: action.payload.message, intent: 'critical' },
        // TODO: Remove. Error does not necessarily means loading is finished.
        loading: false,
      }
    case Actions.MESSAGE:
      return {
        ...state,
        message: action.payload,
        // TODO: Remove. Message does not necessarily means loading is finished.
        loading: false,
      }
    case Actions.MESSAGE_CLEAR:
      return {
        ...state,
        message: undefined,
      }
    case Actions.BEGIN_LOADING:
      return {
        ...state,
        message: undefined,
        loading: true,
      }
    case Actions.END_LOADING:
      return {
        ...state,
        loading: false,
      }
    default:
      return state
  }
}
