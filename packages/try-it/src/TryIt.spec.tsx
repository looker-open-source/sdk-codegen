import React from 'react'
import { renderWithTheme } from '@looker/components-test-utils'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserTransport } from '@looker/sdk/lib/browser'

import { TryIt } from './TryIt'
import { testTextResponse } from '../test-data'

describe('TryIt', () => {
  const inputs = [
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

  test('custom request provider overrides default', async () => {
    const customRequestCallback = jest.fn().mockResolvedValue(testTextResponse)
    renderWithTheme(
      <TryIt
        inputs={inputs}
        httpMethod={'POST'}
        endpoint={'/run_query/{result_format}'}
        requestCallback={customRequestCallback}
      />
    )
    userEvent.click(screen.getByRole('button', { name: 'Try It' }))
    expect(customRequestCallback).toHaveBeenCalled()
    userEvent.click(screen.getByRole('button', { name: 'Response' }))
    expect(
      await screen.findByText(testTextResponse.body.toString())
    ).toBeInTheDocument()
  })
})
