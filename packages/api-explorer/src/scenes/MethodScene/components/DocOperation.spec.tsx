import React from 'react'
import { renderWithTheme } from '@looker/components-test-utils'
import { screen } from '@testing-library/react'

import { api } from '../../../test-data'
import { DocOperation } from './DocOperation'

describe('DocOperation', () => {
  const method = api.methods.create_dashboard

  test('it renders SDK portion of a method', () => {
    renderWithTheme(<DocOperation method={method} />)
    expect(screen.getByText('SDK:')).toBeInTheDocument()
    expect(screen.getByText(method.name, { exact: false })).toBeInTheDocument()
    method.allParams.forEach((param) => {
      expect(screen.getByText(param.name)).toBeInTheDocument()
    })

    expect(
      screen.getByText(method.primaryResponse.type.name)
    ).toBeInTheDocument()
  })

  test('it renders HTTP portion of a method', () => {
    renderWithTheme(<DocOperation method={method} />)
    expect(
      screen.getByText(`${method.httpMethod}: ${method.endpoint}`)
    ).toBeInTheDocument()
  })
})
