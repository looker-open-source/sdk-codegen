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
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { SpecItem } from '@looker/sdk-codegen'
import { getLoadedSpecs } from '../../test-data'
import {
  createTestStore,
  renderWithRouterAndReduxProvider,
} from '../../test-utils'
import { getApixAdaptor } from '../../utils'
import { DiffScene } from './DiffScene'

const mockHistoryPush = jest.fn()
jest.mock('react-router-dom', () => {
  const ReactRouterDOM = jest.requireActual('react-router-dom')
  return {
    ...ReactRouterDOM,
    useHistory: () => ({
      push: mockHistoryPush,
      location,
    }),
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
    ...apixAdaptor,
    getApixAdaptor: jest.fn(),
  }
})

describe('DiffScene', () => {
  ;(getApixAdaptor as jest.Mock).mockReturnValue(mockApixAdaptor)
  Element.prototype.scrollTo = jest.fn()
  Element.prototype.scrollIntoView = jest.fn()
  const store = createTestStore({
    specs: { specs, currentSpecKey: '3.1' },
  })
  const toggleNavigation = () => false
  test('toggling comparison option pushes it to url as param', async () => {
    renderWithRouterAndReduxProvider(
      <DiffScene specs={specs} toggleNavigation={toggleNavigation} />,
      ['/diff/3.1'],
      store
    )

    userEvent.click(screen.getByPlaceholderText('Comparison options'))
    userEvent.click(
      screen.getByRole('option', {
        name: 'Missing',
      })
    )
    await waitFor(() => {
      expect(mockHistoryPush).toHaveBeenCalledWith({
        pathname: '/',
        search: 'opts=missing',
      })
    })
  })
})
