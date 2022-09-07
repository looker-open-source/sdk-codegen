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
import { Router } from 'react-router'
import type { MemoryHistory, Location } from 'history'
import { createMemoryHistory } from 'history'
import { renderWithTheme } from '@looker/components-test-utils'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { startCount } from '@looker/sdk-codegen'
import userEvent from '@testing-library/user-event'
import { useHistory } from 'react-router-dom'
import * as routerLocation from 'react-router-dom'
import { api, getLoadedSpecs } from '../../../test-data'
import {
  createTestStore,
  renderWithRouterAndReduxProvider,
} from '../../../test-utils'
import { DiffItem, DiffMethodLink } from './DiffItem'

jest.mock('react-router-dom', () => {
  const ReactRouterDom = jest.requireActual('react-router-dom')
  return {
    ...ReactRouterDom,
    useHistory: jest.fn().mockReturnValue({ push: jest.fn(), location }),
    useLocation: jest
      .fn()
      .mockReturnValue({ pathname: '/3.1/diff/4.0', search: '' }),
  }
})

describe('DiffMethodLink', () => {
  const method = api.methods.create_dashboard
  const specKey = '4.0'
  let history: MemoryHistory

  beforeEach(() => {
    history = createMemoryHistory()
  })

  test('it renders method and navigates on click', () => {
    const { push } = useHistory()
    renderWithTheme(
      <Router history={history}>
        <DiffMethodLink method={method} specKey={specKey} />
      </Router>
    )
    const link = screen.getByRole('link')
    expect(link).toHaveTextContent(`${method.name} for ${specKey}`)
    fireEvent.click(link)
    expect(push).toHaveBeenCalledWith(
      `/${specKey}/methods/${method.schema.tags[0]}/${method.name}`
    )
  })

  test('it renders missing method and does not navigate on click', () => {
    renderWithTheme(
      <Router history={history}>
        <DiffMethodLink method={undefined} specKey={specKey} />
      </Router>
    )
    const s = `Missing in ${specKey}`
    expect(screen.getByText(s)).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})

describe('DiffItem', () => {
  const specs = getLoadedSpecs()
  const sampleDif = {
    name: 'create_query',
    id: 'POST /create_query',
    diffCount: startCount(),
    bodyDiff: '',
    typeDiff: '',
    lStatus: 'stable',
    rStatus: 'beta',
    paramsDiff: '',
    responseDiff: '',
  }
  const leftKey = specs['3.1'].key
  const rightKey = specs['4.0'].key
  const leftApi = specs['3.1'].api!
  const rightApi = specs['4.0'].api!

  test('renders', () => {
    renderWithRouterAndReduxProvider(
      <DiffItem
        item={sampleDif}
        leftKey={leftKey}
        leftSpec={leftApi}
        rightKey={rightKey}
        rightSpec={rightApi}
      />
    )
    expect(screen.getByText(sampleDif.name)).toBeInTheDocument()
    expect(screen.getByText(sampleDif.id)).toBeInTheDocument()
    expect(
      screen.getByText(rightApi.methods[sampleDif.name].summary)
    ).toBeInTheDocument()
  })

  test('opening method card pushes parameter to url', async () => {
    const { push } = useHistory()
    renderWithRouterAndReduxProvider(
      <DiffItem
        item={sampleDif}
        leftKey={leftKey}
        leftSpec={leftApi}
        rightKey={rightKey}
        rightSpec={rightApi}
      />
    )
    expect(screen.getByText(sampleDif.name)).toBeInTheDocument()
    // open method card
    userEvent.click(screen.getByText(sampleDif.name))
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith({
        pathname: '/3.1/diff/4.0',
        search: `m=${sampleDif.name}`,
      })
    })
  })

  test('closing method card removes parameter from url', async () => {
    const { push } = useHistory()
    jest.spyOn(routerLocation, 'useLocation').mockReturnValue({
      pathname: `/3.1/diff/4.0`,
      search: `m=${sampleDif.name}`,
    } as unknown as Location)
    const store = createTestStore({
      settings: { diffMethod: sampleDif.name },
    })
    renderWithRouterAndReduxProvider(
      <DiffItem
        item={sampleDif}
        leftKey={leftKey}
        leftSpec={leftApi}
        rightKey={rightKey}
        rightSpec={rightApi}
      />,
      undefined,
      store
    )
    expect(screen.getByText(sampleDif.name)).toBeInTheDocument()
    // close method card
    userEvent.click(screen.getByText(sampleDif.name))
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith({
        pathname: '/3.1/diff/4.0',
        search: ``,
      })
    })
  })
})
