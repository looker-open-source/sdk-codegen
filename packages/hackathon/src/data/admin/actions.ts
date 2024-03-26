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

export enum Actions {
  LOAD_USER_ATTRIBUTES_REQUEST = 'LOAD_USER_ATTRIBUTES_REQUEST',
  LOAD_USER_ATTRIBUTES_RESPONSE = 'LOAD_USER_ATTRIBUTES_RESPONSE',
  UPDATE_USER_ATTRIBUTE_VALUES = 'UPDATE_USER_ATTRIBUTE_VALUES',
  SAVE_USER_ATTRIBUTES_REQUEST = 'SAVE_USER_ATTRIBUTES_REQUEST',
  SAVE_USER_ATTRIBUTES_RESPONSE = 'SAVE_USER_ATTRIBUTES_RESPONSE',
}

export interface AdminUserAttributes {
  lookerClientId: string;
  lookerClientSecret: string;
  sheetId: string;
  tokenServerUrl: string;
}

export interface LoadUserAttributesRequestAction {
  type: Actions.LOAD_USER_ATTRIBUTES_REQUEST;
}

export interface LoadUserAttributesResponseAction {
  type: Actions.LOAD_USER_ATTRIBUTES_RESPONSE;
  payload: AdminUserAttributes;
}

export interface UpdateAttributeValuesAction {
  type: Actions.UPDATE_USER_ATTRIBUTE_VALUES;
  payload: AdminUserAttributes;
}

export interface SaveUserAttributesRequestAction {
  type: Actions.SAVE_USER_ATTRIBUTES_REQUEST;
  payload: AdminUserAttributes;
}

export interface SaveUserAttributesResponseAction {
  type: Actions.SAVE_USER_ATTRIBUTES_RESPONSE;
  payload: {
    adminUserAttributes: AdminUserAttributes;
    validationMessages?: ValidationMessages;
  };
}

export type AdminAction =
  | LoadUserAttributesRequestAction
  | LoadUserAttributesResponseAction
  | UpdateAttributeValuesAction
  | SaveUserAttributesRequestAction
  | SaveUserAttributesResponseAction;

export const loadUserAttributesRequest =
  (): LoadUserAttributesRequestAction => ({
    type: Actions.LOAD_USER_ATTRIBUTES_REQUEST,
  });

export const loadUserAttributesResponse = (
  adminUserAttributes: AdminUserAttributes
): LoadUserAttributesResponseAction => ({
  type: Actions.LOAD_USER_ATTRIBUTES_RESPONSE,
  payload: adminUserAttributes,
});

export const updateAttributeValues = (
  adminUserAttributes: AdminUserAttributes
): UpdateAttributeValuesAction => ({
  type: Actions.UPDATE_USER_ATTRIBUTE_VALUES,
  payload: adminUserAttributes,
});

export const saveUserAttributesRequest = (
  adminUserAttributes: AdminUserAttributes
): SaveUserAttributesRequestAction => ({
  type: Actions.SAVE_USER_ATTRIBUTES_REQUEST,
  payload: adminUserAttributes,
});

export const saveUserAttributesResponse = (
  adminUserAttributes: AdminUserAttributes,
  validationMessages?: ValidationMessages
): SaveUserAttributesResponseAction => ({
  type: Actions.SAVE_USER_ATTRIBUTES_RESPONSE,
  payload: { adminUserAttributes, validationMessages },
});
