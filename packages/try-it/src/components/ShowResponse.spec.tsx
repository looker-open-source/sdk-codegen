import React from 'react'
import { render, screen } from '@testing-library/react'

import {
  testErrorResponse,
  testHtmlResponse,
  testImageResponse,
  testJsonResponse,
  testTextResponse,
  testUnknownResponse,
} from '../test-data'
import { ShowResponse } from './ShowResponse'

test('it renders json responses', () => {
  render(<ShowResponse response={testJsonResponse} />)
  expect(screen.getByRole('textbox', { name: '' })).toBeInTheDocument()
})

test('it renders text responses', () => {
  render(<ShowResponse response={testTextResponse} />)
  expect(screen.getByText(testTextResponse.body.toString())).toBeInTheDocument()
})

test('it renders html responses', () => {
  render(<ShowResponse response={testHtmlResponse} />)
  expect(screen.getByRole('textbox', { name: '' })).toBeInTheDocument()
})

test('it renders image responses', () => {
  render(<ShowResponse response={testImageResponse()} />)
  expect(screen.getByRole('img')).toBeInTheDocument()
})

test('it renders unknown response types', () => {
  render(<ShowResponse response={testUnknownResponse} />)
  expect(
    screen.getByText(
      `Received ${testUnknownResponse.body.length} bytes of ${testUnknownResponse.contentType} data.`
    )
  ).toBeInTheDocument()
})

test('it renders an error for error responses', () => {
  render(<ShowResponse response={testErrorResponse} />)
  expect(
    screen.getByText(testErrorResponse.statusMessage, { exact: false })
  ).toBeInTheDocument()
  expect(
    screen.getByText(testErrorResponse.body.toString(), { exact: false })
  ).toBeInTheDocument()
})
