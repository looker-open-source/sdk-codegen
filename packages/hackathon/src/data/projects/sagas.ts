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
import { sheetsSdkHelper } from '../sheets_sdk_helper'
import {
  Actions,
  currentProjectsRequest,
  allProjectsSuccess,
  currentProjectsSuccess,
  BeginEditProjectRequestAction,
  beginEditProjectSuccess,
  DeleteProjectRequestAction,
  LockProjectsRequestAction,
  lockProjectsSuccess,
  SaveProjectRequestAction,
  saveProjectSuccess,
} from './actions'

function* allProjectsSaga() {
  try {
    yield put(beginLoading())
    const result = yield call([sheetsSdkHelper, sheetsSdkHelper.getProjects])
    yield put(endLoading())
    yield put(allProjectsSuccess(result))
  } catch (err) {
    console.error(err)
    yield put(actionMessage('A problem occurred loading the data', 'critical'))
  }
}

function* currentProjectsSaga() {
  try {
    yield put(beginLoading())
    const hackathon = yield call([
      sheetsSdkHelper,
      sheetsSdkHelper.getCurrentHackathon,
    ])
    const result = yield call(
      [sheetsSdkHelper, sheetsSdkHelper.getCurrentProjects],
      hackathon
    )
    yield put(endLoading())
    yield put(currentProjectsSuccess(result))
  } catch (err) {
    console.error(err)
    yield put(actionMessage('A problem occurred loading the data', 'critical'))
  }
}

function* saveProjectSaga(action: SaveProjectRequestAction) {
  try {
    yield put(beginLoading())
    yield call(
      [sheetsSdkHelper, sheetsSdkHelper.createProject],
      action.payload.hacker_id,
      action.payload.projects,
      action.payload.project
    )
    yield put(endLoading())
    yield put(saveProjectSuccess())
  } catch (err) {
    console.error(err)
    yield put(
      actionMessage('A problem occurred while saving the project', 'critical')
    )
  }
}

function* editProjectSaga(action: BeginEditProjectRequestAction) {
  try {
    yield put(beginLoading())
    yield call(
      [sheetsSdkHelper, sheetsSdkHelper.updateProject],
      action.payload.projects,
      action.payload.project
    )
    yield put(endLoading())
    yield put(beginEditProjectSuccess())
  } catch (err) {
    console.error(err)
    yield put(
      actionMessage('A problem occurred while editing the project', 'critical')
    )
  }
}

function* deleteProjectSaga(action: DeleteProjectRequestAction) {
  try {
    yield put(beginLoading())
    yield call(
      [sheetsSdkHelper, sheetsSdkHelper.deleteProject],
      action.payload.projects,
      action.payload.project
    )
    yield put(currentProjectsRequest())
  } catch (err) {
    console.error(err)
    yield put(
      actionMessage('A problem occurred while deleting the project', 'critical')
    )
  }
}

function* lockProjectsSaga(action: LockProjectsRequestAction) {
  try {
    yield put(beginLoading())
    const result = yield call(
      [sheetsSdkHelper, sheetsSdkHelper.lockProjects],
      action.payload.projects,
      action.payload.hackathon,
      action.payload.lock
    )
    yield put(endLoading())
    yield put(lockProjectsSuccess(result))
  } catch (err) {
    console.error(err)
    yield put(
      actionMessage(
        'A problem occurred while locking the hackathon projects',
        'critical'
      )
    )
  }
}

export function* registerProjectsSagas() {
  yield all([
    takeEvery(Actions.ALL_PROJECTS_REQUEST, allProjectsSaga),
    takeEvery(Actions.CURRENT_PROJECTS_REQUEST, currentProjectsSaga),
    takeEvery(Actions.SAVE_PROJECT_REQUEST, saveProjectSaga),
    takeEvery(Actions.BEGIN_EDIT_PROJECT_REQUEST, editProjectSaga),
    takeEvery(Actions.DELETE_PROJECT_REQUEST, deleteProjectSaga),
    takeEvery(Actions.LOCK_PROJECTS_REQUEST, lockProjectsSaga),
  ])
}
