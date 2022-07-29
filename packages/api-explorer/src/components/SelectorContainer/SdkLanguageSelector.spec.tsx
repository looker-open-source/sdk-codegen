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
import userEvent from '@testing-library/user-event'
import { codeGenerators } from '@looker/sdk-codegen'
import * as reactRedux from 'react-redux'

import { registerTestEnvAdaptor } from '@looker/extension-utils'
import { defaultSettingsState, settingsSlice } from '../../state'
import { renderWithRouterAndReduxProvider } from '../../test-utils'
import { SdkLanguageSelector } from './SdkLanguageSelector'

const mockHistoryPush = jest.fn()
jest.mock('react-router-dom', () => {
  const ReactRouterDOM = jest.requireActual('react-router-dom')
  return {
    ...ReactRouterDOM,
    useHistory: () => ({
      push: mockHistoryPush,
      location,
    }),
  }
})
describe('SdkLanguageSelector', () => {
  window.HTMLElement.prototype.scrollIntoView = jest.fn()

  beforeEach(() => {
    localStorage.clear()
  })

  test('it has the correct default language selected', async () => {
    renderWithRouterAndReduxProvider(<SdkLanguageSelector />)
    expect(screen.getByRole('textbox')).toHaveValue(
      defaultSettingsState.sdkLanguage
    )
    expect(mockHistoryPush).toHaveBeenCalledWith({
      pathname: location.pathname,
      search: `sdk=python`,
    })
  })

  test('it lists all available languages and "All" as options', async () => {
    renderWithRouterAndReduxProvider(<SdkLanguageSelector />)
    await act(async () => {
      await userEvent.click(screen.getByRole('textbox'))
      await waitFor(() => {
        expect(screen.getAllByRole('option')).toHaveLength(
          codeGenerators.length + 1
        )
      })
    })
  })

  test('changing SDK language causes parameter to be pushed to URL', async () => {
    renderWithRouterAndReduxProvider(<SdkLanguageSelector />)
    const selector = screen.getByRole('textbox')
    expect(defaultSettingsState.sdkLanguage).toEqual('Python')
    expect(selector).toHaveValue('Python')
    userEvent.click(selector)
    await act(async () => {
      await userEvent.click(screen.getByRole('option', { name: 'TypeScript' }))
      await waitFor(async () => {
        expect(mockHistoryPush).toHaveBeenLastCalledWith({
          pathname: location.pathname,
          search: 'sdk=typescript',
        })
      })
    })
  })
})
