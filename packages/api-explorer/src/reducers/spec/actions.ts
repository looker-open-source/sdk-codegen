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

import { ApiModel } from '@looker/sdk-codegen'

export enum Actions {
  SELECT_SPEC = 'SELECT_SPEC',
  UPDATE_SPEC_API = 'UPDATE_SPEC_API',
}

export interface ApiUpdatePayload {
  specKey: string
  api: ApiModel
}

export interface UpdateSpecApiAction {
  type: Actions.UPDATE_SPEC_API
  payload: ApiUpdatePayload
}

export interface SelectSpecAction {
  type: Actions.SELECT_SPEC
  payload: string
}

export type SpecAction = SelectSpecAction | UpdateSpecApiAction

export const selectSpec = (specKey: string): SelectSpecAction => ({
  type: Actions.SELECT_SPEC,
  payload: specKey,
})

export const updateSpecApi = (
  specKey: string,
  api: ApiModel
): UpdateSpecApiAction => ({
  type: Actions.UPDATE_SPEC_API,
  payload: { specKey, api },
})
