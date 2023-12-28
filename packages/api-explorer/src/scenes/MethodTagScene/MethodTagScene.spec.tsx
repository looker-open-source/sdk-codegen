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
import { Route } from 'react-router-dom'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { api } from '../../test-data'
import { renderWithRouterAndReduxProvider } from '../../test-utils'
import { MethodTagScene } from './MethodTagScene'

const opBtnNames = /ALL|GET|POST|PUT|PATCH|DELETE/

const mockHistoryPush = jest.fn()
jest.mock('react-router-dom', () => {
  const ReactRouterDOM = jest.requireActual('react-router-dom')
  return {
    ...ReactRouterDOM,
    useHistory: () => ({
      push: mockHistoryPush,
      location: {
        pathname: '/4.0/methods/Look',
      },
    }),
  }
})

describe('MethodTagScene', () => {
  Element.prototype.scrollTo = jest.fn()

  test('it renders operation buttons and all methods for a given method tag', () => {
    renderWithRouterAndReduxProvider(
      <Route path="/:specKey/methods/:methodTag">
        <MethodTagScene api={api} />
      </Route>,
      ['/4.0/methods/ColorCollection']
    )
    expect(
      screen.getAllByRole('button', {
        name: opBtnNames,
      })
    ).toHaveLength(6)
    expect(screen.getAllByText(/^\/color_collections.*/)).toHaveLength(
      Object.keys(api.tags.ColorCollection).length
    )
    expect(
      screen.getByText('/color_collections/standard').closest('a')
    ).toHaveAttribute(
      'href',
      '/4.0/methods/ColorCollection/color_collections_standard'
    )
  })

  test('it only renders operation buttons for operations that exist under that tag', () => {
    /** ApiAuth contains two POST methods and a DELETE method */
    renderWithRouterAndReduxProvider(
      <Route path="/:specKey/methods/:methodTag">
        <MethodTagScene api={api} />
      </Route>,
      ['/4.0/methods/ApiAuth']
    )
    expect(
      screen.getAllByRole('button', {
        name: opBtnNames,
      })
    ).toHaveLength(3)
  })

  test('it pushes filter to URL on toggle', async () => {
    const site = '/4.0/methods/Look'
    renderWithRouterAndReduxProvider(
      <Route path="/:specKey/methods/:methodTag">
        <MethodTagScene api={api} />
      </Route>,
      [site]
    )
    /** Filter by GET operation */
    await userEvent.click(screen.getByRole('button', { name: 'GET' }))
    await waitFor(() => {
      expect(mockHistoryPush).toHaveBeenCalledWith({
        pathname: site,
        search: 't=get',
      })
    })
    /** Filter by DELETE operation */
    await userEvent.click(screen.getByRole('button', { name: 'DELETE' }))
    await waitFor(() => {
      // eslint-disable-next-line jest-dom/prefer-in-document
      expect(mockHistoryPush).toHaveBeenCalledWith({
        pathname: site,
        search: 't=delete',
      })
    })
  })
})
