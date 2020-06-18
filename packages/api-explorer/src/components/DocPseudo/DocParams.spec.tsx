import React from 'react'
import { screen } from '@testing-library/react'
import { renderWithTheme } from '@looker/components-test-utils'

import { api } from '../../test-data'
import { DocParams } from './DocParams'

describe('DocParams', () => {
  test('it works when method only has required params', () => {
    const params = api.methods['create_connection'].allParams
    expect(params).toHaveLength(1)
    expect(params[0]).toHaveProperty('required', true)

    renderWithTheme(<DocParams parameters={params} />)
    expect(screen.getByText(params[0].name)).toBeInTheDocument()
  })

  test('it works when method only has optional params', () => {
    const params = api.methods['me'].allParams
    expect(params).toHaveLength(1)
    expect(params[0]).toHaveProperty('required', false)

    renderWithTheme(<DocParams parameters={params} />)
    expect(screen.getByText(`[${params[0].name}]`)).toBeInTheDocument()
  })

  test('it works when method has both required and optional params', () => {
    const params = api.methods['user'].allParams
    const requiredParams = params.filter((param) => param.required)
    const optionalParams = params.filter((param) => !param.required)
    expect(requiredParams).toHaveLength(1)
    expect(optionalParams).toHaveLength(1)

    renderWithTheme(<DocParams parameters={params} />)
    expect(screen.getByText(requiredParams[0].name)).toBeInTheDocument()
    expect(screen.getByText(`[${optionalParams[0].name}]`)).toBeInTheDocument()
  })
})
