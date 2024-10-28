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
import { call, put, takeEvery } from 'typed-redux-saga';
import type { PayloadAction } from '@reduxjs/toolkit';

import { getLoded } from '../../utils';
import type { InitPayload } from './slice';
import { lodeActions } from './slice';

function* initSaga(action: PayloadAction<InitPayload>) {
  const { initLodesSuccessAction, initLodesFailureAction } = lodeActions;
  try {
    const lode = yield* call(
      getLoded,
      action.payload.examplesLodeUrl,
      action.payload.declarationsLodeUrl
    );
    yield* put(initLodesSuccessAction(lode));
  } catch (error: any) {
    yield* put(initLodesFailureAction(error));
  }
}

export function* saga() {
  const { initLodesAction } = lodeActions;

  yield* takeEvery(initLodesAction, initSaga);
}
