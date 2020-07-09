import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import {
  renderWithTheme,
  withThemeProvider,
} from '@looker/components-test-utils'
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
    userEvent.click(screen.getByTitle('Caret Down'))
    await waitFor(() => {
      expect(screen.getAllByRole('option')).toHaveLength(
        Object.keys(specs).length
      )
    })
  })

  test('it fires a SELECT_SPEC action when another spec is selected', () => {
    renderWithRouter(
      withThemeProvider(
        <ApiSpecSelector
          specs={specs}
          spec={specState}
          specDispatch={specDispatch}
        />
      )
    )
    userEvent.click(screen.getByTitle('Caret Down'))
    userEvent.click(screen.getByRole('option', { name: '3.0 (stable)' }))
    expect(specDispatch).toHaveBeenCalledTimes(1)
    expect(specDispatch).toHaveBeenCalledWith({
      type: 'SELECT_SPEC',
      key: '3.0',
      payload: specs,
    })
  })
})
