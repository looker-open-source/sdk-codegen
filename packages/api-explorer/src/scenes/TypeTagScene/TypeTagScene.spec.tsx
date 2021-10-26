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
import { TypeTagScene } from './TypeTagScene'

const opBtnNames = /ALL|SPECIFICATION|WRITE|REQUEST|ENUMERATED/

const path = '/:specKey/types/:typeTag'

describe('TypeTagScene', () => {
  Element.prototype.scrollTo = jest.fn()

  test('it renders type buttons and all methods for a given type tag', () => {
    renderWithRouterAndReduxProvider(
      <Route path={path}>
        <TypeTagScene api={api} />
      </Route>,
      ['/3.1/types/Dashboard']
    )
    expect(
      screen.getAllByRole('button', {
        name: opBtnNames,
      })
    ).toHaveLength(4)
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(
      Object.keys(api.typeTags.Dashboard).length
    )
    expect(screen.getByText('DashboardBase').closest('a')).toHaveAttribute(
      'href',
      '/3.1/types/Dashboard/DashboardBase'
    )
  })

  test('it only renders operation buttons for operations that exist under that tag', () => {
    renderWithRouterAndReduxProvider(
      <Route path={path}>
        <TypeTagScene api={api} />
      </Route>,
      ['/3.1/types/DataAction']
    )
    expect(
      screen.getAllByRole('button', {
        name: opBtnNames,
      })
    ).toHaveLength(2)
  })

  test('it filters methods by operation type', async () => {
    renderWithRouterAndReduxProvider(
      <Route path={path}>
        <TypeTagScene api={api} />
      </Route>,
      ['/3.1/types/Look']
    )
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(
      Object.keys(api.typeTags.Look).length
    )

    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(
      Object.keys(api.typeTags.Look).length
    )

    /** Filter by SPECIFICATION */
    userEvent.click(screen.getByRole('button', { name: 'SPECIFICATION' }))
    await waitFor(() => {
      expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(5)
    })
    /** Filter by REQUEST */
    userEvent.click(screen.getByRole('button', { name: 'REQUEST' }))
    await waitFor(() => {
      expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(2)
    })
  })
})
