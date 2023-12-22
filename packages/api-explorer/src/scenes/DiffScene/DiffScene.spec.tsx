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
import { screen, waitFor, within } from '@testing-library/react'

import type { SpecItem } from '@looker/sdk-codegen'
import userEvent from '@testing-library/user-event'
import { getLoadedSpecs } from '../../test-data'
import {
  createTestStore,
  renderWithRouterAndReduxProvider,
} from '../../test-utils'
import { getApixAdaptor } from '../../utils'
import { DiffScene } from './DiffScene'

const mockHistoryPush = jest.fn()
jest.mock('react-router-dom', () => {
  const location = {
    pathname: '/3.1/diff',
    search: '',
    hash: '',
    state: {},
    key: '',
  }
  const ReactRouter = jest.requireActual('react-router-dom')
  return {
    __esModule: true,
    ...ReactRouter,
    useHistory: () => ({
      push: mockHistoryPush,
      location,
    }),
    useLocation: jest.fn().mockReturnValue(location),
  }
})

const specs = getLoadedSpecs()
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
  beforeEach(() => {
    jest.clearAllMocks()
  })
  ;(getApixAdaptor as jest.Mock).mockReturnValue(mockApixAdaptor)
  Element.prototype.scrollTo = jest.fn()
  Element.prototype.scrollIntoView = jest.fn()

  const toggleNavigation = () => false

  test('rendering with no url opts param results in default comparison options toggled', () => {
    const store = createTestStore({
      specs: { specs, currentSpecKey: '3.1' },
    })
    renderWithRouterAndReduxProvider(
      <DiffScene toggleNavigation={toggleNavigation} />,
      ['/3.1/diff'],
      store
    )

    expect(
      screen.getByRole('option', {
        name: 'Missing Delete',
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('option', {
        name: 'Parameters Delete',
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('option', {
        name: 'Type Delete',
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('option', {
        name: 'Body Delete',
      })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('option', {
        name: 'Status Delete',
      })
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('option', {
        name: 'Response Delete',
      })
    ).toBeInTheDocument()
  })

  test('selecting a comparison option pushes it to url opts param', async () => {
    const store = createTestStore({
      specs: { specs, currentSpecKey: '3.1' },
      settings: { diffOptions: [] },
    })
    renderWithRouterAndReduxProvider(
      <DiffScene toggleNavigation={toggleNavigation} />,
      ['/3.1/diff'],
      store
    )
    userEvent.click(screen.getByPlaceholderText('Comparison options'))
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    userEvent.click(
      screen.getByRole('option', {
        name: 'Missing',
      })
    )
    await waitFor(() => {
      expect(mockHistoryPush).toHaveBeenLastCalledWith({
        pathname: '/3.1/diff',
        search: 'opts=missing',
      })
    })
  })

  test('unselecting comparison option will remove it from url opts param', async () => {
    const store = createTestStore({
      specs: { specs, currentSpecKey: '3.1' },
      settings: { diffOptions: ['missing', 'params'] },
    })
    renderWithRouterAndReduxProvider(
      <DiffScene toggleNavigation={toggleNavigation} />,
      ['/3.1/diff'],
      store
    )
    const missingOption = screen.getByRole('option', {
      name: 'Missing Delete',
    })
    userEvent.click(within(missingOption).getByRole('button'))
    await waitFor(() => {
      expect(mockHistoryPush).toHaveBeenLastCalledWith({
        pathname: '/3.1/diff',
        search: 'opts=params',
      })
    })
  })

  test('selecting clear option will remove all params from url opts param', async () => {
    const store = createTestStore({
      specs: { specs, currentSpecKey: '3.1' },
    })
    renderWithRouterAndReduxProvider(
      <DiffScene toggleNavigation={toggleNavigation} />,
      ['/3.1/diff'],
      store
    )
    userEvent.click(
      screen.getByRole('button', {
        name: 'Clear Field',
      })
    )
    await waitFor(() => {
      expect(mockHistoryPush).toHaveBeenLastCalledWith({
        pathname: '/3.1/diff',
        search: '',
      })
    })
  })
})
