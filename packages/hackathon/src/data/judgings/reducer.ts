/*

 MIT License

 Copyright (c) 2020 Looker Data Sciences, Inc.

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
import { Judging } from '../../models'
import { Actions, JudgingAction } from './actions'

export interface JudgingsState {
  judgings: Judging[]
}

const EmptyJudgings: Judging[] = []

const defaultState: Readonly<JudgingsState> = Object.freeze({
  judgings: EmptyJudgings,
})

export const judgingsReducer = (
  state: JudgingsState = defaultState,
  action: JudgingAction
): JudgingsState => {
  switch (action.type) {
    case Actions.ALL_JUDGINGS_REQUEST:
      return {
        ...state,
      }
    case Actions.ALL_JUDGINGS_SUCCESS:
      return {
        ...state,
        judgings: action.payload,
      }
    default:
      return state
  }
}
