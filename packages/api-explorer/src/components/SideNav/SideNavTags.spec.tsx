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
import { screen, fireEvent } from '@testing-library/react'
import { pick } from 'lodash'

import { withThemeProvider } from '@looker/components-test-utils'
import { api } from '../../test-data'
import { renderWithSearchAndRouter } from '../../test-utils'
import { SideNavTags } from './SideNavTags'

const getExpanded = (tagButtons: HTMLElement[]) =>
  tagButtons.filter((button) => button.getAttribute('aria-expanded') === 'true')

describe('SideNavTags', () => {
  test('it renders a provided tag and its methods', () => {
    const tags = pick(api.tags, 'Dashboard')
    renderWithSearchAndRouter(
      withThemeProvider(<SideNavTags tags={tags} specKey={'3.1'} />)
    )

    const tagButton = screen.getByRole('button', { name: /dashboard/i })
    let isExpanded = tagButton.getAttribute('aria-expanded')
    expect(isExpanded).toEqual('false')
    expect(screen.queryAllByRole('link')).toHaveLength(0)

    fireEvent.click(tagButton)

    isExpanded = tagButton.getAttribute('aria-expanded')
    expect(isExpanded).toEqual('true')
    const methods = screen.getAllByRole('link')
    expect(methods).toHaveLength(Object.keys(tags.Dashboard).length)
  })

  test('tags are rendered collapsed initially and expand when clicked', () => {
    const tags = pick(api.tags, ['ApiAuth', 'Dashboard'])
    renderWithSearchAndRouter(
      withThemeProvider(<SideNavTags tags={tags} specKey={'3.1'} />)
    )

    const allTagButtons = screen.getAllByRole('button')
    expect(allTagButtons).toHaveLength(2)
    expect(getExpanded(allTagButtons)).toHaveLength(0)

    fireEvent.click(screen.getByRole('button', { name: /dashboard/i }))

    expect(getExpanded(screen.getAllByRole('button'))).toHaveLength(1)
  })

  test('tag is expanded if specified in route', () => {
    const tags = pick(api.tags, ['ApiAuth', 'Dashboard'])
    renderWithSearchAndRouter(
      withThemeProvider(<SideNavTags tags={tags} specKey={'3.1'} />),
      undefined,
      undefined,
      ['/3.1/methods/Dashboard']
    )

    const allTagButtons = screen.getAllByRole('button')
    expect(allTagButtons).toHaveLength(2)
    const expandedTags = getExpanded(allTagButtons)
    expect(expandedTags).toHaveLength(1)
    expect(expandedTags[0]).toHaveTextContent('Dashboard')
  })
})
