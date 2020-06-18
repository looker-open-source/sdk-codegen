import React from 'react'
import { renderWithTheme } from '@looker/components-test-utils'
import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { RequestForm } from './RequestForm'

describe('RequestForm', () => {
  const handleSubmit = jest.fn((e) => e.preventDefault())
  const requestContent = {}
  const setRequestContent = jest.fn()

  afterEach(() => {
    handleSubmit.mockClear()
    setRequestContent.mockClear()
  })

  test('it creates a form with a simple item and a submit button', () => {
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
      />
    )

    expect(
      screen.getByLabelText('user_id', { exact: false })
    ).toBeInTheDocument()
    /** Warning checkbox should only be rendered for operations that modify data */
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Try It' })).toBeInTheDocument()
  })

  test('interacting with a boolean simple item changes the request content', () => {
    renderWithTheme(
      <RequestForm
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

  test('interactive with a number simple item changes the request content', () => {
    renderWithTheme(
      <RequestForm
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
    userEvent.type(item, '123')
    expect(setRequestContent).toHaveBeenCalledWith({ number_item: 123 })
  })

  test('interacting with a text simple item changes the request content', () => {
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
      />
    )

    const item = screen.getByRole('textbox', { name: 'text_item' })
    userEvent.type(item, 'some text')
    expect(setRequestContent).toHaveBeenCalledWith({
      text_item: 'some text',
    })
  })

  test('interacting with a complex item changes the request content', () => {
    renderWithTheme(
      <RequestForm
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
    userEvent.type(input, 'content')
    expect(setRequestContent).toHaveBeenCalled()
    userEvent.click(screen.getByRole('button', { name: 'Try It' }))
    expect(handleSubmit).toHaveBeenCalledTimes(1)
  })
})
