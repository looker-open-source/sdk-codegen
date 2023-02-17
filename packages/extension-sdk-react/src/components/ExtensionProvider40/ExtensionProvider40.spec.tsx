/*

 MIT License

 Copyright (c) 2022 Looker Data Sciences, Inc.

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

import { shallow } from 'enzyme'
import * as React from 'react'
import { unregisterCore40SDK } from '../../sdk/core_sdk_40'
import { ExtensionProvider40 } from './ExtensionProvider40'

let mockFailConnection = false
const mockHost = {
  clientRouteChanged: () => {
    // noop
  },
}

jest.mock('@looker/extension-sdk', () => ({
  connectExtensionHost: () =>
    mockFailConnection
      ? Promise.reject(new Error('Extension failed to load'))
      : Promise.resolve(mockHost),
  LookerExtensionSDK31: {
    createClient: () => ({}),
  },
}))

describe('ExtensionProvider40 component', () => {
  let originalConsoleError: any

  beforeEach(() => {
    originalConsoleError = console.error
    console.error = jest.fn()
    mockFailConnection = false
    unregisterCore40SDK()
  })

  afterEach(() => {
    console.error = originalConsoleError
  })

  it('renders', () => {
    const comp = shallow(
      <ExtensionProvider40 loadingComponent={<span id="loading">Loading</span>}>
        <div id="extension"></div>
      </ExtensionProvider40>
    )
    expect(comp.find('ContextProvider')).toHaveLength(1)
    expect(comp.find('[loadingComponent]')).toHaveLength(1)
    expect(comp.find('#extension')).toHaveLength(1)
  })
})
