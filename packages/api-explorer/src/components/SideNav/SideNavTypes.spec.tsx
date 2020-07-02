import React from 'react'
import { screen } from '@testing-library/react'

import { api } from '../../test-data'
import { renderWithSearchAndRouter } from '../../test-utils'
import { SideNavTypes } from './SideNavTypes'

describe('SideNavTypes', () => {
  test('it renders provided types', () => {
    renderWithSearchAndRouter(
      <SideNavTypes
        specKey={'3.1'}
        types={{
          Dashboard: api.types.Dashboard,
        }}
      />
    )
    const dashboardType = screen.getByRole('link')
    expect(dashboardType).toHaveAttribute('href', '/3.1/types/Dashboard')
  })

  test('it highlights text matching search pattern', () => {
    renderWithSearchAndRouter(
      <SideNavTypes
        specKey={'3.1'}
        types={{
          Dashboard: api.types.Dashboard,
        }}
      />,
      'dash'
    )
    const match = screen.getByText(/dash/i)
    expect(match).toContainHTML('<span class="hi">Dash</span>')
  })
})
