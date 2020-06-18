import React from 'react'
import { screen } from '@testing-library/react'
import { renderWithTheme } from '@looker/components-test-utils'

import { DocStatus } from './DocStatus'

describe('DocStatus', () => {
  test('it renders a baddge with the status', () => {
    renderWithTheme(<DocStatus status={'Stable'} />)
    expect(screen.getByText('STABLE')).toBeInTheDocument()
  })
})
