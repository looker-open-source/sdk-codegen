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
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  registerTestEnvAdaptor,
  unregisterEnvAdaptor,
} from '@looker/extension-utils'

import { api } from '../../../../test-data'
import { renderWithRouter } from '../../../../test-utils'
import { DocResponses } from './DocResponses'
import { buildResponseTree } from './utils'

describe('DocResponses', () => {
  beforeAll(() => {
    registerTestEnvAdaptor()
  })

  afterAll(() => {
    unregisterEnvAdaptor()
  })

  test('it renders all response statuses and their types', async () => {
    const responses = api.methods.run_look.responses
    renderWithRouter(<DocResponses api={api} method={api.methods.run_look} />)

    expect(screen.getByText('Response Models')).toBeInTheDocument()

    const responseTree = buildResponseTree(responses)
    const expectedRespStatuses = Object.keys(responseTree)
    expect(
      screen.getAllByRole('tab', {
        name: new RegExp(`${expectedRespStatuses.join('|')}`),
      })
    ).toHaveLength(expectedRespStatuses.length)

    userEvent.click(screen.getByRole('tab', { name: '200: Look' }))
    const successRespTypes = Object.keys(responseTree['200: Look'])
    await waitFor(() => {
      expect(
        screen.getAllByRole('button', {
          name: new RegExp(`${successRespTypes.join('|')}`),
        })
      ).toHaveLength(successRespTypes.length)
    })
  })

  test('selects tab corresponding to error code query param if present', async () => {
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
      }
      return Promise.resolve(resp)
    }
    const fetcher = global.fetch
    global.fetch = jest.fn((input: RequestInfo, _init?: RequestInit) => {
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

    renderWithRouter(
      <DocResponses api={api} method={api.methods.login} errorCode="404" />
    )
    expect(screen.getByText('Response Models')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /^404: \w+/ })).toHaveAttribute(
        'aria-selected',
        'true'
      )
      expect(
        screen.getByRole('heading', { name: 'Description' })
      ).toBeInTheDocument()
    })

    global.fetch = fetcher
  })
})
