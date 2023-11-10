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
import { createTestStore, renderWithReduxProvider } from '../../test-utils'

import { DocMarkdown } from './DocMarkdown'

describe('DocMarkdown', () => {
  test('it renders markdown', () => {
    renderWithReduxProvider(
      <DocMarkdown
        source={
          '# Markdown Component \n Renders markdown using [ReactMarkdown](https://github.com/rexxars/react-markdown)'
        }
        specKey={'4.0'}
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

  test('it remaps hashbang urls found in markdown input', () => {
    const input =
      'A link to the [create_dashboard](#!/Dashboard/create_dashboard) endpoint'
    renderWithReduxProvider(<DocMarkdown source={input} specKey={'4.0'} />)
    expect(screen.getByText(/A link to the/)).toBeInTheDocument()
    expect(screen.getByText('create_dashboard')).toHaveAttribute(
      'href',
      '/4.0/methods/Dashboard/create_dashboard'
    )
  })

  test('it leaves external urls untouched', () => {
    renderWithReduxProvider(
      <DocMarkdown
        source={'[external_link](https://www.foo.com)'}
        specKey={'4.0'}
      />
    )
    expect(screen.getByText('external_link')).toHaveAttribute(
      'href',
      'https://www.foo.com'
    )
  })

  test('it highlights text matching search pattern', () => {
    const highlightPattern = 'spec'
    const store = createTestStore({
      settings: { searchPattern: highlightPattern },
    })
    renderWithReduxProvider(
      <DocMarkdown
        source={'An API Explorer to explore your OpenAPI spec'}
        specKey={'4.0'}
      />,
      store
    )
    const mark = screen.getByText(highlightPattern)
    expect(mark.tagName).toEqual('MARK')
  })

  test('it only highlights search matches in the display text of link', () => {
    const highlightPattern = 'dashboard'
    const store = createTestStore({
      settings: { searchPattern: highlightPattern },
    })
    renderWithReduxProvider(
      <DocMarkdown
        source={
          'An inline styled link with matching text in both the link text and the href: [create_dashboard](/4.0/methods/Dashboard/create_dashboard)'
        }
        specKey={'4.0'}
      />,
      store
    )
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute(
      'href',
      '/4.0/methods/Dashboard/create_dashboard'
    )
    expect(link).toContainHTML('create_<mark>dashboard</mark>')
  })

  test('it renders code blocks', () => {
    const code =
      '```\nAuthorization: token 4QDkCyCtZzYgj4C2p2cj3csJH7zqS5RzKs2kTnG4\n```'
    renderWithReduxProvider(<DocMarkdown source={code} specKey={'4.0'} />)
    expect(
      screen.getByText(
        'Authorization: token 4QDkCyCtZzYgj4C2p2cj3csJH7zqS5RzKs2kTnG4'
      )
    ).toBeInTheDocument()
  })

  test('it renders inline code', () => {
    const markdown = 'Some text with code: `const noop = () => null`'
    renderWithReduxProvider(<DocMarkdown source={markdown} specKey={'4.0'} />)
    expect(screen.getByText('const noop = () => null')).toBeInTheDocument()
  })
})
