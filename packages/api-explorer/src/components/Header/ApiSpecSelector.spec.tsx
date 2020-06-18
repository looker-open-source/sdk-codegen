import React from 'react'
import { screen, fireEvent } from '@testing-library/react'
import {
  renderWithTheme,
  withThemeProvider,
} from '@looker/components-test-utils'

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
    expect(selector).toHaveValue(specState.key)
  })

  test('it lists all available specs', () => {
    renderWithTheme(
      <ApiSpecSelector
        specs={specs}
        spec={specState}
        specDispatch={specDispatch}
      />
    )
    fireEvent.click(screen.getByTitle('Caret Down'))
    expect(screen.getAllByRole('option')).toHaveLength(
      Object.keys(specs).length
    )
    fireEvent.click(document)
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
    fireEvent.click(screen.getByTitle('Caret Down'))
    const options = screen.getAllByRole('option')
    fireEvent.click(options[0])
    expect(specDispatch).toHaveBeenCalledTimes(1)
    expect(specDispatch).toHaveBeenCalledWith({
      type: 'SELECT_SPEC',
      key: options[0].textContent,
      payload: specs,
    })
    fireEvent.click(document)
  })
})
