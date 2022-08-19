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
import React from 'react'

import type { SpecItem, SpecList } from '@looker/sdk-codegen'
import { useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { getLoadedSpecs } from '../../test-data'
import {
  createTestStore,
  renderWithRouterAndReduxProvider,
} from '../../test-utils'
import { getApixAdaptor } from '../../utils'
import { DiffScene } from './DiffScene'

jest.mock('react-redux', () => {
  const reactRedux = jest.requireActual('react-redux')
  return {
    __esModule: true,
    ...reactRedux,
    useDispatch: jest.fn(reactRedux.useDispatch),
  }
})

jest.mock('react-router-dom', () => {
  const ReactRouter = jest.requireActual('react-router-dom')

  return {
    __esModule: true,
    ...ReactRouter,
    useHistory: jest.fn().mockReturnValue({ push: jest.fn(), location }),
    useLocation: jest
      .fn()
      .mockReturnValue({ pathname: '/4.0/diff/3.1', search: '' }),
  }
})

const specs = getLoadedSpecs() as SpecList
class MockApixAdaptor {
  async fetchSpec(spec: SpecItem) {
    return new Promise(() => specs[spec.key])
  }
}

const mockApixAdaptor = new MockApixAdaptor()
jest.mock('../../utils/apixAdaptor', () => {
  const apixAdaptor = jest.requireActual('../../utils/apixAdaptor')
  return {
    __esModule: true,
    ...apixAdaptor,
    getApixAdaptor: jest.fn(),
  }
})

describe('DiffScene', () => {
  const mockDispatch = jest.fn()

  afterEach(() => {
    jest.clearAllMocks()
  })
  ;(getApixAdaptor as jest.Mock).mockReturnValue(mockApixAdaptor)
  Element.prototype.scrollTo = jest.fn()
  Element.prototype.scrollIntoView = jest.fn()

  const toggleNavigation = () => false
  test.only('toggling comparison option pushes param to url', () => {
    // const { push } = useHistory()
    ;(useDispatch as jest.Mock).mockReturnValue(mockDispatch)
    const store = createTestStore({
      specs: { specs, currentSpecKey: '4.0' },
      settings: { initialized: true },
    })
    const MockScene = <DiffScene toggleNavigation={toggleNavigation} />
    const { rerender } = renderWithRouterAndReduxProvider(
      MockScene,
      ['/4.0/diff/3.1'],
      store
    )
    ;(useLocation as jest.Mock).mockReturnValue({
      pathname: '/4.0/diff/3.1',
      search: '?opts=missing',
    })
    rerender(MockScene)
    expect(mockDispatch).toHaveBeenLastCalledWith({
      payload: { diffOptions: ['missing'] },
      type: 'settings/setDiffOptionsAction',
    })
  })
})
