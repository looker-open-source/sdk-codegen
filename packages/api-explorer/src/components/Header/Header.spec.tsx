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
import { act, screen, waitFor } from '@testing-library/react'
import { codeGenerators } from '@looker/sdk-codegen'
import userEvent from '@testing-library/user-event'

import { specs, specState } from '../../test-data'
import { renderWithRouter, withReduxProvider } from '../../test-utils'
import { defaultUserState } from '../../state'
import { Header } from './Header'

describe('Header', () => {
  const specDispatch = jest.fn()
  const hasNavigation = true
  const toggleNavigation = () => !hasNavigation

  beforeAll(() => {
    window.HTMLElement.prototype.scrollIntoView = jest.fn()
  })

  test('it renders a title', () => {
    renderWithRouter(
      withReduxProvider(
        <Header
          specs={specs}
          spec={specState}
          specDispatch={specDispatch}
          toggleNavigation={toggleNavigation}
        />
      )
    )
    expect(screen.getByText('API Explorer').closest('a')).toHaveAttribute(
      'href',
      `/${specState.key}`
    )
  })

  test('it renders a spec selector with the correct default value and options', async () => {
    renderWithRouter(
      withReduxProvider(
        <Header
          specs={specs}
          spec={specState}
          specDispatch={specDispatch}
          toggleNavigation={toggleNavigation}
        />
      )
    )
    const selector = screen.getByLabelText('spec selector')
    expect(selector).toHaveValue(`${specState.key}`)
    await act(async () => {
      await userEvent.click(selector)
      await waitFor(() => {
        expect(screen.getAllByRole('option')).toHaveLength(
          Object.keys(specs).length
        )
      })
    })
  })

  test('it renders an sdk language selector with the correct value and options', async () => {
    renderWithRouter(
      withReduxProvider(
        <Header
          specs={specs}
          spec={specState}
          specDispatch={specDispatch}
          toggleNavigation={toggleNavigation}
        />
      )
    )
    const selector = screen.getByLabelText('sdk language selector')
    expect(selector).toHaveValue(defaultUserState.sdkLanguage)
    await act(async () => {
      await userEvent.click(selector)
      await waitFor(() => {
        expect(screen.getAllByRole('option')).toHaveLength(
          codeGenerators.length + 1
        )
      })
    })
  })

  test('it renders an icon button for the differ', () => {
    renderWithRouter(
      withReduxProvider(
        <Header
          specs={specs}
          spec={specState}
          specDispatch={specDispatch}
          toggleNavigation={toggleNavigation}
        />
      )
    )
    expect(
      screen
        .getByRole('button', {
          name: 'Compare Specifications',
        })
        .closest('a')
    ).toHaveAttribute('href', `/diff/${specState.key}/`)
  })
})
