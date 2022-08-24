/*

 MIT License

 Copyright (c) 2022 Looker Data Sciences, Inc.

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

import type { LookerSDKError } from '@looker/sdk-rtl'
import { renderWithTheme } from '@looker/components-test-utils'
import { fireEvent, screen } from '@testing-library/react'
import React from 'react'
import { APIErrorDialog } from './APIErrorDialog'

describe('APIErrorDialog', () => {
  it('is hidden if open is false', () => {
    const simple: LookerSDKError = {
      name: 'Error',
      message: 'simple error',
      documentation_url: 'https://docs.looker.com/r/err/4.0/404/post/login',
    }
    renderWithTheme(
      <APIErrorDialog error={simple} isOpen={false} setOpen={jest.fn()} />
    )
    const heading = screen.queryByRole('heading', { name: 'simple error' })
    expect(heading).not.toBeInTheDocument()
    const link = screen.queryByRole('link')
    expect(link).not.toBeInTheDocument()
  })

  it('ok button click fires', async () => {
    const simple: LookerSDKError = {
      name: 'Error',
      message: 'simple error',
      documentation_url: 'https://docs.looker.com/r/err/4.0/404/post/login',
    }
    const toggle = jest.fn()
    renderWithTheme(
      <APIErrorDialog error={simple} isOpen={true} setOpen={toggle} />
    )
    const heading = screen.getByRole('heading', { name: 'simple error' })
    expect(heading).toBeInTheDocument()
    const link = screen.getByRole('link')
    expect(link).toBeInTheDocument()
    const okButton = screen.getByRole('button', { name: 'OK' })
    fireEvent.click(okButton)
    expect(toggle).toHaveBeenCalled()
  })

  it('shows simple errors', () => {
    const simple: LookerSDKError = {
      name: 'Error',
      message: 'simple error',
      documentation_url: 'https://docs.looker.com/r/err/4.0/404/post/login',
    }
    renderWithTheme(
      <APIErrorDialog error={simple} isOpen={true} setOpen={jest.fn()} />
    )
    const heading = screen.getByRole('heading', { name: 'simple error' })
    expect(heading).toBeInTheDocument()
    const link = screen.getByRole('link')
    // expect(link).toHaveTextContent(simple.documentation_url ?? '')
    expect(link).toHaveAttribute('href', simple.documentation_url)
    const table = screen.queryByRole('table')
    expect(table).not.toBeInTheDocument()
  })

  it('skips empty documentation url', () => {
    const simpler: LookerSDKError = {
      name: 'Error',
      message: 'simple error',
    }
    renderWithTheme(
      <APIErrorDialog error={simpler} isOpen={true} setOpen={jest.fn()} />
    )
    const heading = screen.getByRole('heading', { name: 'simple error' })
    expect(heading).toBeInTheDocument()
    const link = screen.queryByRole('link')
    expect(link).not.toBeInTheDocument()
  })

  it('defaults an empty error message', () => {
    const simpler: LookerSDKError = {
      name: '',
      message: '',
    }
    renderWithTheme(
      <APIErrorDialog error={simpler} isOpen={true} setOpen={jest.fn()} />
    )
    const heading = screen.getByRole('heading', { name: 'Unknown error' })
    expect(heading).toBeInTheDocument()
    const link = screen.queryByRole('link')
    expect(link).not.toBeInTheDocument()
  })

  it('shows detailed errors', () => {
    const documentation_url = 'https://docs.looker.com/r/err/4.0/404/post/login'
    const detailed: LookerSDKError = {
      name: 'Error',
      message: 'detailed error',
      documentation_url,
      errors: [
        {
          field: 'user.id',
          message: 'id is required',
          code: 'missing',
          documentation_url,
        },
        {
          field: 'user.state',
          message: 'bad state',
          code: 'invalid',
          documentation_url,
        },
      ],
    }
    renderWithTheme(
      <APIErrorDialog error={detailed} isOpen={true} setOpen={jest.fn()} />
    )
    const heading = screen.getByRole('heading', { name: 'detailed error' })
    expect(heading).toBeInTheDocument()
    const links = screen.getByRole('link')
    expect(links).toBeInTheDocument()
    const table = screen.getByRole('table')
    expect(table).toBeInTheDocument()
    detailed.errors?.forEach((e) => {
      expect(table).toHaveTextContent(e.field ?? '')
      expect(table).toHaveTextContent(e.message ?? '')
      expect(table).toHaveTextContent(e.code ?? '')
    })
  })
})
