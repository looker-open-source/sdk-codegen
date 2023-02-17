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
import { screen, waitFor } from '@testing-library/react'
import React from 'react'
import { renderWithTheme } from '@looker/components-test-utils'

import { registerTestEnvAdaptor, unregisterEnvAdaptor } from '../adaptorUtils'
import { APIErrorDisplay } from './APIErrorDisplay'

const sampleIndex = {
  '404': {
    url: '404.md',
  },
  '404/post/login': {
    url: 'login_404.md',
  },
}

const badLoginMd = `## API Response 404 for \`login\`

## Description

A 404 Error response from the /login endpoint most often means that an attempt to login at a valid Looker URL was made but the combination of client_id and client_secret provided do not match an existing valid credential on that instance.

See [HTTP 404 - Not Found](https://docs.looker.com/r/reference/looker-http-codes/404) for general information about this HTTP response from Looker.`

describe('APIErrorDisplay', () => {
  it('shows simple errors', () => {
    const simple: LookerSDKError = {
      name: 'Error',
      message: 'simple error',
      documentation_url: 'https://docs.looker.com/r/err/4.0/404/post/login',
    }
    renderWithTheme(<APIErrorDisplay error={simple} />)
    const heading = screen.getByRole('heading', { name: 'simple error' })
    expect(heading).toBeInTheDocument()
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', simple.documentation_url)
    const table = screen.queryByRole('table')
    expect(table).not.toBeInTheDocument()
  })

  it('fetches error doc', async () => {
    const mockResponse = async (val: string): Promise<Response> => {
      const resp: Response = {
        bodyUsed: false,
        ok: true,
        redirected: false,
        statusText: '',
        url: '',
        text(): Promise<string> {
          return Promise.resolve(val)
        },
        status: 200,
        headers: {} as Headers,
        type: 'basic',
        clone: function (): Response {
          throw new Error('Function not implemented.')
        },
        body: null,
        arrayBuffer: function (): Promise<ArrayBuffer> {
          throw new Error('Function not implemented.')
        },
        blob: function (): Promise<Blob> {
          throw new Error('Function not implemented.')
        },
        formData: function (): Promise<FormData> {
          throw new Error('Function not implemented.')
        },
        json: function (): Promise<any> {
          throw new Error('Function not implemented.')
        },
      } as unknown as Response
      return Promise.resolve(resp)
    }
    const fetcher = global.fetch
    global.fetch = jest.fn((input: RequestInfo | URL, _init?: RequestInit) => {
      const url = input.toString()
      let result = 'I dunno'
      if (url.endsWith('index.json')) {
        result = JSON.stringify(sampleIndex)
      }
      if (url.endsWith('login_404.md')) {
        result = badLoginMd
      }
      return mockResponse(result)
    })

    const simple: LookerSDKError = {
      name: 'Error',
      message: 'simple error',
      documentation_url: 'https://docs.looker.com/r/err/4.0/404/post/login',
    }
    registerTestEnvAdaptor()
    renderWithTheme(<APIErrorDisplay error={simple} showDoc={true} />)
    const heading = screen.getByRole('heading', { name: 'simple error' })
    expect(heading).toBeInTheDocument()
    await waitFor(() => {
      const md = screen.getByRole('heading', { name: 'Description' })
      expect(md).toBeInTheDocument()
    })
    global.fetch = fetcher
    unregisterEnvAdaptor()
  })

  it('skips empty documentation url', () => {
    const simpler: LookerSDKError = {
      name: 'Error',
      message: 'simple error',
    }
    renderWithTheme(<APIErrorDisplay error={simpler} />)
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
    renderWithTheme(<APIErrorDisplay error={simpler} />)
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
    renderWithTheme(<APIErrorDisplay error={detailed} />)
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
