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
import { all, call, put, takeEvery } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
import { actionMessage, beginLoading, endLoading } from '../common/actions';
import { sheetsClient } from '../sheets_client';
import {
  Actions,
  initHackSessionResponse,
  initHackSessionFailure,
} from './actions';

function* initializeHackSessionSaga(): SagaIterator {
  let hacker;
  try {
    yield put(beginLoading());
    hacker = yield call([sheetsClient, sheetsClient.getHacker]);
    const hackathon = yield call([
      sheetsClient,
      sheetsClient.getCurrentHackathon,
    ]);
    if (hackathon) {
      if (!hacker.registration) {
        const registration = yield call(
          [sheetsClient, sheetsClient.registerUser],
          hacker
        );
        hacker.registration = registration;
      }
      const technologies = yield call([
        sheetsClient,
        sheetsClient.getTechnologies,
      ]);
      const projectsHeadings = yield call([
        sheetsClient,
        sheetsClient.getProjectsHeadings,
      ]);
      const hackersHeadings = yield call([
        sheetsClient,
        sheetsClient.getHackersHeadings,
      ]);
      const judgingsHeadings = yield call([
        sheetsClient,
        sheetsClient.getJudgingsHeadings,
      ]);
      yield put(
        initHackSessionResponse(
          hackathon,
          technologies,
          hacker,
          projectsHeadings,
          hackersHeadings,
          judgingsHeadings
        )
      );
      yield put(endLoading());
    } else {
      yield put(initHackSessionFailure(hacker));
      yield put(actionMessage('No active hackathon found', 'warn'));
    }
  } catch (err) {
    console.error(err);
    if (hacker) {
      yield put(initHackSessionFailure(hacker));
      yield put(
        actionMessage(
          'A problem occurred loading the data. Has the extension been configured?',
          'critical'
        )
      );
    } else {
      yield put(
        actionMessage('A problem occurred loading the data', 'critical')
      );
    }
  }
}

export function* registerHackSessionSagas() {
  yield all([
    takeEvery(Actions.INIT_HACK_SESSION_REQUEST, initializeHackSessionSaga),
  ]);
}
