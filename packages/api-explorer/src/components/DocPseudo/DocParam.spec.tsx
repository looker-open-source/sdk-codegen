import React from 'react'
import { renderWithTheme } from '@looker/components-test-utils'
import { screen, waitFor, fireEvent } from '@testing-library/react'

import { api } from '../../test-data'
import { DocParam } from './DocParam'

describe('DocParam', () => {
  const allParams = api.methods.run_look.allParams
  const optionalParam = allParams.filter((val) => !val.required)[0]
  const requiredParam = allParams.filter((val) => val.required)[0]

  test('it renders', () => {
    renderWithTheme(<DocParam parameter={requiredParam} />)
    expect(screen.getByText(requiredParam.name)).toBeInTheDocument()
  })

  test('it renders required params with a tooltip', async () => {
    renderWithTheme(<DocParam parameter={requiredParam} />)
    const arg = screen.getByText(requiredParam.name)
    fireEvent.mouseOver(arg)
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveTextContent(
        `${requiredParam.type.name} ${requiredParam.description}`
      )
    })
  })

  test('optional params in square brackets', () => {
    renderWithTheme(<DocParam parameter={optionalParam} />)
    expect(screen.getByText(`[${optionalParam.name}]`)).toBeInTheDocument()
  })
})
