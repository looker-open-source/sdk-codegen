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
import { screen } from '@testing-library/react'

import { api } from '../../test-data'
import { renderWithSearchAndRouter } from '../../test-utils'
import { SideNavTypes } from './SideNavTypes'

describe('SideNavTypes', () => {
  test('it renders provided types', () => {
    renderWithSearchAndRouter(
      <SideNavTypes
        specKey={'3.1'}
        types={{
          Dashboard: api.types.Dashboard,
        }}
      />
    )
    const dashboardType = screen.getByRole('link')
    expect(dashboardType).toHaveAttribute('href', '/3.1/types/Dashboard')
  })

  test('it highlights text matching search pattern', () => {
    renderWithSearchAndRouter(
      <SideNavTypes
        specKey={'3.1'}
        types={{
          Dashboard: api.types.Dashboard,
        }}
      />,
      'dash'
    )
    const match = screen.getByText(/dash/i)
    expect(match).toContainHTML('<span class="hi">Dash</span>')
  })
})
