import React from 'react'
import { renderWithTheme } from '@looker/components-test-utils'
import { screen, waitFor, fireEvent } from '@testing-library/react'

import { api } from '../../test-data'
import { DocPrimaryResponse } from './DocPrimaryResponse'

describe('DocPrimaryResponse', () => {
  const response = api.methods.create_query.primaryResponse

  test('it renders response type name', () => {
    renderWithTheme(<DocPrimaryResponse response={response} />)
    expect(screen.getByText(response.type.name)).toBeInTheDocument()
  })

  test('it renders a tooltip on mouse over', async () => {
    renderWithTheme(<DocPrimaryResponse response={response} />)
    const resp = screen.getByText(response.type.name)

    fireEvent.mouseOver(resp)
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveTextContent(
        `${response.description} ${response.mediaType}`
      )
    })
  })
})
