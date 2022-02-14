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

import { getLoadedSpecs, specs } from '../../test-data'
import { renderWithRouterAndReduxProvider } from '../../test-utils'
import { defaultSettingsState } from '../../state'
import { SelectorContainer } from './SelectorContainer'

describe('SelectorContainer', () => {
  const spec = getLoadedSpecs()['4.0']
  beforeAll(() => {
    window.HTMLElement.prototype.scrollIntoView = jest.fn()
  })

  test('it renders a spec selector with the correct default value and options', async () => {
    renderWithRouterAndReduxProvider(<SelectorContainer spec={spec} />)
    const selector = screen.getByLabelText('spec selector')
    expect(selector).toHaveValue(`${spec.key}`)
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
    renderWithRouterAndReduxProvider(<SelectorContainer spec={spec} />)
    const selector = screen.getByLabelText('sdk language selector')
    expect(selector).toHaveValue(defaultSettingsState.sdkLanguage)
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
    renderWithRouterAndReduxProvider(<SelectorContainer spec={spec} />)
    expect(
      screen
        .getByRole('button', {
          name: 'Compare Specifications',
        })
        .closest('a')
    ).toHaveAttribute('href', `/diff/${spec.key}/`)
  })
})
