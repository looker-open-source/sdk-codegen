/*

 MIT License

 Copyright (c) 2022 Looker Data Sciences, Inc.

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
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { getLoadedSpecs } from '../../../test-data'
import { diffSpecs, standardDiffToggles } from '../diffUtils'
import { renderWithReduxProvider } from '../../../test-utils'
import { DocDiff } from './DocDiff'

describe('DocDiff', () => {
  const specs = getLoadedSpecs()
  const leftKey = specs['3.1'].key
  const rightKey = specs['4.0'].key
  const leftApi = specs['3.1'].api!
  const rightApi = specs['4.0'].api!
  const delta = diffSpecs(leftApi, rightApi, standardDiffToggles)

  it('renders', () => {
    renderWithReduxProvider(
      <DocDiff
        leftKey={leftKey}
        leftSpec={leftApi}
        rightKey={rightKey}
        rightSpec={rightApi}
        delta={delta}
        pageSize={1}
      />
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      `${delta.length} differences between ${leftKey} and ${rightKey}`
    )
    expect(
      screen.getByRole('button', { name: 'Previous page of results' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Next page of results' })
    ).toBeInTheDocument()
  })

  it('renders when there is no delta', () => {
    renderWithReduxProvider(
      <DocDiff
        leftKey={leftKey}
        leftSpec={leftApi}
        rightKey={rightKey}
        rightSpec={rightApi}
        delta={[]}
      />
    )
    expect(screen.getByText('No differences found')).toBeInTheDocument()
  })

  it('paginates', async () => {
    renderWithReduxProvider(
      <DocDiff
        leftKey={leftKey}
        leftSpec={leftApi}
        rightKey={rightKey}
        rightSpec={rightApi}
        delta={delta}
        pageSize={1}
      />
    )

    // page 1
    const row1 = delta[0]
    expect(screen.getByText(row1.name)).toBeInTheDocument()
    expect(screen.getByText(row1.id)).toBeInTheDocument()
    expect(
      screen.getByText(rightApi.methods[row1.name].summary)
    ).toBeInTheDocument()

    // go to page 2
    userEvent.click(
      screen.getByRole('button', { name: 'Next page of results' })
    )

    await waitFor(() => {
      const row2 = delta[1]
      expect(screen.getByText(row2.name)).toBeInTheDocument()
      expect(screen.getByText(row2.id)).toBeInTheDocument()
      expect(
        screen.getByText(rightApi.methods[row2.name].summary)
      ).toBeInTheDocument()
    })
  })

  it('paginates with correct number of entries per page', async () => {
    const pageSize = 5
    renderWithReduxProvider(
      <DocDiff
        leftKey={leftKey}
        leftSpec={leftApi}
        rightKey={rightKey}
        rightSpec={rightApi}
        delta={delta}
        pageSize={pageSize}
      />
    )

    for (let i = 0; i < pageSize; i++) {
      const row = delta[i]
      expect(screen.getByText(row.name)).toBeInTheDocument()
      expect(screen.getByText(row.id)).toBeInTheDocument()
      expect(
        screen.getByText(rightApi.methods[row.name].summary)
      ).toBeInTheDocument()
    }
    const notDisplayedRow = delta[pageSize]
    expect(screen.queryByText(notDisplayedRow.name)).not.toBeInTheDocument()
  })

  it('paginates with correct total page count', async () => {
    const pageSize = 5
    renderWithReduxProvider(
      <DocDiff
        leftKey={leftKey}
        leftSpec={leftApi}
        rightKey={rightKey}
        rightSpec={rightApi}
        delta={delta}
        pageSize={pageSize}
      />
    )
    const expectedPageCount = Math.ceil(delta.length / pageSize)
    expect(screen.getByText(`of ${expectedPageCount}`)).toBeInTheDocument()
  })

  it('final diff entry of one page does not appear in next page', async () => {
    const pageSize = 5
    renderWithReduxProvider(
      <DocDiff
        leftKey={leftKey}
        leftSpec={leftApi}
        rightKey={rightKey}
        rightSpec={rightApi}
        delta={delta}
        pageSize={pageSize}
      />
    )
    const lastPageEntry = delta[pageSize - 1]
    expect(screen.getByText(lastPageEntry.name)).toBeInTheDocument()
    expect(screen.getByText(lastPageEntry.id)).toBeInTheDocument()
    expect(
      screen.getByText(rightApi.methods[lastPageEntry.name].summary)
    ).toBeInTheDocument()

    // go to page 2
    userEvent.click(
      screen.getByRole('button', { name: 'Next page of results' })
    )

    await waitFor(() => {
      expect(screen.queryByText(lastPageEntry.name)).not.toBeInTheDocument()
      expect(screen.queryByText(lastPageEntry.id)).not.toBeInTheDocument()
    })
  })
})
