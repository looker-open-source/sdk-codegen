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

  // TODO: Figure out why the below is not failing when it should be.
  // test('types are rendered in the same order as received', () => {
  //   const typeNames = Object.keys(api.types)
  //     .filter((typeName) => !(api.types[typeName] instanceof IntrinsicType))
  //     .slice(1, 30)
  //   expect(typeNames).toEqual(typeNames.sort())
  //   const types = {}
  //   typeNames.forEach((typeName) => (types[typeName] = api.types[typeName]))
  //   renderWithSearchAndRouter(<SideNavTypes specKey={'3.1'} types={types} />)
  //
  //   const links = screen.getAllByRole('link')
  //   const sideNavItems = links.map((item) => item.textContent) as string[]
  //   expect(sideNavItems.length).toEqual(typeNames.length)
  //   expect(sideNavItems).toEqual(typeNames)
  // })
})
