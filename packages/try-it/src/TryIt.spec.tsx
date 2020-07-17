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
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserTransport } from '@looker/sdk/lib/browser'

import { TryIt, TryItInput } from './TryIt'
import { testTextResponse } from './test-data'

describe('TryIt', () => {
  const inputs: TryItInput[] = [
    {
      name: 'result_format',
      location: 'path',
      type: 'string',
      required: true,
      description: 'Format of result',
    },
    {
      name: 'limit',
      location: 'query',
      type: 'integer',
      required: true,
      description: 'Row limit',
    },
    {
      name: 'cache',
      location: 'query',
      type: 'boolean',
      required: false,
      description: 'Get results from cache if available',
    },
    {
      name: 'body',
      location: 'body',
      type: {
        model: 'string',
        view: 'string',
        fields: ['string'],
        limit: 'string',
      },
      description: 'body',
      required: true,
    },
  ]

  test('it renders endpoint, request and response tabs, and form inputs', () => {
    renderWithTheme(
      <TryIt
        specKey={'3.1'}
        inputs={inputs}
        httpMethod={'POST'}
        endpoint={'/run_query/{result_format}'}
      />
    )
    expect(screen.getByRole('heading')).toHaveTextContent(
      'POST /run_query/{result_format}'
    )
    expect(screen.getByRole('button', { name: 'Request' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Response' })).toBeInTheDocument()
    expect(
      screen.getByRole('textbox', { name: 'result_format' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('spinbutton', { name: 'limit' })
    ).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: 'cache' })).toBeInTheDocument()
    expect(screen.getByText('body')).toBeInTheDocument()
  })

  test('the form submit handler invokes the request callback on submit', async () => {
    const defaultRequestCallback = jest
      .spyOn(BrowserTransport.prototype, 'rawRequest')
      .mockResolvedValueOnce(testTextResponse)
    renderWithTheme(
      <TryIt
        specKey={'3.1'}
        inputs={inputs}
        httpMethod={'POST'}
        endpoint={'/run_query/{result_format}'}
      />
    )
    userEvent.click(screen.getByRole('button', { name: 'Try It' }))
    expect(defaultRequestCallback).toHaveBeenCalled()
    userEvent.click(screen.getByRole('button', { name: 'Response' }))
    expect(
      await screen.findByText(testTextResponse.body.toString())
    ).toBeInTheDocument()
  })

  test('custom try it request callback overrides default', async () => {
    const customTryItCallback = jest.fn().mockResolvedValue(testTextResponse)
    renderWithTheme(
      <TryIt
        specKey={'3.1'}
        inputs={inputs}
        httpMethod={'POST'}
        endpoint={'/run_query/{result_format}'}
        tryItCallback={customTryItCallback}
      />
    )
    userEvent.click(screen.getByRole('button', { name: 'Try It' }))
    expect(customTryItCallback).toHaveBeenCalled()
    userEvent.click(screen.getByRole('button', { name: 'Response' }))
    expect(
      await screen.findByText(testTextResponse.body.toString())
    ).toBeInTheDocument()
  })
})
