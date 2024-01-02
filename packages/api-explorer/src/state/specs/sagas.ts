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
import type { SpecItem, SpecList } from '@looker/sdk-codegen';
import { call, put, select, takeEvery } from 'typed-redux-saga';
import type { PayloadAction } from '@reduxjs/toolkit';

import { getApixAdaptor } from '../../utils';
import type { RootState } from '../store';
import type { InitSpecsAction, SetCurrentSpecAction } from './slice';
import { specActions } from './slice';

function* initSaga(action: PayloadAction<InitSpecsAction>) {
  const { initSpecsSuccessAction, initSpecsFailureAction } = specActions;
  const adaptor = getApixAdaptor();

  try {
    const specs: SpecList = yield* call([adaptor, 'fetchSpecList']);
    let currentSpecKey = action.payload.specKey;
    if (!currentSpecKey || !specs[currentSpecKey]) {
      // if current spec key is invalid or not assigned, default to the first "current" spec
      currentSpecKey = Object.values(specs).find(
        (spec) => spec.status === 'current'
      )!.key;
    }
    const spec = yield* call([adaptor, 'fetchSpec'], specs[currentSpecKey]);
    specs[currentSpecKey] = spec;
    yield* put(initSpecsSuccessAction({ specs, currentSpecKey }));
  } catch (error: any) {
    // TODO if an error occurs here extension api explorer hangs.
    // Needs to be fixed. For now report the error.
    console.error(error);
    yield* put(initSpecsFailureAction(new Error(error.message)));
  }
}

function* setCurrentSpecSaga(action: PayloadAction<SetCurrentSpecAction>) {
  const { setCurrentSpecSuccessAction, setCurrentSpecFailureAction } =
    specActions;
  const adaptor = getApixAdaptor();
  const spec: SpecItem = yield* select(
    (state: RootState) => state.specs.specs[action.payload.currentSpecKey]
  );

  try {
    const newSpec = yield* call([adaptor, 'fetchSpec'], spec);
    yield* put(
      setCurrentSpecSuccessAction({
        api: newSpec.api!,
        currentSpecKey: action.payload.currentSpecKey,
      })
    );
  } catch (error: any) {
    console.error(error);
    yield put(setCurrentSpecFailureAction(new Error(error.message)));
  }
}

export function* saga() {
  const { initSpecsAction, setCurrentSpecAction } = specActions;

  yield* takeEvery(initSpecsAction, initSaga);
  yield* takeEvery(setCurrentSpecAction, setCurrentSpecSaga);
}
