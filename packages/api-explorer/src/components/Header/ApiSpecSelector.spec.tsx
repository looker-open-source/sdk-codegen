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
import { act, screen, waitFor } from '@testing-library/react'
import { renderWithTheme } from '@looker/components-test-utils'
import userEvent from '@testing-library/user-event'

import { specs, specState } from '../../test-data'
import { renderWithRouter } from '../../test-utils'
import { ApiSpecSelector } from './ApiSpecSelector'

describe('ApiSpecSelector', () => {
  const specDispatch = jest.fn()
  Element.prototype.scrollIntoView = jest.fn()

  test('the default spec is selected by default', () => {
    renderWithTheme(
      <ApiSpecSelector
        specs={specs}
        spec={specState}
        specDispatch={specDispatch}
      />
    )

    const selector = screen.getByRole('textbox')
    expect(selector).toHaveValue(`${specState.key} (${specState.status})`)
  })

  test('it lists all available specs', async () => {
    renderWithTheme(
      <ApiSpecSelector
        specs={specs}
        spec={specState}
        specDispatch={specDispatch}
      />
    )
    userEvent.click(screen.getByRole('textbox'))
    await waitFor(() => {
      expect(screen.getAllByRole('option')).toHaveLength(
        Object.keys(specs).length
      )
    })
  })

  test('it fires a SELECT_SPEC action when another spec is selected', async () => {
    renderWithRouter(
      <ApiSpecSelector
        specs={specs}
        spec={specState}
        specDispatch={specDispatch}
      />
    )

    await act(async () => {
      await userEvent.click(screen.getByRole('textbox'))
      await userEvent.click(
        screen.getByRole('option', { name: '3.1 (current)' })
      )
      await waitFor(() => {
        expect(specDispatch).toHaveBeenCalledTimes(1)
        expect(specDispatch).toHaveBeenCalledWith({
          type: 'SELECT_SPEC',
          key: '3.1',
          payload: specs,
        })
      })
    })
  })
})
