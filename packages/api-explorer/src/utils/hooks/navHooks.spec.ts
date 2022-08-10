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
import { useHistory } from 'react-router-dom'
import { useNavigation } from './navHooks'

const mockHistoryPush = jest.fn()
jest.mock('react-router-dom', () => {
  const ReactRouterDOM = jest.requireActual('react-router-dom')
  return {
    ...ReactRouterDOM,
    useHistory: () => ({
      push: mockHistoryPush,
      location: { pathname: '/3.1/methods', search: 's=test' },
    }),
  }
})

describe('Navigate', () => {
  const history = useHistory()
  const navigate = useNavigation()
  const curParams = new URLSearchParams(history.location.search) // 's=test'
  const route = `/3.1`

  test('preserves existing query params when given params are undefined', () => {
    navigate(route)
    expect(curParams.get('s')).toBe('test')
    expect(mockHistoryPush).lastCalledWith({
      pathname: route,
      search: curParams.toString(),
    })
  })

  test('clears existing params when given params are null', () => {
    navigate(route, null)
    expect(mockHistoryPush).lastCalledWith({
      pathname: route,
    })
  })

  test('null query params are removed', () => {
    navigate(route, { s: null, sdk: 'test' })
    expect(mockHistoryPush).lastCalledWith({
      pathname: route,
      search: 'sdk=test',
    })
  })

  test('sets query parameters when given a populated query params object', () => {
    const newParams = new URLSearchParams()
    newParams.set('s', 'test')
    newParams.set('sdk', 'kt')
    navigate(route, { s: newParams.get('s'), sdk: newParams.get('sdk') })
    expect(mockHistoryPush).lastCalledWith({
      pathname: route,
      search: newParams.toString(),
    })
  })

  test('appends parameters when object is passed in with existing parameters', () => {
    const newParams = new URLSearchParams()
    newParams.set('sdk', 'kt')
    navigate(route, { sdk: newParams.get('sdk') })
    expect(mockHistoryPush).lastCalledWith({
      pathname: route,
      search: curParams.toString() + '&' + newParams.toString(),
    })
  })
})
