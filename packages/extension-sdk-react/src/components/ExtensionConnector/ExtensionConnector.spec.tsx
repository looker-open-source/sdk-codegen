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

import type { ReactWrapper } from 'enzyme'
import { shallow, mount } from 'enzyme'
import { act } from 'react-dom/test-utils'
import * as React from 'react'
import { unregisterCore31SDK } from '../../sdk/core_sdk_31'
import { unregisterCore40SDK } from '../../sdk/core_sdk_40'
import type { BaseExtensionContextData } from '.'
import { ExtensionConnector } from '.'

let mockFailConnection = false
const mockHost: any = {
  clientRouteChanged: () => {
    // noop
  },
}

jest.mock('@looker/extension-sdk', () => ({
  connectExtensionHost: () =>
    mockFailConnection
      ? Promise.reject(new Error('Extension failed to load'))
      : Promise.resolve(mockHost),
  LookerExtensionSDK: {
    create31Client: () => ({}),
    create40Client: () => ({}),
  },
}))

describe('ExtensionProvider component', () => {
  let originalConsoleError: any

  const getContextData = () => {
    return {
      extensionSDK: mockHost,
    } as BaseExtensionContextData
  }
  const connectedCallback = jest.fn()
  const unloadedCallback = jest.fn()
  const updateContextData = jest.fn()

  beforeEach(() => {
    originalConsoleError = console.error
    console.error = jest.fn()
    mockFailConnection = false
    unregisterCore31SDK()
    unregisterCore40SDK()
  })

  afterEach(() => {
    console.error = originalConsoleError
  })

  it('renders loading', () => {
    const comp = shallow(
      <ExtensionConnector
        loadingComponent={<span id="loading">Loading</span>}
        contextData={getContextData()}
        updateContextData={updateContextData}
        connectedCallback={connectedCallback}
        unloadedCallback={unloadedCallback}
      >
        <div id="extension"></div>
      </ExtensionConnector>
    )
    expect(comp.find('MemoryRouter')).toHaveLength(0)
    expect(comp.find('#loading')).toHaveLength(1)
    expect(comp.find('#extension')).toHaveLength(0)
  })

  it('does not render loading', () => {
    const comp = shallow(
      <ExtensionConnector
        contextData={getContextData()}
        updateContextData={updateContextData}
        connectedCallback={connectedCallback}
        unloadedCallback={unloadedCallback}
      >
        <div id="extension"></div>
      </ExtensionConnector>
    )
    expect(comp.find('MemoryRouter')).toHaveLength(0)
    expect(comp.find('#loading')).toHaveLength(0)
    expect(comp.find('#extension')).toHaveLength(0)
  })

  it('renders content with MemoryRouter', async () => {
    let comp: ReactWrapper | undefined
    await act(async () => {
      comp = mount(
        <ExtensionConnector
          loadingComponent={<span id="loading">Loading</span>}
          contextData={getContextData()}
          updateContextData={updateContextData}
          connectedCallback={connectedCallback}
          unloadedCallback={unloadedCallback}
        >
          <div id="extension"></div>
        </ExtensionConnector>
      )
    })
    if (comp) {
      expect(comp.find('MemoryRouter')).toHaveLength(0)
      expect(comp.find('#loading')).toHaveLength(1)
      // Trigger rerender to remove loading and add content
      await act(async () => {
        if (comp) {
          comp.setProps({})
        } else {
          fail()
        }
      })
      expect(comp.find('MemoryRouter')).toHaveLength(1)
      expect(comp.find('#loading')).toHaveLength(0)
      expect(comp.find('#extension')).toHaveLength(1)
    } else {
      fail()
    }
  })

  it('renders content without MemoryRouter', async () => {
    let comp: ReactWrapper | undefined
    await act(async () => {
      comp = mount(
        <ExtensionConnector
          loadingComponent={<span id="loading">Loading</span>}
          hostTracksRoute={false}
          contextData={getContextData()}
          updateContextData={updateContextData}
          connectedCallback={connectedCallback}
          unloadedCallback={unloadedCallback}
        >
          <div id="extension"></div>
        </ExtensionConnector>
      )
    })
    if (comp) {
      expect(comp.find('MemoryRouter')).toHaveLength(0)
      expect(comp.find('#loading')).toHaveLength(1)
      // Trigger rerender to remove loading and add content
      await act(async () => {
        if (comp) {
          comp.update()
        } else {
          fail()
        }
      })
      expect(comp.find('MemoryRouter')).toHaveLength(0)
      expect(comp.find('#loading')).toHaveLength(0)
      expect(comp.find('#extension')).toHaveLength(1)
    } else {
      fail()
    }
  })

  it('renders initialization error', async () => {
    let comp: ReactWrapper | undefined
    mockFailConnection = true
    await act(async () => {
      comp = mount(
        <ExtensionConnector
          loadingComponent={<span id="loading">Loading</span>}
          contextData={getContextData()}
          updateContextData={updateContextData}
          connectedCallback={connectedCallback}
          unloadedCallback={unloadedCallback}
        >
          <div id="extension"></div>
        </ExtensionConnector>
      )
    })
    if (comp) {
      expect(comp.find('MemoryRouter')).toHaveLength(0)
      expect(comp.find('#loading')).toHaveLength(1)
      // Trigger rerender to remove loading and add content
      await act(async () => {
        if (comp) {
          comp.update()
        } else {
          fail()
        }
      })
      expect(comp.find('MemoryRouter')).toHaveLength(0)
      expect(comp.find('#loading')).toHaveLength(0)
      expect(comp.find('#extension')).toHaveLength(0)
      expect(comp.find('#extension-initialization-error')).toHaveLength(1)
      expect(comp.find('#extension-initialization-error').text()).toEqual(
        'Extension failed to load'
      )
    } else {
      fail()
    }
  })
})
