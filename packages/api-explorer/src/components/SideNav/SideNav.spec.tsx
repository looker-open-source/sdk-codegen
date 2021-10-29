/*

 MIT License

 Copyright (c) 2021 Looker Data Sciences, Inc.

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.

 */
import React from 'react'
import { criteriaToSet } from '@looker/sdk-codegen'
import userEvent from '@testing-library/user-event'
import { screen, waitFor } from '@testing-library/react'

import { getLoadedSpecs, specState } from '../../test-data'
import { renderWithRouterAndReduxProvider } from '../../test-utils'
import { defaultSettingsState } from '../../state'
import { SideNav } from './SideNav'
import { countMethods, countTypes } from './searchUtils'

describe('SideNav', () => {
  const specs = getLoadedSpecs()
  const specDispatch = jest.fn()
  const allTagsPattern = /^(Auth|ApiAuth)$/
  const allTypesPattern = /^(WriteDashboard|WriteQuery)$/

  let saveLocation: Location

  beforeEach(() => {
    saveLocation = window.location
    window.location = {
      ...saveLocation,
      pathname: '/3.1',
    }
  })

  afterEach(() => {
    window.location = saveLocation
  })

  test('it renders search, methods tab and types tab', () => {
    renderWithRouterAndReduxProvider(
      <SideNav
        specs={specs}
        spec={specState.spec}
        specDispatch={specDispatch}
      />
    )
    const search = screen.getByLabelText('Search')
    expect(search).toHaveProperty('placeholder', 'Search')
    const tabs = screen.getAllByRole('tab', {
      name: /^Methods \(\d+\)|Types \(\d+\)$/,
    })
    expect(tabs).toHaveLength(2)
    expect(tabs[0]).toHaveTextContent(
      `Methods (${countMethods(specState.spec.api!.tags)})`
    )

    expect(tabs[1]).toHaveTextContent(
      `Types (${countTypes(specState.spec.api!.types)})`
    )
  })

  test('Methods tab is the default active tab', () => {
    renderWithRouterAndReduxProvider(
      <SideNav
        specs={specs}
        spec={specState.spec}
        specDispatch={specDispatch}
      />,
      ['/3.1/methods']
    )
    expect(screen.getAllByText(allTagsPattern)).toHaveLength(2)
    expect(
      screen.queryAllByRole('link', { name: allTypesPattern })
    ).toHaveLength(0) // eslint-disable-line jest-dom/prefer-in-document

    userEvent.click(screen.getByRole('tab', { name: /^Types \(\d+\)$/ }))

    expect(screen.queryAllByText(allTagsPattern)).toHaveLength(2)
  })

  test('url determines active tab', () => {
    renderWithRouterAndReduxProvider(
      <SideNav
        specs={specs}
        spec={specState.spec}
        specDispatch={specDispatch}
      />,
      ['/3.1/types']
    )
    // eslint-disable-next-line jest-dom/prefer-in-document
    expect(screen.queryAllByText(allTagsPattern)).toHaveLength(2)
  })
})

describe('Search', () => {
  const specs = getLoadedSpecs()
  const specDispatch = jest.fn()

  test('it filters methods and types on input', async () => {
    renderWithRouterAndReduxProvider(
      <SideNav
        specs={specs}
        spec={specState.spec}
        specDispatch={specDispatch}
      />
    )
    const searchPattern = 'embedsso'
    const input = screen.getByLabelText('Search')
    jest.spyOn(specState.spec.api!, 'search')
    /** Pasting to avoid triggering search multiple times */
    await userEvent.paste(input, searchPattern)
    await waitFor(() => {
      expect(specState.spec.api!.search).toHaveBeenCalledWith(
        searchPattern,
        criteriaToSet(defaultSettingsState.searchCriteria)
      )
      const methods = screen.getByRole('tab', { name: 'Methods (1)' })
      userEvent.click(methods)
      expect(
        screen.getByText(
          specState.spec.api!.tags.Auth.create_sso_embed_url.summary
        )
      ).toBeInTheDocument()
      const types = screen.getByRole('tab', { name: 'Types (1)' })
      userEvent.click(types)
      expect(screen.getByText('EmbedSso')).toBeInTheDocument()
    })
  })
})
