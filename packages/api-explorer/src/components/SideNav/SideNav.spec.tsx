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
import { ApiModel } from '@looker/sdk-codegen'
import { pick } from 'lodash'
import { screen, fireEvent } from '@testing-library/react'
import { withThemeProvider } from '@looker/components-test-utils'

import { api } from '../../test-data'
import { renderWithRouter } from '../../test-utils'
import { SideNav } from './SideNav'

describe('SideNav', () => {
  const testApi = ({
    tags: pick(api.tags, ['Query', 'ApiAuth']),
    types: pick(api.types, ['WriteDashboard', 'WriteQuery']),
  } as unknown) as ApiModel

  test('it renders all tabs', () => {
    // TODO: this test will (and should) fail when search is moved into header.
    renderWithRouter(
      withThemeProvider(<SideNav api={testApi} specKey={'3.1'} />)
    )
    const tabs = screen.getAllByRole('button', {
      name: /^Methods|Types$/,
    })
    expect(tabs).toHaveLength(2)
  })

  test('Methods tab is the default active tab', () => {
    renderWithRouter(
      withThemeProvider(<SideNav api={testApi} specKey={'3.1'} />)
    )
    expect(
      screen.getAllByRole('button', { name: /^(ApiAuth|Query)$/ })
    ).toHaveLength(2)
    expect(
      screen.queryAllByRole('link', { name: /^(WriteQuery|WriteDashboard)$/ })
    ).toHaveLength(0)

    fireEvent.click(screen.getByRole('button', { name: /^Types$/ }))

    expect(
      screen.queryAllByRole('button', { name: /^(ApiAuth|Query)$/ })
    ).toHaveLength(0)
    expect(
      screen.getAllByRole('link', { name: /^(WriteDashboard|WriteQuery)$/ })
    ).toHaveLength(2)
  })

  test('url determines active tab', () => {
    renderWithRouter(withThemeProvider(<SideNav api={api} specKey={'3.1'} />), [
      '/3.1/types',
    ])
    expect(
      screen.queryAllByRole('button', { name: /^(ApiAuth|Query)$/ })
    ).toHaveLength(0)
    expect(
      screen.getAllByRole('link', { name: /^(WriteDashboard|WriteQuery)$/ })
    ).toHaveLength(2)
  })
})
