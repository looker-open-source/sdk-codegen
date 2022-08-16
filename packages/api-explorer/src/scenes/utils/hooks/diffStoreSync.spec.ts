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
import { useDiffStoreSync } from './diffStoreSync'

jest.mock('react-router', () => {
  const ReactRouter = jest.requireActual('react-router')
  return {
    ...ReactRouter,
    useHistory: jest.fn().mockReturnValue({ push: jest.fn(), location }),
    useLocation: jest.fn().mockReturnValue({ pathname: '/', search: '' }),
  }
})

describe('useDiffStoreSync', () => {
  const mockDispatch = jest.fn()

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('does nothing if uninitialized', () => {
    const { push } = useHistory()
    const wrapper = ({ children }: any) => withReduxProvider(children)
    renderHook(() => useDiffStoreSync(), { wrapper })
    expect(push).not.toHaveBeenCalled()
  })

  describe('diff scene options parameter', () => {
    test('overrides store diff options given valid url diff options param', () => {
      const { push } = useHistory()
      const store = createTestStore({
        settings: {
          initialized: true,
        },
      })
      const testOptions = ['missing', 'params', 'type']
      jest.spyOn(routerLocation, 'useLocation').mockReturnValue({
        pathname: `/`,
        search: `opts=${testOptions.join(',')}`,
      } as unknown as Location)
      jest.spyOn(reactRedux, 'useDispatch').mockReturnValue(mockDispatch)
      const wrapper = ({ children }: any) => withReduxProvider(children, store)
      renderHook(() => useDiffStoreSync(), { wrapper })
      expect(push).toHaveBeenCalledWith({
        pathname: '/',
        search: 'opts=missing%2Cparams%2Ctype',
      })
      expect(mockDispatch).toHaveBeenLastCalledWith({
        payload: { diffOptions: testOptions },
        type: 'settings/setDiffOptionsAction',
      })
    })

    test('updates url with store diff options given invalid url diff options param', () => {
      const { push } = useHistory()
      const store = createTestStore({
        settings: {
          initialized: true,
        },
      })
      jest.spyOn(routerLocation, 'useLocation').mockReturnValue({
        pathname: '/',
        search: 'opts=invalid',
      } as unknown as Location)
      jest.spyOn(reactRedux, 'useDispatch').mockReturnValue(mockDispatch)
      const wrapper = ({ children }: any) => withReduxProvider(children, store)
      renderHook(() => useDiffStoreSync(), { wrapper })
      expect(push).toHaveBeenCalledWith({
        pathname: `/`,
        search: 'opts=missing%2Cparams%2Ctype%2Cbody%2Cresponse',
      })
    })

    test('filters invalid options out of from url options parameter if present', () => {
      const { push } = useHistory()
      const store = createTestStore({
        settings: {
          initialized: true,
        },
      })
      const testOptions = ['missing', 'INVALID_OPTION', 'type']
      jest.spyOn(routerLocation, 'useLocation').mockReturnValue({
        pathname: `/`,
        search: `opts=${testOptions.join(',')}`,
      } as unknown as Location)
      jest.spyOn(reactRedux, 'useDispatch').mockReturnValue(mockDispatch)
      const wrapper = ({ children }: any) => withReduxProvider(children, store)
      renderHook(() => useDiffStoreSync(), { wrapper })
      const expectedOptions = ['missing', 'type']
      expect(mockDispatch).toHaveBeenLastCalledWith({
        payload: { diffOptions: expectedOptions },
        type: 'settings/setDiffOptionsAction',
      })
      expect(push).toHaveBeenCalledWith({
        pathname: `/`,
        search: 'opts=missing%2Ctype',
      })
    })
  })
})
