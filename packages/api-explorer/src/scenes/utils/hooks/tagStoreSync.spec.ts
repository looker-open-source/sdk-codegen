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
import { createTestStore, withReduxProvider } from '../../../test-utils'
import { useTagStoreSync } from './tagStoreSync'

jest.mock('react-router', () => {
  const ReactRouter = jest.requireActual('react-router')
  return {
    ...ReactRouter,
    useHistory: jest.fn().mockReturnValue({ push: jest.fn(), location }),
    useLocation: jest.fn().mockReturnValue({ pathname: '/', search: '' }),
  }
})

describe('useTagStoreSync', () => {
  const mockDispatch = jest.fn()

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('does nothing if uninitialized', () => {
    const { push } = useHistory()
    const wrapper = ({ children }: any) => withReduxProvider(children)
    renderHook(() => useTagStoreSync(), { wrapper })
    expect(push).not.toHaveBeenCalled()
  })

  describe.each([
    ['methods', 'get'],
    ['types', 'specification'],
  ])('tag filter verb for sidenav %s tab', (tagType, verb) => {
    test('overrides store tag filter given valid url tag filter param', () => {
      const { push } = useHistory()
      const store = createTestStore({
        settings: {
          initialized: true,
        },
      })
      jest.spyOn(routerLocation, 'useLocation').mockReturnValue({
        pathname: `/4.0/${tagType}/ApiAuth`,
        search: `t=${verb}`,
      } as unknown as Location)
      jest.spyOn(reactRedux, 'useDispatch').mockReturnValue(mockDispatch)
      const wrapper = ({ children }: any) => withReduxProvider(children, store)
      renderHook(() => useTagStoreSync(), { wrapper })
      expect(push).not.toHaveBeenCalled()
      expect(mockDispatch).toHaveBeenLastCalledWith({
        payload: { tagFilter: verb.toUpperCase() },
        type: 'settings/setTagFilterAction',
      })
    })

    test('updates url with store tag filter given invalid url tag filter param', () => {
      const { push } = useHistory()
      const store = createTestStore({
        settings: {
          initialized: true,
        },
      })
      jest.spyOn(routerLocation, 'useLocation').mockReturnValue({
        pathname: `/4.0/${tagType}/ApiAuth`,
        search: 't=invalid',
      } as unknown as Location)
      jest.spyOn(reactRedux, 'useDispatch').mockReturnValue(mockDispatch)
      const wrapper = ({ children }: any) => withReduxProvider(children, store)
      renderHook(() => useTagStoreSync(), { wrapper })
      expect(push).toHaveBeenCalledWith({
        pathname: `/4.0/${tagType}/ApiAuth`,
        search: '',
      })
    })
  })
})
