import React from 'react'
import { renderWithTheme } from '@looker/components-test-utils'
import { screen, fireEvent, waitFor } from '@testing-library/react'

import { DocRateLimited } from './DocRateLimited'

describe('DocRateLimited', () => {
  test('it renders', () => {
    renderWithTheme(<DocRateLimited />)
    expect(screen.getByText('rate_limited')).toBeInTheDocument()
  })

  test('it displays a tooltip with the right information on hover', async () => {
    renderWithTheme(<DocRateLimited />)
    const badge = screen.getByText('rate_limited')
    await waitFor(() => {
      fireEvent.mouseOver(badge)
      expect(screen.getByRole('tooltip')).toHaveTextContent(
        'This endpoint is rate limited.'
      )
    })
  })
})
