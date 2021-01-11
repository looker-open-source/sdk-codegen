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
import { methodRefs, typeRefs } from '@looker/sdk-codegen'
import { screen } from '@testing-library/react'

import { renderWithSearchAndRouter } from '../../test-utils'
import { api } from '../../test-data'
import { DocReferences } from './DocReferences'

describe('DocReferences', () => {
  test('it renders method and type references', () => {
    const seeTypes = typeRefs(api, api.types.Dashboard.customTypes)
    const seeMethods = methodRefs(api, api.types.Dashboard.methodRefs)
    renderWithSearchAndRouter(
      <DocReferences
        seeTypes={seeTypes}
        seeMethods={seeMethods}
        specKey={'3.1'}
        api={api}
      />
    )
    expect(screen.getAllByRole('link')).toHaveLength(
      seeTypes.length + seeMethods.length
    )
    expect(screen.getByText(seeTypes[0].name).closest('a')).toHaveAttribute(
      'href',
      `/3.1/types/${seeTypes[0].name}`
    )
    expect(screen.getByText(seeMethods[0].name).closest('a')).toHaveAttribute(
      'href',
      `/3.1/methods/Dashboard/${seeMethods[0].name}`
    )
  })

  test('it highlights text matching search pattern', () => {
    const highlightPattern = 'dash'
    renderWithSearchAndRouter(
      <DocReferences
        seeTypes={[api.types.Dashboard]}
        specKey={'3.1'}
        api={api}
      />,
      highlightPattern
    )
    const foundRef = screen.getByRole('link')
    expect(foundRef).toContainHTML('<span class="hi">Dash</span>board')
    expect(foundRef).toHaveAttribute('href', '/3.1/types/Dashboard')
  })
})
