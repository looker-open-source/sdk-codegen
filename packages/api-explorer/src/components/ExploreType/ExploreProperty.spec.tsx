/*

 MIT License

 Copyright (c) 2020 Looker Data Sciences, Inc.

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
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { api } from '../../test-data'
import { renderWithSearchAndRouter } from '../../test-utils'
import { ExplorePropertyDetail } from '.'

describe('ExploreProperty', () => {
  describe('ExplorePropertyDetail', () => {
    describe('CreateDashboardFilter', () => {
      const type = api.types.CreateDashboardFilter
      test('Shows read-only property and description', async () => {
        const property = type.properties.id
        expect(property).toBeDefined()
        renderWithSearchAndRouter(<ExplorePropertyDetail property={property} />)
        expect(property.deprecated).toEqual(false)
        expect(property.readOnly).toEqual(true)
        expect(property.required).toEqual(false)
        expect(screen.getByText(property.description)).toBeInTheDocument()
        await waitFor(() => {
          // TODO figure out the correct selector for this
          const statusIcon = screen.getByAltText('read-only')
          fireEvent.mouseOver(statusIcon)
          expect(screen.getByRole('tooltip')).toHaveTextContent(
            'CreateDashboardFilter.id is read-only'
          )
        })
      })
    })
  })
})
