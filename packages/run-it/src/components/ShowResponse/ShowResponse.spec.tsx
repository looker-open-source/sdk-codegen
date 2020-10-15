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
import { render, screen } from '@testing-library/react'
import { renderWithTheme } from '@looker/components-test-utils'

import {
  testErrorResponse,
  testHtmlResponse,
  testImageResponse,
  testJsonResponse,
  testTextResponse,
  testUnknownResponse,
} from '../../test-data'
import { ShowResponse } from './ShowResponse'

describe('ShowResponse', () => {
  test('it renders json responses', () => {
    renderWithTheme(<ShowResponse response={testJsonResponse} />)
    expect(screen.getByText('200: application/json')).toBeInTheDocument()
    expect(screen.getByText('key1')).toBeInTheDocument()
  })

  test('it renders text responses', () => {
    renderWithTheme(<ShowResponse response={testTextResponse} />)
    expect(
      screen.getByText('200: text/plain;charset=utf-8')
    ).toBeInTheDocument()
    expect(
      screen.getByText(testTextResponse.body.toString())
    ).toBeInTheDocument()
  })

  test('it renders html responses', () => {
    render(<ShowResponse response={testHtmlResponse} />)
    expect(screen.getByText('200: text/html;charset=utf-8')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: '' })).toBeInTheDocument()
  })

  test('it renders png responses', () => {
    render(<ShowResponse response={testImageResponse()} />)
    expect(screen.getByText('200: image/png')).toBeInTheDocument()
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  test('it renders jpg responses', () => {
    render(<ShowResponse response={testImageResponse('image/jpeg')} />)
    expect(screen.getByText('200: image/jpeg')).toBeInTheDocument()
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  test('it renders svg responses', () => {
    render(<ShowResponse response={testImageResponse('image/svg+xml')} />)
    expect(screen.getByText('200: image/svg+xml')).toBeInTheDocument()
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  test.skip('it renders a message for unknown response types', () => {
    render(<ShowResponse response={testUnknownResponse} />)
    expect(
      screen.getByText(
        `Received ${testUnknownResponse.body.length} bytes of ${testUnknownResponse.contentType} data.`
      )
    ).toBeInTheDocument()
  })

  test('it renders an error for error responses', () => {
    renderWithTheme(<ShowResponse response={testErrorResponse} />)
    expect(
      screen.getByText(testErrorResponse.statusMessage, { exact: false })
    ).toBeInTheDocument()
    expect(
      screen.getByText(testErrorResponse.body.toString(), { exact: false })
    ).toBeInTheDocument()
  })
})
