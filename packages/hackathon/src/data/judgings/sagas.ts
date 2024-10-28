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
import { all, call, put, select, takeEvery } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
import { actionMessage, beginLoading, endLoading } from '../common/actions';
import type { IJudgingProps } from '../../models';
import { sheetsClient } from '../sheets_client';
import type {
  GetJudgingRequestAction,
  SaveJudgingRequestAction,
} from './actions';
import {
  Actions,
  getJudgingResponse,
  getJudgingsResponse,
  saveJudgingResponse,
} from './actions';
import { getJudgingsState } from './selectors';

function* getJudgingsSaga(): SagaIterator<IJudgingProps[]> {
  let judgings: IJudgingProps[] = [];
  try {
    yield put(beginLoading());
    judgings = yield call([sheetsClient, sheetsClient.getJudgings]);
    yield put(getJudgingsResponse(judgings));
    yield put(endLoading());
  } catch (err) {
    console.error(err);
    yield put(actionMessage('A problem occurred loading the data', 'critical'));
  }
  return judgings;
}

function* getJudgingSaga({
  payload: judgingId,
}: GetJudgingRequestAction): SagaIterator {
  try {
    // Pull judging out of state.
    const state = yield select();
    let judgings = getJudgingsState(state);
    if (judgings.length === 0) {
      // judgings are lost on page reload so load them
      judgings = yield getJudgingsSaga() as any;
    }
    const judging = judgings.find(j => j._id === judgingId);
    yield put(getJudgingResponse(judging));
  } catch (err) {
    console.error(err);
    yield put(actionMessage('A problem occurred loading the data', 'critical'));
  }
}

function* saveJudgingSaga(action: SaveJudgingRequestAction): SagaIterator {
  try {
    yield put(beginLoading());
    const judging = yield call(
      [sheetsClient, sheetsClient.saveJudging],
      action.payload
    );
    yield put(saveJudgingResponse(judging, true));
    yield put(actionMessage('Judging has been saved', 'positive'));
  } catch (err) {
    console.error(err);
    yield put(saveJudgingResponse(action.payload, false));
    yield put(actionMessage('A problem occurred loading the data', 'critical'));
  }
}

export function* registerJudgingsSagas() {
  yield all([takeEvery(Actions.GET_JUDGINGS_REQUEST, getJudgingsSaga)]);
  yield all([takeEvery(Actions.GET_JUDGING_REQUEST, getJudgingSaga)]);
  yield all([takeEvery(Actions.SAVE_JUDGING_REQUEST, saveJudgingSaga)]);
}
