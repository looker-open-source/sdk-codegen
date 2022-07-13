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
import { navigate } from './navUtils'

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

describe('Navigate', () => {
  let saveLocation: Location

  beforeEach(() => {
    saveLocation = window.location
    window.location = {
      ...window.location,
      pathname: '/3.1',
    }
  })

  afterEach(() => {
    window.location = saveLocation
  })
  /**
   * TODO: add more robust tests for different use cases
   */
  const history = useHistory()
  const curParams = new URLSearchParams(history.location.search)
  const route = `/3.1`
  test('if params passed in is undefined, maintain existing params in URL', () => {
    navigate(route, history, undefined)
    expect(mockHistoryPush).lastCalledWith({
      pathname: route,
      search: curParams.toString(),
    })
    // TODO: check URL that it changed
  })

  test('if params passed in is null or empty, remove all params from URL', () => {
    navigate(route, history, null)
    expect(mockHistoryPush).lastCalledWith({
      pathname: route,
    })
  })

  test('if we have new parameters passed in, push to URL', () => {
    const newParams = '?s=embedsso'
    navigate(route, history, { search: newParams })
    expect(mockHistoryPush).lastCalledWith({
      pathname: route,
      search: newParams,
    })
  })
})
