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
import { useHistory } from 'react-router-dom'
import type { Location } from 'history'
import * as reactRedux from 'react-redux'
import * as routerLocation from 'react-router-dom'
import { createTestStore, withReduxProvider } from '../../test-utils'
import { useGlobalStoreSync } from './globalStoreSync'

jest.mock('react-router-dom', () => {
  const ReactRouterDOM = jest.requireActual('react-router-dom')
  return {
    ...ReactRouterDOM,
    useHistory: jest
      .fn()
      .mockReturnValue({ push: jest.fn(), location: globalThis.location }),
    useLocation: jest.fn().mockReturnValue({ pathname: '/', search: '' }),
  }
})

describe.skip('useGlobalStoreSync', () => {
  const mockDispatch = jest.fn()

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('does nothing if uninitialized', () => {
    const { push } = useHistory()
    const wrapper = ({ children }: any) => withReduxProvider(children)
    renderHook(() => useGlobalStoreSync(), { wrapper })
    expect(push).not.toHaveBeenCalled()
  })

  describe('search', () => {
    test('updates store search pattern with url search pattern if present', () => {
      const { push } = useHistory()
      const store = createTestStore({
        settings: {
          initialized: true,
        },
      })
      jest.spyOn(routerLocation, 'useLocation').mockReturnValue({
        pathname: '/',
        search: `s=patternFromUrl`,
      } as unknown as Location)
      jest.spyOn(reactRedux, 'useDispatch').mockReturnValue(mockDispatch)
      const wrapper = ({ children }: any) => withReduxProvider(children, store)
      renderHook(() => useGlobalStoreSync(), { wrapper })
      expect(mockDispatch).toHaveBeenCalledWith({
        payload: { searchPattern: 'patternFromUrl' },
        type: 'settings/setSearchPatternAction',
      })
      expect(push).toHaveBeenCalledWith({ pathname: '/', search: 'sdk=py' })
    })
  })

  describe('sdk', () => {
    test('syncs url sdk param with sdk in store', () => {
      const { push } = useHistory()
      const store = createTestStore({
        settings: {
          initialized: true,
          sdkLanguage: 'Kotlin',
        },
      })
      const wrapper = ({ children }: any) => withReduxProvider(children, store)
      renderHook(() => useGlobalStoreSync(), { wrapper })
      expect(push).toHaveBeenCalledWith({
        pathname: '/',
        search: 'sdk=kt',
      })
    })

    test.each([
      ['alias', 'kt'],
      ['language', 'kotlin'],
    ])(
      'overrides store with sdk full name given valid url sdk %s',
      (_, param) => {
        const { push } = useHistory()
        const store = createTestStore({
          settings: {
            initialized: true,
          },
        })
        jest.spyOn(routerLocation, 'useLocation').mockReturnValue({
          pathname: '/',
          search: `sdk=${param}`,
        } as unknown as Location)
        jest.spyOn(reactRedux, 'useDispatch').mockReturnValue(mockDispatch)
        const wrapper = ({ children }: any) =>
          withReduxProvider(children, store)
        renderHook(() => useGlobalStoreSync(), { wrapper })
        expect(push).not.toHaveBeenCalled()
        expect(mockDispatch).toHaveBeenLastCalledWith({
          payload: { sdkLanguage: 'Kotlin' },
          type: 'settings/setSdkLanguageAction',
        })
      }
    )

    test('updates url sdk param with store sdk for invalid url sdk param', () => {
      const { push } = useHistory()
      const store = createTestStore({
        settings: {
          initialized: true,
        },
      })
      jest.spyOn(routerLocation, 'useLocation').mockReturnValue({
        pathname: '/',
        search: `sdk=invalid`,
      } as unknown as Location)
      jest.spyOn(reactRedux, 'useDispatch').mockReturnValue(mockDispatch)
      const wrapper = ({ children }: any) => withReduxProvider(children, store)
      renderHook(() => useGlobalStoreSync(), { wrapper })
      expect(mockDispatch).not.toHaveBeenCalled()
      expect(push).toHaveBeenCalledWith({
        pathname: '/',
        search: `sdk=py`,
      })
    })
  })
})
