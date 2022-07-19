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
import { Router } from 'react-router'
import type { MemoryHistory } from 'history'
import { createMemoryHistory } from 'history'
import { renderWithTheme } from '@looker/components-test-utils'
import { screen, fireEvent } from '@testing-library/react'
import { api } from '../../../test-data'
import { DiffMethodLink } from './DiffItem'

describe('DiffMethodLink', () => {
  const method = api.methods.create_dashboard
  const specKey = '4.0'
  let history: MemoryHistory

  beforeEach(() => {
    history = createMemoryHistory()
  })

  test('it renders method and navigates on click', () => {
    const pushSpy = jest.spyOn(history, 'push')
    renderWithTheme(
      <Router history={history}>
        <DiffMethodLink method={method} specKey={specKey} />
      </Router>
    )
    const link = screen.getByRole('link')
    expect(link).toHaveTextContent(`${method.name} for ${specKey}`)
    fireEvent.click(link)
    expect(pushSpy).toHaveBeenCalledWith({
      pathname: `/${specKey}/methods/${method.schema.tags[0]}/${method.name}`,
      search: '',
    })
  })

  test('it renders missing method and does not navigate on click', () => {
    renderWithTheme(
      <Router history={history}>
        <DiffMethodLink method={undefined} specKey={specKey} />
      </Router>
    )
    const s = `Missing in ${specKey}`
    expect(screen.getByText(s)).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
