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
import { all, call, put, takeEvery } from 'redux-saga/effects'
import { actionMessage, beginLoading, endLoading } from '../common/actions'
import { sheetsClient } from '../sheets_client'
import {
  Actions,
  allJudgingsSuccess,
  SaveJudgingAction,
  allJudgingsRequest,
} from './actions'

function* allJudgingsSaga() {
  try {
    yield put(beginLoading())
    const judgings = yield call([sheetsClient, sheetsClient.getJudgings])
    yield put(allJudgingsSuccess(judgings))
    yield put(endLoading())
  } catch (err) {
    console.error(err)
    yield put(actionMessage('A problem occurred loading the data', 'critical'))
  }
}

function* saveJudgingSaga(action: SaveJudgingAction) {
  try {
    yield put(beginLoading())
    yield call([sheetsClient, sheetsClient.saveJudging], action.payload)
    yield put(allJudgingsRequest())
  } catch (err) {
    console.error(err)
    yield put(actionMessage('A problem occurred loading the data', 'critical'))
  }
}

export function* registerJudgingsSagas() {
  yield all([takeEvery(Actions.ALL_JUDGINGS_REQUEST, allJudgingsSaga)])
  yield all([takeEvery(Actions.SAVE_JUDGING, saveJudgingSaga)])
}
