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
import { renderWithTheme } from '@looker/components-test-utils'
import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { RunItInput } from '../..'
import { runItNoSet } from '../..'
import { RequestForm } from './RequestForm'

describe('RequestForm', () => {
  const run = 'Run'
  let requestContent = {}
  const setRequestContent = jest.fn((content) => {
    requestContent = content
  })
  const handleSubmit = jest.fn((e) => e.preventDefault())

  beforeEach(() => {
    jest.resetAllMocks()
  })

  afterEach(() => {
    requestContent = {}
  })

  describe('validation messages', () => {
    test('validation errors are displayed', () => {
      const message = 'Invalid message'
      renderWithTheme(
        <RequestForm
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
          needsAuth={false}
          hasConfig={true}
          setHasConfig={() => true}
          isExtension={false}
          validationMessage={message}
          handleConfig={runItNoSet}
        />
      )

      expect(screen.getByRole('img', { name: 'Error' })).toBeInTheDocument()
      expect(screen.getByText(message)).toBeInTheDocument()
    })

    test.todo('clear removes validation messages')
    test.todo('clicking run with an invalid body shows a messagebar')
  })

  test('it creates a form with a simple item, submit button, and config button if not an extension', () => {
    renderWithTheme(
      <RequestForm
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
        needsAuth={false}
        hasConfig={true}
        setHasConfig={() => true}
        isExtension={false}
        handleConfig={runItNoSet}
      />
    )

    expect(
      screen.getByLabelText('user_id', { exact: false })
    ).toBeInTheDocument()
    /** Warning checkbox should only be rendered for operations that modify data */
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: run })).toBeInTheDocument()
  })

  test('it creates a form with a simple item, submit button, and config button if running as an extension', () => {
    renderWithTheme(
      <RequestForm
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
        needsAuth={false}
        hasConfig={true}
        handleConfig={runItNoSet}
      />
    )

    expect(
      screen.getByLabelText('user_id', { exact: false })
    ).toBeInTheDocument()
    /** Warning checkbox should only be rendered for operations that modify data */
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: run })).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Settings' })
    ).not.toBeInTheDocument()
  })

  test('interacting with a boolean simple item changes the request content', async () => {
    const name = 'boolean_item'
    renderWithTheme(
      <RequestForm
        inputs={[
          {
            name,
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
        needsAuth={false}
        hasConfig={true}
        handleConfig={runItNoSet}
      />
    )

    const item = screen.getByRole('switch', { name })
    await userEvent.click(item)
    await waitFor(() => {
      expect(setRequestContent).toHaveBeenLastCalledWith({ [name]: true })
    })
  })

  test('interacting with a date picker changes the request content', async () => {
    const name = 'date_item'
    requestContent = { [name]: new Date('Aug 30, 2022') }
    renderWithTheme(
      <RequestForm
        inputs={[
          {
            name,
            location: 'query',
            required: true,
            type: 'datetime',
            description: 'some datetime item description',
          },
        ]}
        handleSubmit={handleSubmit}
        httpMethod={'POST'}
        requestContent={requestContent}
        setRequestContent={setRequestContent}
        needsAuth={false}
        hasConfig={true}
        handleConfig={runItNoSet}
      />
    )

    const calendar = screen.getByText('Open calendar')
    await userEvent.click(calendar)

    const date = screen.getAllByText('15')[1]
    await userEvent.click(date)
    expect(setRequestContent).toHaveBeenLastCalledWith({
      [name]: new Date('Aug 15, 2022 00:00:00 AM'),
    })
  })

  test('interacting with a number simple item changes the request content', async () => {
    const name = 'number_item'
    renderWithTheme(
      <RequestForm
        inputs={[
          {
            name,
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
        needsAuth={false}
        hasConfig={true}
        handleConfig={runItNoSet}
      />
    )

    const item = screen.getByRole('spinbutton', { name })
    await userEvent.type(item, '3')
    await waitFor(() => {
      expect(setRequestContent).toHaveBeenCalledWith({ [name]: 3 })
    })
  })

  test('interacting with a text simple item changes the request content', async () => {
    renderWithTheme(
      <RequestForm
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
        needsAuth={false}
        hasConfig={true}
        handleConfig={runItNoSet}
      />
    )

    const item = screen.getByRole('textbox', { name: 'text_item' })
    await userEvent.click(item)
    await userEvent.paste(item, 'some text')
    await waitFor(() => {
      expect(setRequestContent).toHaveBeenCalledWith({
        text_item: 'some text',
      })
    })
  })

  test('interacting with a complex item changes the request content', async () => {
    const handleSubmit = jest.fn((e) => e.preventDefault())
    const inputs: RunItInput[] = [
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
    ]
    renderWithTheme(
      <RequestForm
        inputs={inputs}
        handleSubmit={handleSubmit}
        httpMethod={'POST'}
        requestContent={{ body: JSON.stringify(inputs[0].type) }}
        setRequestContent={setRequestContent}
        needsAuth={false}
        hasConfig={true}
        handleConfig={runItNoSet}
      />
    )
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
    const input = screen.getByRole('textbox')
    await act(async () => {
      // TODO: make complex items requirable. i.e. expect(input).toBeRequired() should pass
      await userEvent.click(input)
      await userEvent.paste(input, 'content')
      expect(setRequestContent).toHaveBeenCalled()
      // TODO get this working again
      // await userEvent.click(screen.getByRole('button', { name: run }))
      // expect(handleSubmit).toHaveBeenCalledTimes(1)
    })
  })

  test('pressing enter ALMOST submits the request form', async () => {
    const handleSubmit = jest.fn((e) => e.preventDefault())
    renderWithTheme(
      <RequestForm
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
        needsAuth={false}
        hasConfig={true}
        handleConfig={runItNoSet}
      />
    )

    expect(screen.getByRole('textbox')).toBeInTheDocument()
    const input = screen.getByRole('textbox')
    await userEvent.click(input)
    await userEvent.paste(input, 'foo')
    await userEvent.type(input, '{enter}')
    await waitFor(() => {
      expect(setRequestContent).toHaveBeenLastCalledWith({
        id: 'foo',
      })
      // TODO why isn't handleSubmit being called?
      // expect(handleSubmit).toHaveBeenCalledTimes(1)
    })
  })
})
