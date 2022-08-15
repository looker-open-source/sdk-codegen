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
import { renderHook } from '@testing-library/react-hooks'
import { useHistory, useLocation } from 'react-router-dom'
import type { Location, History } from 'history'
import { createTestStore, withReduxProvider } from '../../test-utils'
import { useGlobalStoreSync } from './globalStoreSync'

jest.mock('react-router', () => {
  const ReactRouterDOM = jest.requireActual('react-router-dom')
  return {
    __esModule: true,
    ...ReactRouterDOM,
    useHistory: jest.fn(),
    useLocation: jest.fn(),
  }
})

describe('useGlobalStoreSync', () => {
  let history: History
  const mockUseHistory = useHistory as jest.Mock<ReturnType<typeof useHistory>>
  const mockUseLocation = useLocation as jest.Mock<
    ReturnType<typeof useLocation>
  >

  beforeEach(() => {
    history = {
      push: jest.fn(),
      location,
    } as unknown as History
    mockUseHistory.mockReturnValue(history)
  })

  test('does nothing if uninitialized', () => {
    mockUseLocation.mockReturnValue({
      pathname: '/',
      search: '',
    } as Location)
    const wrapper = ({ children }: any) => withReduxProvider(children)
    renderHook(() => useGlobalStoreSync(), { wrapper })
    expect(history.push).not.toHaveBeenCalled()
  })

  test('syncs url with local store if it contains past state information', () => {
    const store = createTestStore({
      settings: {
        initialized: true,
        sdkLanguage: 'kt',
        searchPattern: 'test',
      },
    })
    mockUseLocation.mockReturnValue({
      pathname: '/',
      search: '',
    } as Location)
    const wrapper = ({ children }: any) => withReduxProvider(children, store)
    renderHook(() => useGlobalStoreSync(), { wrapper })
    expect(history.push).toHaveBeenCalledWith({
      pathname: '/',
      search: 's=test',
    })
    expect(history.push).toHaveBeenCalledWith({
      pathname: '/',
      search: 'sdk=kt',
    })
  })

  /**
   * TODO: test cases
   * 1 - url valid params are synced to store
   * 2 - invalid url params are corrected
   */

  // const mockDispatch = jest.fn()
  // jest.mock('react-redux', () => ({
  //   useDispatch: () => mockDispatch,
  // }))
  //
  // test('syncs local store with valid url parameters', () => {
  //   const store = createTestStore({
  //     settings: {
  //       initialized: true,
  //     },
  //   })
  //   mockUseLocation.mockReturnValue({
  //     pathname: '/',
  //     search: 's=test&sdk=kt',
  //   } as Location)
  //   const wrapper = ({ children }: any) => withReduxProvider(children, store)
  //   renderHook(() => useGlobalStoreSync(), { wrapper })
  // })
})
