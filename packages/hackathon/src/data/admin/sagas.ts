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
import type { ValidationMessages } from '@looker/components';
import { getCore40SDK } from '@looker/extension-sdk-react';
import { getExtensionSDK } from '@looker/extension-sdk';
import type { IUserAttribute } from '@looker/sdk';
import { actionMessage, beginLoading, endLoading } from '../common/actions';
import type { AdminUserAttributes, saveUserAttributesRequest } from './actions';
import {
  Actions,
  loadUserAttributesResponse,
  saveUserAttributesResponse,
} from './actions';

const findUserAttributeValue = (
  name: string,
  userAttributes: IUserAttribute[]
): string => {
  const userAttribute = userAttributes.find(
    (userAttribute) => userAttribute.name === name
  );
  return userAttribute ? userAttribute.default_value || '' : '';
};

const getAttributeNamePrefix = () =>
  getExtensionSDK().lookerHostData?.extensionId.replace(/::|-/g, '_');

const extractUserAttributes = (
  userAttributes: IUserAttribute[]
): AdminUserAttributes => {
  const prefix = getAttributeNamePrefix();
  return {
    lookerClientId: findUserAttributeValue(
      prefix + '_looker_client_id',
      userAttributes
    ),
    lookerClientSecret: findUserAttributeValue(
      prefix + '_looker_client_secret',
      userAttributes
    ),
    sheetId: findUserAttributeValue(prefix + '_sheet_id', userAttributes),
    tokenServerUrl: findUserAttributeValue(
      prefix + '_token_server_url',
      userAttributes
    ),
  };
};

const validateUserAttributes = (
  userAttributes: AdminUserAttributes
): ValidationMessages | undefined => {
  const validationMessages: ValidationMessages = {};
  if (userAttributes.lookerClientId.trim() === '') {
    validationMessages.lookerClientId = {
      type: 'error',
      message: 'Looker client id required',
    };
  }
  if (userAttributes.lookerClientId.trim() === '') {
    validationMessages.lookerClientSecret = {
      type: 'error',
      message: 'Looker client secret required',
    };
  }
  if (userAttributes.sheetId.trim() === '') {
    validationMessages.sheetId = {
      type: 'error',
      message: 'Google sheet id required',
    };
  }
  if (userAttributes.tokenServerUrl.trim() === '') {
    validationMessages.tokenServerUrl = {
      type: 'error',
      message: 'Access toker server URL required',
    };
  }
  return Object.keys(validationMessages).length === 0
    ? undefined
    : validationMessages;
};

function* loadUserAttributesSaga(): SagaIterator {
  try {
    yield put(beginLoading());
    const lookerSdk = getCore40SDK();
    const result = yield call([lookerSdk, lookerSdk.all_user_attributes], {});
    const userAttributes = yield call([lookerSdk, lookerSdk.ok], result);
    yield put(
      loadUserAttributesResponse(extractUserAttributes(userAttributes))
    );
    yield put(endLoading());
  } catch (err) {
    console.error(err);
    yield put(actionMessage('A problem occurred loading the data', 'critical'));
  }
}

function* persistUserAttribute(
  newAttributeValue: string,
  attributeName: string,
  userAttributes: IUserAttribute[],
  label: string,
  url?: string
): SagaIterator {
  const userAttribute = userAttributes.find(
    (ua: IUserAttribute) => ua.name === attributeName
  );
  if (!userAttribute || newAttributeValue !== userAttribute.default_value) {
    const lookerSdk = getCore40SDK();
    if (userAttribute && userAttribute.id) {
      yield call(
        [lookerSdk, lookerSdk.delete_user_attribute],
        userAttribute.id
      );
    }
    const ua: IUserAttribute = {
      name: attributeName,
      label,
      default_value: newAttributeValue,
      type: 'string',
      user_can_edit: false,
      user_can_view: true,
    };
    if (url) {
      ua.hidden_value_domain_whitelist = `${url}/*`;
      ua.value_is_hidden = true;
    }
    const result = yield call([lookerSdk, lookerSdk.create_user_attribute], ua);
    yield call([lookerSdk, lookerSdk.ok], result);
  }
}

function* saveUserAttributesSaga(
  action: ReturnType<typeof saveUserAttributesRequest>
): SagaIterator {
  const prefix = getAttributeNamePrefix();
  try {
    const updatedUserAttributes: AdminUserAttributes = action.payload;
    yield put(beginLoading());
    const validationMessages = validateUserAttributes(updatedUserAttributes);
    if (!validationMessages) {
      const lookerSdk = getCore40SDK();
      const result = yield call([lookerSdk, lookerSdk.all_user_attributes], {});
      const userAttributes = yield call([lookerSdk, lookerSdk.ok], result);
      yield persistUserAttribute(
        updatedUserAttributes.lookerClientId,
        `${prefix}_looker_client_id`,
        userAttributes,
        `${prefix} Hackathon Looker Client ID`,
        updatedUserAttributes.tokenServerUrl
      ) as any;
      yield persistUserAttribute(
        updatedUserAttributes.lookerClientSecret,
        `${prefix}_looker_client_secret`,
        userAttributes,
        `${prefix} Hackathon Looker Client Secret`,
        updatedUserAttributes.tokenServerUrl
      ) as any;
      yield persistUserAttribute(
        updatedUserAttributes.sheetId,
        `${prefix}_sheet_id`,
        userAttributes,
        `${prefix} Hackathon Sheet ID`
      ) as any;
      yield persistUserAttribute(
        updatedUserAttributes.tokenServerUrl,
        `${prefix}_token_server_url`,
        userAttributes,
        `${prefix} Hackathon Token Server URL`
      ) as any;
    }
    yield put(
      saveUserAttributesResponse(updatedUserAttributes, validationMessages)
    );
    yield put(endLoading());
  } catch (err) {
    console.error(err);
    yield put(actionMessage('A problem occurred saving the data', 'critical'));
  }
}

export function* registerAdminSagas() {
  yield all([
    takeEvery(Actions.LOAD_USER_ATTRIBUTES_REQUEST, loadUserAttributesSaga),
    takeEvery(Actions.SAVE_USER_ATTRIBUTES_REQUEST, saveUserAttributesSaga),
  ]);
}
