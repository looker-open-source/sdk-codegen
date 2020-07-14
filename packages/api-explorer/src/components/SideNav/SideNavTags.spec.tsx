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
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { withThemeProvider } from '@looker/components-test-utils'

import { api } from '../../test-data'
import { renderWithSearchAndRouter } from '../../test-utils'
import { SideNavTags } from './SideNavTags'

describe('SideNavTags', () => {
  const tags = pick(api.tags, ['ApiAuth', 'Dashboard'])
  test('it renders a provided tag and its methods', () => {
    renderWithSearchAndRouter(
      withThemeProvider(<SideNavTags tags={tags} specKey={'3.1'} />)
    )
    const tag = screen.getByText('Dashboard')
    const tagContent = 'Create Dashboard'
    expect(screen.queryByText(tagContent)).not.toBeInTheDocument()
    userEvent.click(tag)
    expect(screen.getByText(tagContent)).toBeInTheDocument()
    const methods = screen.getAllByRole('link')
    expect(methods).toHaveLength(Object.keys(tags.Dashboard).length)
  })

  test('tags are rendered initially collapsed and expand when clicked', () => {
    renderWithSearchAndRouter(
      withThemeProvider(<SideNavTags tags={tags} specKey={'3.1'} />)
    )

    const allTags = screen.getAllByText(/ApiAuth|Dashboard/)
    expect(allTags).toHaveLength(2)
    expect(screen.queryByText('Login')).not.toBeInTheDocument()
    expect(screen.queryByText('Create Dashboard')).not.toBeInTheDocument()
    userEvent.click(allTags[0])
    expect(screen.getByText('Login')).toBeInTheDocument()
    expect(screen.queryByText('Create Dashboard')).not.toBeInTheDocument()
  })

  test('tag is expanded if specified in route', () => {
    renderWithSearchAndRouter(
      withThemeProvider(<SideNavTags tags={tags} specKey={'3.1'} />),
      undefined,
      undefined,
      ['/3.1/methods/Dashboard']
    )

    const allTags = screen.getAllByText(/^(ApiAuth|Dashboard)$/)
    expect(allTags).toHaveLength(2)
    expect(screen.queryByText('Login')).not.toBeInTheDocument()
    expect(screen.getAllByRole('link')).toHaveLength(
      Object.keys(tags.Dashboard).length
    )
  })
})
