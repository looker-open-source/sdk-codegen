import React from 'react'
import { methodRefs, typeRefs } from '@looker/sdk-codegen'
import { screen } from '@testing-library/react'

import { renderWithSearchAndRouter } from '../../test-utils'
import { api } from '../../test-data'
import { DocReferences } from './DocReferences'

describe('DocReferences', () => {
  test('it renders type references', () => {
    const refs = typeRefs(api, api.types.Dashboard.customTypes)
    renderWithSearchAndRouter(
      <DocReferences items={refs} specKey={'3.1'} api={api} />
    )
    const foundRefs = screen.getAllByRole('link')
    expect(foundRefs.length).toEqual(refs.length)
    expect(foundRefs[0]).toHaveAttribute('href', `/3.1/types/${refs[0].name}`)
  })

  test('it renders method references', () => {
    const refs = methodRefs(api, api.types.Dashboard.methodRefs)
    renderWithSearchAndRouter(
      <DocReferences items={refs} specKey={'3.1'} api={api} />
    )
    const foundRefs = screen.getAllByRole('link')
    expect(foundRefs.length).toEqual(refs.length)
    expect(foundRefs[0]).toHaveAttribute(
      'href',
      `/3.1/methods/Dashboard/${refs[0].name}`
    )
  })

  test('it highlights text matching search pattern', () => {
    const ref = api.methods.create_dashboard
    const highlightPattern = 'dash'
    renderWithSearchAndRouter(
      <DocReferences items={[ref]} specKey={'3.1'} api={api} />,
      highlightPattern
    )
    const foundRef = screen.getByRole('link')
    expect(foundRef).toContainHTML('create_<span class="hi">dash</span>board')
    expect(foundRef).toHaveAttribute(
      'href',
      '/3.1/methods/Dashboard/create_dashboard'
    )
  })
})
