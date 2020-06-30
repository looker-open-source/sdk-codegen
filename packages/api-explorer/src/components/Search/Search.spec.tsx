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
import { screen, waitFor, fireEvent } from '@testing-library/react'
import { withThemeProvider } from '@looker/components-test-utils'
import userEvent from '@testing-library/user-event'

import { renderWithSearch } from '../../test-utils'
import { api } from '../../test-data'
import { defaultSearchState } from '../../reducers'
import { Search } from './Search'

describe('Search', () => {
  test('it renders', () => {
    renderWithSearch(withThemeProvider(<Search api={api} specKey={'3.1'} />))
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveProperty(
      'placeholder',
      `Searching in ${defaultSearchState.criteria.join(', ')}.`
    )
  })

  test('pressing forward slash focuses search input', () => {
    renderWithSearch(withThemeProvider(<Search api={api} specKey={'3.1'} />))
    const input = screen.getByRole('textbox')
    input.blur()
    expect(input).not.toHaveFocus()
    fireEvent.keyPress(document, { key: '/', code: 'Slash' })
    waitFor(() => {
      expect(input).not.toHaveFocus()
    })
    expect(input).toHaveValue('')
  })

  test('search can be cleared', () => {
    renderWithSearch(withThemeProvider(<Search api={api} specKey={'3.1'} />))
    const input = screen.getByRole('textbox')
    userEvent.type(input, 'some search pattern')
    expect(input).toHaveValue('some search pattern')
    userEvent.click(screen.getByRole('button', { name: 'Clear Field' }))
    expect(input).toHaveValue('')
  })

  test('it shows results for valid search strings', () => {
    renderWithSearch(withThemeProvider(<Search api={api} specKey={'3.1'} />))
    const input = screen.getByRole('textbox')
    userEvent.type(input, 'writedashboard')
    waitFor(() => {
      //
    })
  })
})
