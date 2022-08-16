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
import { screen } from '@testing-library/react'
import { Heading } from '@looker/components'
import React from 'react'
import type { ShowErrorDocEvent } from './APIErrorDisplay'
import { APIErrorDialog } from './APIErrorDialog'

describe('APIErrorDialog', () => {
  // TODO test closing the dialog
  it('shows simple errors', () => {
    const simple: LookerSDKError = {
      name: 'Error',
      message: 'simple error',
      documentation_url: 'https://docs.looker.com/r/err/4.0/404/post/login',
    }
    renderWithTheme(<APIErrorDialog error={simple} />)
    const heading = screen.getByRole('heading', { name: 'simple error' })
    expect(heading).toBeInTheDocument()
    const link = screen.getByRole('link')
    expect(link).toHaveTextContent(simple.documentation_url ?? '')
    expect(link).toHaveAttribute('href', simple.documentation_url)
    const table = screen.queryByRole('table')
    expect(table).not.toBeInTheDocument()
  })

  it('skips empty documentation url', () => {
    const simpler: LookerSDKError = {
      name: 'Error',
      message: 'simple error',
    }
    renderWithTheme(<APIErrorDialog error={simpler} />)
    const heading = screen.getByRole('heading', { name: 'simple error' })
    expect(heading).toBeInTheDocument()
    const link = screen.queryByRole('link')
    expect(link).not.toBeInTheDocument()
  })

  it('overrides showDoc', () => {
    const documentation_url = 'https://docs.looker.com/r/err/4.0/404/post/login'
    const simpler: LookerSDKError = {
      name: 'Error',
      message: 'spoof',
      documentation_url,
    }
    const spoof: ShowErrorDocEvent = (url?: string) => (
      <>
        <Heading type="h3">{`given: ${url}`}</Heading>
      </>
    )
    renderWithTheme(<APIErrorDialog error={simpler} showDoc={spoof} />)
    const heading = screen.getByRole('heading', { name: 'spoof' })
    expect(heading).toBeInTheDocument()
    const override = screen.getByRole('heading', {
      name: `given: ${documentation_url}`,
    })
    expect(override).toBeInTheDocument()
  })

  it('defaults an empty error message', () => {
    const simpler: LookerSDKError = {
      name: '',
      message: '',
    }
    renderWithTheme(<APIErrorDialog error={simpler} />)
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
    renderWithTheme(<APIErrorDialog error={detailed} />)
    const heading = screen.getByRole('heading', { name: 'detailed error' })
    expect(heading).toBeInTheDocument()
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(3)
    const table = screen.getByRole('table')
    expect(table).toBeInTheDocument()
    detailed.errors?.forEach((e) => {
      expect(table).toHaveTextContent(e.field!)
      expect(table).toHaveTextContent(e.message!)
      expect(table).toHaveTextContent(e.code!)
    })
  })
})
