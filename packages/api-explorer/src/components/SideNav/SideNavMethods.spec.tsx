import React from 'react'
import { screen } from '@testing-library/react'
import { pick } from 'lodash'
import { withThemeProvider } from '@looker/components-test-utils'

import { api } from '../../test-data'
import { renderWithSearchAndRouter } from '../../test-utils'
import { SideNavMethods } from './SideNavMethods'

describe('SideNavMethods', () => {
  const tag = 'Dashboard'
  const methods = api.tags[tag]

  test('it renders provided methods', () => {
    renderWithSearchAndRouter(
      withThemeProvider(
        <SideNavMethods methods={methods} tag={tag} specKey={'3.1'} />
      )
    )
    const sideNavItems = screen.getAllByRole('link')
    expect(sideNavItems).toHaveLength(Object.keys(methods).length)
    expect(sideNavItems[0]).toHaveAttribute(
      'href',
      `/3.1/methods/${tag}/${Object.values(methods)[0].name}`
    )
  })

  test('it highlights text matching search pattern', () => {
    const highlightPattern = 'dash'
    renderWithSearchAndRouter(
      withThemeProvider(
        <SideNavMethods
          methods={pick(methods, 'create_dashboard')}
          tag={tag}
          specKey={'3.1'}
        />
      ),
      highlightPattern
    )
    const sideNavItem = screen.getByText('Dash')
    expect(sideNavItem).toBeDefined()
  })
})
