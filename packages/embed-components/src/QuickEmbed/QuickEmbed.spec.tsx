/*

 MIT License

 Copyright (c) 2023 Looker Data Sciences, Inc.

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
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithTheme } from '@looker/components-test-utils'
import { useThemeActions, useThemesStoreState } from '../Theme/state'
import { QuickEmbed } from './QuickEmbed'

jest.mock('../Theme/state', () => ({
  ...jest.requireActual('../Theme/state'),
  useThemeActions: jest.fn(),
  useThemesStoreState: jest.fn(),
}))

describe('QuickEmbed', () => {
  const lookerTheme = { id: '1', name: 'Looker' }
  const customTheme1 = { id: '2', name: 'custom_theme_1' }
  const customTheme2 = { id: '3', name: 'custom_theme_2' }
  const selectedTheme = lookerTheme
  const themes = [lookerTheme, customTheme1, customTheme2]
  const getMockStoreState = (overrides: Record<string, any> = {}) => ({
    initialized: true,
    selectedTheme,
    themes,
    defaultTheme: lookerTheme,
    ...overrides,
  })
  const onClose = jest.fn()

  beforeEach(() => {
    jest.spyOn(window, 'location', 'get').mockReturnValue({
      href: 'https://example.com/dashboards/42',
      pathname: '/dashboards/42',
    } as Location)
    ;(useThemeActions as jest.Mock).mockReturnValue({
      initAction: jest.fn(),
      loadThemeDataAction: jest.fn(),
      selectThemeAction: jest.fn(),
    })
    ;(useThemesStoreState as jest.Mock).mockReturnValue(getMockStoreState())
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders', () => {
    renderWithTheme(<QuickEmbed onClose={onClose} />)

    expect(
      screen.getByRole('heading', { name: 'Get embed url' })
    ).toBeInTheDocument()
    const textboxes = screen.getAllByRole('textbox')

    /** theme selector */
    expect(screen.getByText('Apply theme to dashboard URL')).toBeInTheDocument()
    // surprisingly, the role of a selector is textbox
    const selector = textboxes[0]
    expect(selector).toHaveValue(lookerTheme.name)

    /** embed url */
    const url = textboxes[1]
    expect(url).toHaveValue('https://example.com/embed/dashboards/42')

    /** switch for including/excluding params from target url */
    expect(
      screen.getByText('Include current params in URL')
    ).toBeInTheDocument()
    expect(screen.getByRole('switch')).not.toBeChecked()

    expect(
      screen.getByRole('button', { name: 'Copy Link' })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('does not render theme selector for non-themable content', () => {
    jest.spyOn(window, 'location', 'get').mockReturnValue({
      href: 'https://example.com/looks/42',
      pathname: '/looks/42',
    } as Location)
    renderWithTheme(<QuickEmbed onClose={onClose} />)

    expect(
      screen.getByRole('heading', { name: 'Get embed url' })
    ).toBeInTheDocument()

    expect(screen.queryByText(/Apply theme to/)).not.toBeInTheDocument()

    expect(screen.getByRole('textbox')).toHaveValue(
      'https://example.com/embed/looks/42'
    )
  })

  it('can toggle between including and not include current url params', async () => {
    jest.spyOn(window, 'location', 'get').mockReturnValue({
      href: 'https://example.com/dashboards/42?foo=bar',
      pathname: '/dashboards/42',
    } as Location)
    ;(useThemesStoreState as jest.Mock).mockReturnValue(
      getMockStoreState({ selectedTheme: customTheme1 })
    )
    renderWithTheme(<QuickEmbed onClose={onClose} />)

    expect(
      screen.getByRole('heading', { name: 'Get embed url' })
    ).toBeInTheDocument()

    expect(screen.getByText('Apply theme to dashboard URL')).toBeInTheDocument()
    const textboxes = screen.getAllByRole('textbox')
    const selector = textboxes[0]
    expect(selector).toHaveValue('custom_theme_1')

    const url = textboxes[1]
    expect(url).toHaveValue(
      'https://example.com/embed/dashboards/42?theme=custom_theme_1'
    )

    const toggleSwitch = screen.getByRole('switch')
    expect(toggleSwitch).not.toBeChecked()

    await userEvent.click(toggleSwitch)

    await waitFor(() => {
      expect(screen.getByRole('switch')).toBeChecked()
      const textboxes = screen.getAllByRole('textbox')
      expect(textboxes[1]).toHaveValue(
        'https://example.com/embed/dashboards/42?foo=bar&theme=custom_theme_1'
      )
    })
  })
})
