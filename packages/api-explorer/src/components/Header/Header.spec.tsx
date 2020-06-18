import React from 'react'
import { screen } from '@testing-library/react'
import { withThemeProvider } from '@looker/components-test-utils'

import { specs, specState } from '../../test-data'
import { renderWithRouter } from '../../test-utils'
import { Header } from './Header'

describe('Header', () => {
  const specDispatch = jest.fn()

  test('it renders a title', () => {
    renderWithRouter(
      withThemeProvider(
        <Header specs={specs} spec={specState} specDispatch={specDispatch} />
      )
    )

    expect(screen.getByText('API Explorer')).toHaveAttribute(
      'href',
      `/${specState.key}`
    )
  })

  test('it renders a spec selector with the correct value', () => {
    renderWithRouter(
      withThemeProvider(
        <Header specs={specs} spec={specState} specDispatch={specDispatch} />
      )
    )
    const selector = screen.getByRole('textbox')
    expect(selector).toHaveValue(specState.key)
  })
})
