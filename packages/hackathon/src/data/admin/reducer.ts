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

import type { ValidationMessages } from '@looker/components';
import type { AdminAction, AdminUserAttributes } from './actions';
import { Actions } from './actions';

export interface AdminState {
  adminUserAttributes: AdminUserAttributes;
  validationMessages?: ValidationMessages;
}

const defaultState: Readonly<AdminState> = Object.freeze({
  adminUserAttributes: {
    lookerClientId: '',
    lookerClientSecret: '',
    sheetId: '',
    tokenServerUrl: '',
  },
});

export const adminReducer = (
  state: AdminState = defaultState,
  action: AdminAction
): AdminState => {
  switch (action.type) {
    case Actions.LOAD_USER_ATTRIBUTES_REQUEST:
      return {
        ...state,
      };
    case Actions.LOAD_USER_ATTRIBUTES_RESPONSE:
      return {
        ...state,
        adminUserAttributes: action.payload,
      };
    case Actions.UPDATE_USER_ATTRIBUTE_VALUES:
      return {
        ...state,
        adminUserAttributes: action.payload,
      };
    case Actions.SAVE_USER_ATTRIBUTES_REQUEST:
      return {
        ...state,
        validationMessages: undefined,
      };
    case Actions.SAVE_USER_ATTRIBUTES_RESPONSE: {
      const { adminUserAttributes, validationMessages } = action.payload;
      return {
        ...state,
        adminUserAttributes,
        validationMessages,
      };
    }
    default:
      return state;
  }
};
