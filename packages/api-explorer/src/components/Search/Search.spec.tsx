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
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchCriterion } from '@looker/sdk-codegen'

import { renderWithSearch, renderWithSearchAndRouter } from '../../test-utils'
import { api } from '../../test-data'
import { Search } from './Search'

describe('Search', () => {
  test('it renders a search bar with criteria as placeholder text', () => {
    renderWithSearch(<Search api={api} specKey={'3.1'} />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveProperty(
      'placeholder',
      `Press '/' to start searching.`
    )
  })

  test('search can be cleared', () => {
    renderWithSearch(<Search api={api} specKey={'3.1'} />)
    const input = screen.getByRole('textbox')
    userEvent.type(input, 'some search pattern')
    expect(input).toHaveValue('some search pattern')
    userEvent.click(screen.getByRole('button', { name: 'Clear Field' }))
    expect(input).toHaveValue('')
  })

  test('it shows results for a valid search pattern', async () => {
    renderWithSearchAndRouter(<Search api={api} specKey={'3.1'} />)
    const input = screen.getByRole('textbox')
    userEvent.type(input, 'Dashboard')
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })
    const method = screen.getByText('Get All Dashboards', { exact: false })
    expect(method.closest('a')).toHaveAttribute(
      'href',
      '/3.1/methods/Dashboard/all_dashboards'
    )
    const type = screen.getByText('WriteDashboardBase', { exact: false })
    expect(type.closest('a')).toHaveAttribute(
      'href',
      '/3.1/types/WriteDashboardBase'
    )
  })

  test('it renders an error for an invalid search pattern', async () => {
    renderWithSearchAndRouter(<Search api={api} specKey={'3.1'} />)
    const input = screen.getByRole('textbox')
    await userEvent.type(input, '[')
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })
    expect(
      screen.getByText(
        'Error: Invalid search expression SyntaxError: Invalid regular expression: /[/: Unterminated character class'
      )
    ).toBeInTheDocument()
    userEvent.clear(input)
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })
  })

  test('search is disabled if no search criteria are selected', () => {
    renderWithSearchAndRouter(<Search api={api} specKey={'3.1'} />, '', [])
    const search = screen.getByRole('textbox')
    expect(search).toBeDisabled()
    expect(search).toHaveProperty(
      'placeholder',
      `Press '/' to start searching.`
    )
  })

  test.skip('search settings show all criteria', async () => {
    renderWithSearchAndRouter(<Search api={api} specKey={'3.1'} />)
    userEvent.click(screen.getByTitle('Filter'))
    await waitFor(() => {
      const criteria = screen.getAllByRole('checkbox')
      /** This will change when we fuse some of the search criteria */
      expect(criteria).toHaveLength(Object.keys(SearchCriterion).length / 2)
    })
  })
})
