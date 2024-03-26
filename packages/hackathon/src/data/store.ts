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
import type { SagaMiddleware } from 'redux-saga';
import createSagaMiddleware from 'redux-saga';

import { applyMiddleware, createStore } from 'redux';
import { registerProjectsSagas } from './projects/sagas';
import { registerHackSessionSagas } from './hack_session/sagas';
import { registerAdminSagas } from './admin/sagas';
import { registerAddUserSagas } from './add_user/sagas';
import { rootReducer } from './root_reducer';
import { registerHackersSagas } from './hackers/sagas';
import { registerJudgingsSagas } from './judgings/sagas';

const sagaMiddleware: SagaMiddleware = createSagaMiddleware();

const registerSagas = (callbacks: any[]) => {
  callbacks.forEach((callback) => sagaMiddleware.run(callback));
};

const store = createStore(rootReducer, applyMiddleware(sagaMiddleware));
registerSagas([
  registerProjectsSagas,
  registerHackSessionSagas,
  registerAdminSagas,
  registerAddUserSagas,
  registerHackersSagas,
  registerJudgingsSagas,
]);

export default store;
