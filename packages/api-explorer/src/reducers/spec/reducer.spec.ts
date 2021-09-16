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

import { specs } from '../../test-data'
import type { SelectSpecAction } from '.'
import { specReducer, initDefaultSpecState, Actions } from '.'

describe('Spec Reducer', () => {
  test('it selects a spec', () => {
    const action: SelectSpecAction = {
      type: Actions.SELECT_SPEC,
      payload: '4.0',
    }

    const state = specReducer(initDefaultSpecState(specs, location), action)
    expect(state.spec.api).toBeInstanceOf(ApiModel)
    expect(state.spec.key).toEqual('4.0')
    expect(state.spec.status).toEqual(specs['4.0'].status)
  })
})
