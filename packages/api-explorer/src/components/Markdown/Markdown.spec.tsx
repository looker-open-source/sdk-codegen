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
import { screen } from '@testing-library/react'
import { renderWithTheme } from '@looker/components-test-utils'

import { renderWithSearch } from '../../test-utils'
import { Markdown } from './Markdown'

describe('Markdown', () => {
  test('it renders markdown', () => {
    renderWithSearch(
      <Markdown
        source={
          '# Markdown Component \n Renders markdown using [ReactMarkdown](https://github.com/rexxars/react-markdown)'
        }
      />
    )
    const heading = screen.getByRole('heading')
    expect(heading).toHaveTextContent('Markdown Component')
    const link = screen.getByRole('link')
    expect(link).toHaveTextContent('ReactMarkdown')
    expect(link).toHaveAttribute(
      'href',
      'https://github.com/rexxars/react-markdown'
    )
  })

  test('it renders path links', () => {
    const input =
      'A link to the [create_dashboard](/3.1/methods/Dashboard/create_dashboard) endpoint'
    renderWithTheme(<Markdown source={input} />)
    expect(screen.getByText(/A link to the/)).toBeInTheDocument()
    expect(screen.getByText('create_dashboard')).toHaveAttribute(
      'href',
      '/3.1/methods/Dashboard/create_dashboard'
    )
  })

  test('it renders url links', () => {
    renderWithSearch(
      <Markdown source={'[external_link](https://www.foo.com)'} />
    )
    expect(screen.getByText('external_link')).toHaveAttribute(
      'href',
      'https://www.foo.com'
    )
  })

  test('it highlights text matching search pattern', () => {
    const highlightPattern = 'spec'
    renderWithSearch(
      <Markdown source={'An API Explorer to explore your OpenAPI spec'} />,
      highlightPattern
    )
    const mark = screen.getByText(highlightPattern)
    expect(mark.tagName).toEqual('MARK')
  })

  test('it renders code blocks', () => {
    const code =
      '```\nAuthorization: token 4QDkCyCtZzYgj4C2p2cj3csJH7zqS5RzKs2kTnG4\n```'
    renderWithTheme(<Markdown source={code} />)
    expect(
      screen.getByText(
        'Authorization: token 4QDkCyCtZzYgj4C2p2cj3csJH7zqS5RzKs2kTnG4'
      )
    ).toBeInTheDocument()
  })

  test('it renders inline code', () => {
    const markdown = 'Some text with code: `const noop = () => null`'
    renderWithTheme(<Markdown source={markdown} />)
    expect(screen.getByText('const noop = () => null')).toBeInTheDocument()
  })
})
