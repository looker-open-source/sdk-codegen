import React from 'react'
import { screen, fireEvent } from '@testing-library/react'
import { pick } from 'lodash'

import { withThemeProvider } from '@looker/components-test-utils'
import { api } from '../../test-data'
import { renderWithSearchAndRouter } from '../../test-utils'
import { SideNavTags } from './SideNavTags'

const getExpanded = (tagButtons: HTMLElement[]) =>
  tagButtons.filter((button) => button.getAttribute('aria-expanded') === 'true')

describe('SideNavTags', () => {
  test('it renders a provided tag and its methods', () => {
    const tags = pick(api.tags, 'Dashboard')
    renderWithSearchAndRouter(
      withThemeProvider(<SideNavTags tags={tags} specKey={'3.1'} />)
    )

    const tagButton = screen.getByRole('button', { name: /dashboard/i })
    let isExpanded = tagButton.getAttribute('aria-expanded')
    expect(isExpanded).toEqual('false')
    expect(screen.queryAllByRole('link')).toHaveLength(0)

    fireEvent.click(tagButton)

    isExpanded = tagButton.getAttribute('aria-expanded')
    expect(isExpanded).toEqual('true')
    const methods = screen.getAllByRole('link')
    expect(methods).toHaveLength(Object.keys(tags.Dashboard).length)
  })

  test('tags are rendered collapsed initially and expand when clicked', () => {
    const tags = pick(api.tags, ['ApiAuth', 'Dashboard'])
    renderWithSearchAndRouter(
      withThemeProvider(<SideNavTags tags={tags} specKey={'3.1'} />)
    )

    const allTagButtons = screen.getAllByRole('button')
    expect(allTagButtons).toHaveLength(2)
    expect(getExpanded(allTagButtons)).toHaveLength(0)

    fireEvent.click(screen.getByRole('button', { name: /dashboard/i }))

    expect(getExpanded(screen.getAllByRole('button'))).toHaveLength(1)
  })

  test('tag is expanded if specified in route', () => {
    const tags = pick(api.tags, ['ApiAuth', 'Dashboard'])
    renderWithSearchAndRouter(
      withThemeProvider(<SideNavTags tags={tags} specKey={'3.1'} />),
      undefined,
      undefined,
      ['/3.1/methods/Dashboard']
    )

    const allTagButtons = screen.getAllByRole('button')
    expect(allTagButtons).toHaveLength(2)
    const expandedTags = getExpanded(allTagButtons)
    expect(expandedTags).toHaveLength(1)
    expect(expandedTags[0]).toHaveTextContent('Dashboard')
  })
})
