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
import { screen } from '@testing-library/react'

import { specs, specState } from '../../test-data'
import { renderWithRouter } from '../../test-utils'
import { Header } from './Header'

describe('Header', () => {
  const specDispatch = jest.fn()

  test('it renders a title', () => {
    const hasNavigation = true
    const toggleNavigation = () => !hasNavigation
    renderWithRouter(
      <Header
        specs={specs}
        spec={specState}
        specDispatch={specDispatch}
        toggleNavigation={toggleNavigation}
      />
    )
    expect(screen.getByText('API Explorer').closest('a')).toHaveAttribute(
      'href',
      `/${specState.key}`
    )
  })

  test.skip('it renders a spec selector with the correct value', () => {
    const hasNavigation = true
    const toggleNavigation = () => !hasNavigation
    renderWithRouter(
      <Header
        specs={specs}
        spec={specState}
        specDispatch={specDispatch}
        toggleNavigation={toggleNavigation}
      />
    )
    expect(screen).toHaveTextContent('4.0 (experimental)')
    // const selector = screen.getByRole('textbox', { name: 'Version' })
    // expect(selector).toHaveValue(`${specState.key} (${specState.status})`)
  })
})
