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
import { renderWithTheme } from '@looker/components-test-utils'
import { screen, fireEvent, waitFor } from '@testing-library/react'

import { api } from '../../test-data'
import { DocMethodSummary } from './DocMethodSummary'

describe('DocMethodSummary', () => {
  test('it renders a method summary', async () => {
    const method = api.methods.run_inline_query
    renderWithTheme(<DocMethodSummary method={method} />)
    expect(
      screen.getByText(method.httpMethod.toLocaleUpperCase())
    ).toBeInTheDocument()
    expect(screen.getByText(method.summary)).toBeInTheDocument()
    expect(screen.getByText(method.endpoint)).toBeInTheDocument()
    await waitFor(() => {
      const statusIcon = screen.getByLabelText('stable endpoint')
      fireEvent.mouseOver(statusIcon)
      expect(screen.getByRole('tooltip')).toHaveTextContent(
        'This endpoint is considered stable for this API version.'
      )
    })
    expect(screen.getByText('db_query')).toBeInTheDocument()
  })
})
