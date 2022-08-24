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
import { screen, waitFor, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { SpecItem, SpecList } from '@looker/sdk-codegen'
import { useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { getLoadedSpecs } from '../../test-data'
import {
  createTestStore,
  renderWithRouter,
  renderWithRouterAndReduxProvider,
} from '../../test-utils'
import { getApixAdaptor, MockedProvider, mockHistory } from '../../utils'
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
    useHistory: jest.fn().mockReturnValue({
      push: jest.fn(),
      location,
      useLocation: jest
        .fn()
        .mockReturnValue({ pathname: '/4.0/diff/3.1', search: '' }),
    }),
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
  test.only('updating url dispatches store action', () => {
    // skipping test due to an issue with rerender callback returned from @looker/redux
    ;(useDispatch as jest.Mock).mockReturnValue(mockDispatch)
    const store = createTestStore({
      specs: { specs, currentSpecKey: '4.0' },
      settings: { initialized: true },
    })
    const history = mockHistory({
      initialEntries: ['/4.0/diff/3.1'],
    })
    const MockScene = (
      <MockedProvider history={history} store={store}>
        <DiffScene toggleNavigation={toggleNavigation} />
      </MockedProvider>
    )
    const { rerender } = renderWithRouterAndReduxProvider(MockScene)
    history.push('/4.0/diff/3.1?opts=missing')
    rerender(MockScene)
    expect(mockDispatch).toHaveBeenLastCalledWith({
      payload: { diffOptions: ['missing'] },
      type: 'settings/setDiffOptionsAction',
    })
    // TODO: test URL change leads to store dispatch? - change mock history push implementation to change our location
    // TODO: test that toggling another will push both options to store/url
  })

  // test.todo(
  //   'rendering scene with opts param in url sets selected options in selector',
  //   async () => {
  //     jest.spyOn(routerLocation, 'useLocation').mockReturnValue({
  //       pathname: `/`,
  //       search: `opts=missing%2Ctype%2Cresponse`,
  //     } as unknown as Location)
  //     const store = createTestStore({
  //       specs: { specs, currentSpecKey: '3.1' },
  //       settings: { initialized: true, diffOptions: [] },
  //     })
  //     jest.spyOn(reactRedux, 'useDispatch').mockReturnValue(mockDispatch)
  //     renderWithRouterAndReduxProvider(
  //       <DiffScene specs={specs} toggleNavigation={toggleNavigation} />,
  //       ['/diff/3.1'],
  //       store
  //     )
  //     expect(mockDispatch).toHaveBeenLastCalledWith({
  //       payload: { diffOptions: ['missing', 'type', 'response'] },
  //       type: 'settings/setDiffOptionsAction',
  //     })
  //     expect(
  //       screen.getByRole('option', {
  //         name: 'Missing',
  //       })
  //     ).toBeInTheDocument()
  //     expect(
  //       screen.getByRole('option', {
  //         name: 'Type',
  //       })
  //     ).toBeInTheDocument()
  //     expect(
  //       screen.getByRole('option', {
  //         name: 'Response',
  //       })
  //     ).toBeInTheDocument()
  //   }
  // )
  test.todo('toggling comparison option pushes value to url opts param')
  test.todo('unselecting comparison option will remove it from url opts param')
  test.todo('selecting clear option will remove all params from url opts param')
})
