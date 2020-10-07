import { all, call, put, takeEvery } from 'redux-saga/effects'
import { Projects } from '../../models'
import { Actions, allProjectsSuccess, actionError } from './actions'
import { DefaultSettings, BrowserTransport } from '@looker/sdk-rtl/lib/browser'
import { ISheet, SheetSDK } from '@looker/wholly-sheet'
import { SheetData } from '../../models/SheetData'

// TODO the setup of the SheetData will change. I will likely retrieved from
// eslint-disable-next-liconst tabs = require('../../wholly-sheet/src/tabs.json')
const tabs = require('../../../../wholly-sheet/src/tabs.json')
const sheet = { tabs } as ISheet
const sheetSDK = new SheetSDK(
  new BrowserTransport(DefaultSettings()),
  'bogus',
  'bogus'
)
const sheetData = new SheetData(sheetSDK, sheet)

const projects = {
  getProjects: async (): Promise<Projects> => {
    return sheetData.projects
  },
}

function* allProjectsSaga() {
  try {
    const result = yield call([projects, projects.getProjects])
    yield put(allProjectsSuccess(result))
  } catch (err) {
    yield put(actionError(err.message))
  }
}

export function* registerProjectsSagas() {
  yield all([takeEvery(Actions.ALL_PROJECTS_REQUEST, allProjectsSaga)])
}
