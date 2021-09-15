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

import { ApiModel, SpecItem, SpecList } from '@looker/sdk-codegen'
import { ApiUpdatePayload } from './actions'
import { SpecAction, Actions } from '.'

export interface SpecState {
  specList: SpecList
  spec: SpecItem
}

export const specReducer = (
  state: SpecState,
  action: SpecAction
): SpecState => {
  const { type, payload } = action
  switch (type) {
    case Actions.UPDATE_SPEC_API: {
      const specList = { ...state.specList }
      const { specKey, api } = payload as ApiUpdatePayload
      let spec = specList[specKey]
      if (spec) {
        spec = { ...spec, api }
        specList[specKey] = spec
      }
      return { specList, spec }
    }
    case 'SELECT_SPEC': {
      const newState = { ...state }
      const spec = newState.specList[payload as string]
      // Does extension API Explorer needs this?
      if (spec) {
        if (!spec.api && spec.specContent) {
          spec.api = ApiModel.fromJson(spec.specContent)
        }
        return { ...state, spec }
      }
      return state
    }
    default:
      return state
  }
}
