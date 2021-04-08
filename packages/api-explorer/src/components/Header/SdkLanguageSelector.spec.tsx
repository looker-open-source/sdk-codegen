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
import { codeGenerators } from '@looker/sdk-codegen'

import { withReduxProvider } from '../../test-utils'
import { defaultUserState } from '../../state'
import { SdkLanguageSelector } from './SdkLanguageSelector'

describe('SdkLanguageSelector', () => {
  window.HTMLElement.prototype.scrollIntoView = jest.fn()

  beforeEach(() => {
    localStorage.clear()
  })

  test('it has the correct default language selected', () => {
    renderWithTheme(withReduxProvider(<SdkLanguageSelector />))
    expect(screen.getByRole('textbox')).toHaveValue(
      defaultUserState.sdkLanguage
    )
  })

  test('it lists all available languages and "All" as options', async () => {
    renderWithTheme(withReduxProvider(<SdkLanguageSelector />))
    await act(async () => {
      await userEvent.click(screen.getByRole('textbox'))
      await waitFor(() => {
        expect(screen.getAllByRole('option')).toHaveLength(
          codeGenerators.length + 1
        )
      })
    })
  })

  test('it stores the selected language in localStorage', async () => {
    renderWithTheme(withReduxProvider(<SdkLanguageSelector />))
    const selector = screen.getByRole('textbox')
    expect(defaultUserState.sdkLanguage).toEqual('Python')
    expect(selector).toHaveValue('Python')

    await act(async () => {
      await userEvent.click(selector)
      await userEvent.click(screen.getByRole('option', { name: 'Typescript' }))
      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenLastCalledWith(
          'sdkLanguage',
          'Typescript'
        )
      })
    })
  })
})
