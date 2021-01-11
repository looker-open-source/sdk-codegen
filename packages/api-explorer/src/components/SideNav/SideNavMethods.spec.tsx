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
import { pick } from 'lodash'
import userEvent from '@testing-library/user-event'
import { screen } from '@testing-library/react'

import { api } from '../../test-data'
import { renderWithSearchAndRouter } from '../../test-utils'
import { SideNavMethods } from './SideNavMethods'

describe('SideNavMethods', () => {
  const tag = 'Dashboard'
  const methods = api.tags[tag]

  test('it renders provided methods', () => {
    renderWithSearchAndRouter(
      <SideNavMethods methods={methods} tag={tag} specKey={'3.1'} />
    )
    userEvent.click(screen.getByText(tag))
    const sideNavItems = screen.getAllByRole('link')
    expect(sideNavItems).toHaveLength(Object.keys(methods).length)
    expect(sideNavItems[0]).toHaveAttribute(
      'href',
      `/3.1/methods/${tag}/${Object.values(methods)[0].name}`
    )
  })

  test('it highlights text matching search pattern in both tag and methods', () => {
    const highlightPattern = 'dash'
    renderWithSearchAndRouter(
      <SideNavMethods
        methods={pick(methods, 'create_dashboard')}
        tag={tag}
        specKey={'3.1'}
      />,
      highlightPattern
    )
    userEvent.click(screen.getByText('Dash'))
    const matches = screen.getAllByText(/dash/i)
    expect(matches).toHaveLength(2)
    matches.forEach((match) => {
      expect(match).toContainHTML('<span class="hi">Dash</span>')
    })
  })
})
