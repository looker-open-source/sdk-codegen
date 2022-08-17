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
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { api } from '../../../../test-data'
import { renderWithRouter } from '../../../../test-utils'
import { DocResponses } from './DocResponses'
import { buildResponseTree } from './utils'

describe('DocResponses', () => {
  test('it renders all response statuses and their types', async () => {
    const responses = api.methods.run_look.responses
    renderWithRouter(<DocResponses api={api} responses={responses} />)

    expect(screen.getByText('Response Models')).toBeInTheDocument()

    const responseTree = buildResponseTree(responses)
    const expectedRespStatuses = Object.keys(responseTree)
    expect(
      screen.getAllByRole('tab', {
        name: new RegExp(`${expectedRespStatuses.join('|')}`),
      })
    ).toHaveLength(expectedRespStatuses.length)

    userEvent.click(screen.getByRole('tab', { name: '200: Look' }))
    const successRespTypes = Object.keys(responseTree['200: Look'])
    await waitFor(() => {
      expect(
        screen.getAllByRole('button', {
          name: new RegExp(`${successRespTypes.join('|')}`),
        })
      ).toHaveLength(successRespTypes.length)
    })
  })
})
