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
  loadUserAttributesRequest,
  loadUserAttributesSuccess,
  AdminUserAttributes,
  AttributeValue,
  saveUserAttributes,
} from './actions'

const findUserAttributeValue = (
  name: string,
  userAttributes: IUserAttribute[]
): AttributeValue => {
  const userAttribute = userAttributes.find(
    (userAttribute) => userAttribute.name === name
  )
  const value = userAttribute ? userAttribute.default_value || '' : ''
  return {
    value,
    originalValue: value,
  }
}

const getAttributeNamePrefix = () =>
  getExtensionSDK().lookerHostData?.extensionId.replace(/::|-/g, '_') + '_'

const extractUserAttributes = (
  userAttributes: IUserAttribute[]
): AdminUserAttributes => {
  const prefix = getAttributeNamePrefix()
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

function* persistUserAttribute(
  newAttributeValue: AttributeValue,
  attributeName: string,
  userAttributes: IUserAttribute[],
  label: string,
  url?: string
) {
  if (newAttributeValue.originalValue !== newAttributeValue.value) {
    const userAttribute = userAttributes.find(
      (ua: IUserAttribute) => ua.name === attributeName
    )
    const lookerSdk = getCore40SDK()
    yield call([lookerSdk, lookerSdk.delete_user_attribute], userAttribute!.id!)
    const ua: IUserAttribute = {
      name: attributeName,
      label,
      default_value: newAttributeValue.value,
      type: 'string',
      user_can_edit: false,
      user_can_view: true,
    }
    if (url) {
      ua.hidden_value_domain_whitelist = `${url}/*`
      ua.value_is_hidden = true
    }
    const result = yield call([lookerSdk, lookerSdk.create_user_attribute], ua)
    yield call([lookerSdk, lookerSdk.ok], result)
  }
}

function* saveUserAttributesSaga(
  action: ReturnType<typeof saveUserAttributes>
) {
  const prefix = getAttributeNamePrefix()
  try {
    const updatedUserAttributes: AdminUserAttributes = action.payload
    yield put(beginLoading())
    const lookerSdk = getCore40SDK()
    const result = yield call([lookerSdk, lookerSdk.all_user_attributes], {})
    const userAttributes = yield call([lookerSdk, lookerSdk.ok], result)
    yield persistUserAttribute(
      updatedUserAttributes.lookerClientId,
      `${prefix}looker_client_id`,
      userAttributes,
      'Hackathon Looker Client ID',
      updatedUserAttributes.tokenServerUrl.value
    )
    yield persistUserAttribute(
      updatedUserAttributes.lookerClientSecret,
      `${prefix}looker_client_secret`,
      userAttributes,
      'Hackathon Looker Client Secret',
      updatedUserAttributes.tokenServerUrl.value
    )
    yield persistUserAttribute(
      updatedUserAttributes.sheetId,
      `${prefix}sheet_id`,
      userAttributes,
      'Hackathon Sheet ID'
    )
    yield persistUserAttribute(
      updatedUserAttributes.tokenServerUrl,
      `${prefix}token_server_url`,
      userAttributes,
      'Hackathon Token Server URL'
    )
    // Load the user requests again. Not very efficient but for this
    // exercise okay. endLoading will be fired when loadUserAttributesSuccess
    // fires.
    yield put(loadUserAttributesRequest())
  } catch (err) {
    console.error(err)
    yield put(actionMessage('A problem occurred loading the data', 'critical'))
  }
}

export function* registerAdminSagas() {
  yield all([
    takeEvery(Actions.LOAD_USER_ATTRIBUTES_REQUEST, loadUserAttributesSaga),
    takeEvery(Actions.SAVE_USER_ATTRIBUTES, saveUserAttributesSaga),
  ])
}
