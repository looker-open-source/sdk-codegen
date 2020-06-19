import React from 'react'
import { renderWithTheme } from '@looker/components-test-utils'
import { screen } from '@testing-library/react'

import { api } from '../../test-data'
import { DocPseudo } from './DocPseudo'

describe('DocPseudo', () => {
  const method = api.methods['create_dashboard_filter']

  test('it renders', () => {
    renderWithTheme(<DocPseudo method={method} />)
    expect(screen.getByText(method.name, { exact: false })).toBeInTheDocument()

    method.params.forEach((param) => {
      expect(screen.getByText(param.name, { exact: false })).toBeInTheDocument()
    })

    expect(
      screen.getByText(method.primaryResponse.type.name)
    ).toBeInTheDocument()
  })
})
