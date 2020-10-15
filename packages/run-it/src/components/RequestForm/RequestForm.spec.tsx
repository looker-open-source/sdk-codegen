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
import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { defaultConfigurator } from '../ConfigForm'
import { RequestForm } from './RequestForm'

describe('RequestForm', () => {
  const run = 'Run'
  const requestContent = {}
  const setRequestContent = jest.fn()
  const handleSubmit = jest.fn((e) => e.preventDefault())

  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('it creates a form with a simple item, submit button, and config button', () => {
    renderWithTheme(
      <RequestForm
        configurator={defaultConfigurator}
        inputs={[
          {
            name: 'user_id',
            location: 'path',
            type: 'string',
            required: true,
            description: 'A unique identifier for a user',
          },
        ]}
        handleSubmit={handleSubmit}
        httpMethod={'GET'}
        requestContent={requestContent}
        setRequestContent={setRequestContent}
        isExtension={false}
      />
    )

    expect(
      screen.getByLabelText('user_id', { exact: false })
    ).toBeInTheDocument()
    /** Warning checkbox should only be rendered for operations that modify data */
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: run })).toBeInTheDocument()
    // TODO check the config gear exists
  })

  test('it creates a form with a simple item, submit button, and config button', () => {
    renderWithTheme(
      <RequestForm
        configurator={defaultConfigurator}
        inputs={[
          {
            name: 'user_id',
            location: 'path',
            type: 'string',
            required: true,
            description: 'A unique identifier for a user',
          },
        ]}
        handleSubmit={handleSubmit}
        httpMethod={'GET'}
        requestContent={requestContent}
        setRequestContent={setRequestContent}
        isExtension={true}
      />
    )

    expect(
      screen.getByLabelText('user_id', { exact: false })
    ).toBeInTheDocument()
    /** Warning checkbox should only be rendered for operations that modify data */
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: run })).toBeInTheDocument()
    // TODO check the config gear does NOT exist
  })

  test('interacting with a boolean simple item changes the request content', () => {
    renderWithTheme(
      <RequestForm
        configurator={defaultConfigurator}
        inputs={[
          {
            name: 'boolean_item',
            location: 'query',
            required: true,
            type: 'boolean',
            description: 'some boolean item description',
          },
        ]}
        handleSubmit={handleSubmit}
        httpMethod={'POST'}
        requestContent={requestContent}
        setRequestContent={setRequestContent}
      />
    )

    const item = screen.getByRole('switch', { name: 'boolean_item' })
    fireEvent.click(item)
    expect(setRequestContent).toHaveBeenCalledWith({ boolean_item: true })
  })

  test('interactive with a number simple item changes the request content', async () => {
    renderWithTheme(
      <RequestForm
        configurator={defaultConfigurator}
        inputs={[
          {
            name: 'number_item',
            location: 'query',
            required: false,
            type: 'integer',
            description: 'some number item description',
          },
        ]}
        handleSubmit={handleSubmit}
        httpMethod={'POST'}
        requestContent={requestContent}
        setRequestContent={setRequestContent}
      />
    )

    const item = screen.getByRole('spinbutton', { name: 'number_item' })
    await userEvent.paste(item, '123')
    await waitFor(() => {
      expect(setRequestContent).toHaveBeenCalledWith({ number_item: 123 })
    })
  })

  test('interacting with a text simple item changes the request content', async () => {
    renderWithTheme(
      <RequestForm
        configurator={defaultConfigurator}
        inputs={[
          {
            name: 'text_item',
            location: 'path',
            required: true,
            type: 'string',
            description: 'some text item description',
          },
        ]}
        handleSubmit={handleSubmit}
        httpMethod={'POST'}
        requestContent={requestContent}
        setRequestContent={setRequestContent}
      />
    )

    const item = screen.getByRole('textbox', { name: 'text_item' })
    await userEvent.paste(item, 'some text')
    await waitFor(() => {
      expect(setRequestContent).toHaveBeenCalledWith({
        text_item: 'some text',
      })
    })
  })

  test('interacting with a complex item changes the request content', () => {
    const handleSubmit = jest.fn((e) => e.preventDefault())
    renderWithTheme(
      <RequestForm
        configurator={defaultConfigurator}
        inputs={[
          {
            name: 'body',
            location: 'body',
            type: {
              model: 'string',
              view: 'string',
              fields: ['string'],
            },
            required: true,
            description: 'Request body',
          },
        ]}
        handleSubmit={handleSubmit}
        httpMethod={'POST'}
        requestContent={requestContent}
        setRequestContent={setRequestContent}
      />
    )

    expect(screen.getByRole('checkbox')).toBeInTheDocument()
    const input = screen.getByRole('textbox')
    // TODO: make complex items requirable. i.e. expect(input).toBeRequired() should pass
    userEvent.paste(input, 'content')
    expect(setRequestContent).toHaveBeenCalled()
    userEvent.click(screen.getByRole('button', { name: run }))
    expect(handleSubmit).toHaveBeenCalledTimes(1)
  })

  test('pressing enter submits the request form', async () => {
    const handleSubmit = jest.fn((e) => e.preventDefault())
    renderWithTheme(
      <RequestForm
        configurator={defaultConfigurator}
        inputs={[
          {
            name: 'id',
            location: 'path',
            type: 'string',
            required: true,
            description: 'Request body',
          },
        ]}
        handleSubmit={handleSubmit}
        httpMethod={'POST'}
        requestContent={requestContent}
        setRequestContent={setRequestContent}
      />
    )

    expect(screen.getByRole('textbox')).toBeInTheDocument()
    const input = screen.getByRole('textbox')
    await userEvent.paste(input, 'foo')
    await userEvent.type(input, '{enter}')
    await waitFor(() => {
      expect(setRequestContent).toHaveBeenLastCalledWith({
        id: 'foo',
      })
      expect(handleSubmit).toHaveBeenCalledTimes(1)
    })
  })
})
