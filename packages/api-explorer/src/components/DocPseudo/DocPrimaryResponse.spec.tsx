import React from 'react'
import { renderWithTheme } from '@looker/components-test-utils'
import { screen, waitFor, fireEvent } from '@testing-library/react'

import { api } from '../../test-data'
import { DocPrimaryResponse } from './DocPrimaryResponse'

describe('DocPrimaryResponse', () => {
  const response = api.methods['create_query'].primaryResponse

  test('it renders response type name', () => {
    renderWithTheme(<DocPrimaryResponse response={response} />)
    expect(screen.getByText(response.type.name)).toBeInTheDocument()
  })

  test('it renders a tooltip on mouse over', () => {
    renderWithTheme(<DocPrimaryResponse response={response} />)
    const resp = screen.getByText(response.type.name)

    waitFor(() => {
      fireEvent.mouseOver(resp)
      expect(screen.getByRole('tooltip')).toHaveTextContent(
        `${response.description} ${response.mediaType}`
      )
    })
  })
})
