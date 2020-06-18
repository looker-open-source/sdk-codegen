import React from 'react'
import { renderWithTheme } from '@looker/components-test-utils'
import { screen, fireEvent, waitFor } from '@testing-library/react'

import { DocActivityType } from './DocActivityType'

describe('DocActivityType', () => {
  test('it renders', () => {
    renderWithTheme(<DocActivityType />)
    expect(screen.getByText('db_query')).toBeInTheDocument()
  })

  test('it displays a tooltip with the right information on hover', async () => {
    renderWithTheme(<DocActivityType />)
    const costSymbol = screen.getByText('$')
    await waitFor(() => {
      fireEvent.mouseOver(costSymbol)
      expect(screen.getByRole('tooltip')).toHaveTextContent(
        'Call volume for this endpoint counts toward the "db_query" API activity category.'
      )
    })
  })
})
