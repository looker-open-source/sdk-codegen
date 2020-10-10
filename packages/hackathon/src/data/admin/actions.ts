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

export enum Actions {
  LOAD_USER_ATTRIBUTES_REQUEST = 'LOAD_USER_ATTRIBUTES_REQUEST',
  LOAD_USER_ATTRIBUTES_SUCCESS = 'LOAD_USER_ATTRIBUTES_SUCCESS',
  UPDATE_USER_ATTRIBUTE_VALUES = 'UPDATE_USER_ATTRIBUTE_VALUES',
  SAVE_USER_ATTRIBUTES = 'SAVE_USER_ATTRIBUTES',
}

export interface AttributeValue {
  value: string
  originalValue: string
}

export interface AdminUserAttributes {
  lookerClientId: AttributeValue
  lookerClientSecret: AttributeValue
  sheetId: AttributeValue
  tokenServerUrl: AttributeValue
}

export interface LoadUserAttributesRequestAction {
  type: Actions.LOAD_USER_ATTRIBUTES_REQUEST
}

export interface LoadUserAttributesSuccessAction {
  type: Actions.LOAD_USER_ATTRIBUTES_SUCCESS
  payload: AdminUserAttributes
}

export interface UpdateAttributeValuesAction {
  type: Actions.UPDATE_USER_ATTRIBUTE_VALUES
  payload: AdminUserAttributes
}

export interface SaveUserAttributesAction {
  type: Actions.SAVE_USER_ATTRIBUTES
  payload: AdminUserAttributes
}

export type AdminAction =
  | LoadUserAttributesRequestAction
  | LoadUserAttributesSuccessAction
  | UpdateAttributeValuesAction
  | SaveUserAttributesAction

export const loadUserAttributesRequest = (): LoadUserAttributesRequestAction => ({
  type: Actions.LOAD_USER_ATTRIBUTES_REQUEST,
})

export const loadUserAttributesSuccess = (
  adminUserAttributes: AdminUserAttributes
): LoadUserAttributesSuccessAction => ({
  type: Actions.LOAD_USER_ATTRIBUTES_SUCCESS,
  payload: adminUserAttributes,
})

export const updateAttributeValues = (
  adminUserAttributes: AdminUserAttributes
): UpdateAttributeValuesAction => ({
  type: Actions.UPDATE_USER_ATTRIBUTE_VALUES,
  payload: adminUserAttributes,
})

export const saveUserAttributes = (
  adminUserAttributes: AdminUserAttributes
): SaveUserAttributesAction => ({
  type: Actions.SAVE_USER_ATTRIBUTES,
  payload: adminUserAttributes,
})
