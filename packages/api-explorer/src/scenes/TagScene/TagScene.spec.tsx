/*

 MIT License

 Copyright (c) 2020 Looker Data Sciences, Inc.

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
import { renderWithRouter } from '../../test-utils'
import { TagScene } from './TagScene'

const opBtnNames = /ALL|GET|POST|PUT|PATCH|DELETE/

describe('TagScene', () => {
  test('it renders operation buttons and all methods for a given method tag', () => {
    renderWithRouter(
      <Route path="/:specKey/methods/:methodTag">
        <TagScene api={api} />
      </Route>,
      ['/3.1/methods/ColorCollection']
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
      '/3.1/methods/ColorCollection/color_collections_standard'
    )
  })

  test('it only renders operation buttons for operations that exist under that tag', () => {
    /** ApiAuth contains two POST methods and a DELETE method */
    renderWithRouter(
      <Route path="/:specKey/methods/:methodTag">
        <TagScene api={api} />
      </Route>,
      ['/3.1/methods/ApiAuth']
    )
    expect(
      screen.getAllByRole('button', {
        name: opBtnNames,
      })
    ).toHaveLength(3)
  })

  test('it filters methods by operation type', async () => {
    renderWithRouter(
      <Route path="/:specKey/methods/:methodTag">
        <TagScene api={api} />
      </Route>,
      ['/3.1/methods/Look']
    )
    const allLookMethods = /^\/look.*/
    expect(screen.getAllByText(allLookMethods)).toHaveLength(7)
    /** Filter by GET operation */
    userEvent.click(screen.getByRole('button', { name: 'GET' }))
    await waitFor(() => {
      expect(screen.getAllByText(allLookMethods)).toHaveLength(4)
    })
    /** Filter by DELETE operation */
    userEvent.click(screen.getByRole('button', { name: 'DELETE' }))
    await waitFor(() => {
      expect(screen.getAllByText(allLookMethods)).toHaveLength(1)
    })
    /** Restore original state */
    userEvent.click(screen.getByRole('button', { name: 'ALL' }))
    await waitFor(() => {
      expect(screen.getAllByText(allLookMethods)).toHaveLength(7)
    })
  })
})
