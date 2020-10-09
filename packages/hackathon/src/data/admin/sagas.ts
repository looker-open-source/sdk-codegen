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
import { getCore40SDK } from '@looker/extension-sdk-react'
import { getExtensionSDK } from '@looker/extension-sdk'
import { IUserAttribute } from '@looker/sdk'
import { actionMessage, beginLoading, endLoading } from '../common/actions'
import {
  Actions,
  loadUserAttributesSuccess,
  AdminUserAttributes,
  AttributeValue,
} from './actions'

const findUserAttributeValue = (
  name: string,
  userAttributes: IUserAttribute[]
): AttributeValue => {
  const userAttribute = userAttributes.find(
    (userAttribute) => userAttribute.name === name
  )
  return {
    value: userAttribute ? userAttribute.default_value || '' : '',
    dirty: false,
  }
}

const extractUserAttributes = (
  userAttributes: IUserAttribute[]
): AdminUserAttributes => {
  const prefix =
    getExtensionSDK().lookerHostData?.extensionId.replace(/::|-/g, '_') + '_'
  return {
    lookerClientId: findUserAttributeValue(
      prefix + 'looker_client_id',
      userAttributes
    ),
    lookerClientSecret: findUserAttributeValue(
      prefix + 'looker_client_secret',
      userAttributes
    ),
    sheetId: findUserAttributeValue(prefix + 'sheet_id', userAttributes),
    tokenServerUrl: findUserAttributeValue(
      prefix + 'token_server_url',
      userAttributes
    ),
  }
}

function* loadUserAttributesSaga() {
  try {
    yield put(beginLoading())
    const lookerSdk = getCore40SDK()
    const result = yield call([lookerSdk, lookerSdk.all_user_attributes], {})
    const userAttributes = yield call([lookerSdk, lookerSdk.ok], result)
    yield put(endLoading())
    yield put(loadUserAttributesSuccess(extractUserAttributes(userAttributes)))
  } catch (err) {
    console.error(err)
    yield put(actionMessage('A problem occurred loading the data', 'critical'))
  }
}

export function* registeAdminSagas() {
  yield all([
    takeEvery(Actions.LOAD_USER_ATTRIBUTES_REQUEST, loadUserAttributesSaga),
  ])
}
