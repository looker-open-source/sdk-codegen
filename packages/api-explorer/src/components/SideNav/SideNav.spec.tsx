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
import { ApiModel } from '@joeldodge/sdk-codegen'
import { pick } from 'lodash'
import userEvent from '@testing-library/user-event'
import { screen } from '@testing-library/react'

import { api } from '../../test-data'
import { renderWithRouter } from '../../test-utils'
import { SideNav } from './SideNav'

describe('SideNav', () => {
  const testApi = ({
    tags: pick(api.tags, ['Auth', 'ApiAuth']),
    types: pick(api.types, ['WriteDashboard', 'WriteQuery']),
  } as unknown) as ApiModel
  const allTagsPattern = /^(Auth|ApiAuth)$/
  const allTypesPattern = /^(WriteDashboard|WriteQuery)$/

  test('it renders all tabs', () => {
    renderWithRouter(<SideNav api={testApi} specKey={'3.1'} />)
    const tabs = screen.getAllByRole('tab', {
      name: /^Methods \(\d+\)|Types \(\d+\)$/,
    })
    expect(tabs).toHaveLength(2)
  })

  test('Methods tab is the default active tab', () => {
    renderWithRouter(<SideNav api={testApi} specKey={'3.1'} />)
    expect(screen.getAllByText(allTagsPattern)).toHaveLength(2)
    expect(
      screen.queryAllByRole('link', { name: allTypesPattern })
    ).toHaveLength(0) // eslint-disable-line jest-dom/prefer-in-document

    userEvent.click(screen.getByRole('tab', { name: /^Types \(\d+\)$/ }))

    // eslint-disable-next-line jest-dom/prefer-in-document
    expect(screen.queryAllByText(allTagsPattern)).toHaveLength(0)
    expect(screen.getAllByRole('link', { name: allTypesPattern })).toHaveLength(
      2
    )
  })

  test('url determines active tab', () => {
    renderWithRouter(<SideNav api={api} specKey={'3.1'} />, ['/3.1/types'])
    // eslint-disable-next-line jest-dom/prefer-in-document
    expect(screen.queryAllByText(allTagsPattern)).toHaveLength(0)
    expect(screen.getAllByRole('link', { name: allTypesPattern })).toHaveLength(
      2
    )
  })
})
