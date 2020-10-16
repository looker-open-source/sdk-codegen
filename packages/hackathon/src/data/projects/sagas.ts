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
  UpdateProjectAction,
  DeleteProjectAction,
  LockProjectsAction,
  CreateProjectAction,
  ChangeMembershipAction,
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

function* createProjectSaga(action: CreateProjectAction) {
  try {
    yield put(beginLoading())
    yield call(
      [sheetsSdkHelper, sheetsSdkHelper.createProject],
      action.payload.hacker_id,
      action.payload.projects,
      action.payload.project
    )
    yield put(currentProjectsRequest())
  } catch (err) {
    console.error(err)
    yield put(
      actionMessage('A problem occurred while saving the project', 'critical')
    )
  }
}

function* updateProjectSaga(action: UpdateProjectAction) {
  try {
    yield put(beginLoading())
    yield call(
      [sheetsSdkHelper, sheetsSdkHelper.updateProject],
      action.payload.projects,
      action.payload.project
    )
    yield put(currentProjectsRequest())
  } catch (err) {
    console.error(err)
    yield put(
      actionMessage('A problem occurred while editing the project', 'critical')
    )
  }
}

function* deleteProjectSaga(action: DeleteProjectAction) {
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

function* lockProjectsSaga(action: LockProjectsAction) {
  try {
    yield put(beginLoading())
    yield call(
      [sheetsSdkHelper, sheetsSdkHelper.lockProjects],
      action.payload.projects,
      action.payload.hackathon,
      action.payload.lock
    )
    yield put(currentProjectsRequest())
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

function* changeMembershipSaga(action: ChangeMembershipAction) {
  try {
    yield put(beginLoading())
    yield call(
      [sheetsSdkHelper, sheetsSdkHelper.changeMembership],
      action.payload.project,
      action.payload.hacker,
      action.payload.leave
    )
    yield put(currentProjectsRequest())
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
    takeEvery(Actions.CREATE_PROJECT, createProjectSaga),
    takeEvery(Actions.UPDATE_PROJECT, updateProjectSaga),
    takeEvery(Actions.DELETE_PROJECT, deleteProjectSaga),
    takeEvery(Actions.LOCK_PROJECTS, lockProjectsSaga),
    takeEvery(Actions.CHANGE_MEMBERSHIP, changeMembershipSaga),
  ])
}
