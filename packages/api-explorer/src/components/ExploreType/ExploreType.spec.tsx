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
import { screen } from '@testing-library/react'
import { api } from '../../test-data'
import { renderWithRouter, renderWithSearchAndRouter } from '../../test-utils'
import { ExploreType, ExploreTypeLink } from '.'
import { MemoryRouter } from 'react-router-dom'

describe('ExploreType', () => {
  const targetType = api.types.ColorCollection
  const colors = 'colors'
  const colorsExpected = 1
  const stops = 'stops'
  const stopsExpected = 2
  const offset = 'offset'
  const offsetExpected = 2

  test('expands all when openAll is true and expand defaults', () => {
    renderWithSearchAndRouter(<ExploreType type={targetType} openAll={true} />)

    expect(screen.getByText(targetType.jsonName)).toBeInTheDocument()
    expect(screen.queryAllByText(colors)).toHaveLength(colorsExpected)
    expect(screen.queryAllByText(stops)).toHaveLength(stopsExpected)
    expect(screen.queryAllByText(offset)).toHaveLength(offsetExpected)
  })

  test('expands nothing if maxDepth is 0', () => {
    renderWithSearchAndRouter(
      <ExploreType type={targetType} openAll={true} maxDepth={0} />
    )

    expect(screen.getByText(targetType.jsonName)).toBeInTheDocument()
    expect(screen.queryAllByText(colors)).toHaveLength(0)
    expect(screen.queryAllByText(stops)).toHaveLength(0)
    expect(screen.queryAllByText(offset)).toHaveLength(0)
  })

  test('expands 2 levels only', () => {
    renderWithSearchAndRouter(
      <ExploreType type={targetType} maxDepth={2} openAll={true} />
    )

    expect(screen.getByText(targetType.jsonName)).toBeInTheDocument()
    expect(screen.queryAllByText(colors)).toHaveLength(colorsExpected)
    expect(screen.queryAllByText(stops)).toHaveLength(stopsExpected)
    expect(screen.queryAllByText(offset)).toHaveLength(0)
  })

  describe('ExploreTypeLink', () => {
    test('recognizes 3.1', () => {
      const specKey = '3.1'
      const path = `/${specKey}/methods/foo`
      renderWithRouter(
        <MemoryRouter initialEntries={[path]}>
          <ExploreTypeLink type={targetType} />
        </MemoryRouter>
      )

      const actual = screen.getByText(targetType.jsonName)
      expect(actual).toBeInTheDocument()
      expect(actual).toHaveProperty(
        'href',
        `http://localhost/${specKey}/types/${targetType.jsonName}`
      )
    })
    test('recognizes 4.0', () => {
      const specKey = '4.0'
      const path = `/${specKey}/methods/foo`
      renderWithRouter(
        <MemoryRouter initialEntries={[path]}>
          <ExploreTypeLink type={targetType} />
        </MemoryRouter>
      )

      const actual = screen.getByText(targetType.jsonName)
      expect(actual).toBeInTheDocument()
      expect(actual).toHaveProperty(
        'href',
        `http://localhost/${specKey}/types/${targetType.jsonName}`
      )
    })
    test('recognizes anything', () => {
      const specKey = 'anything'
      const path = `/${specKey}/methods/foo`
      renderWithRouter(
        <MemoryRouter initialEntries={[path]}>
          <ExploreTypeLink type={targetType} />
        </MemoryRouter>
      )

      const actual = screen.getByText(targetType.jsonName)
      expect(actual).toBeInTheDocument()
      expect(actual).toHaveProperty(
        'href',
        `http://localhost/${specKey}/types/${targetType.jsonName}`
      )
    })
    test('ignores oauth path', () => {
      const specKey = 'oauth'
      const path = `/${specKey}/methods/foo`
      renderWithRouter(
        <MemoryRouter initialEntries={[path]}>
          <ExploreTypeLink type={targetType} />
        </MemoryRouter>
      )
      const actual = screen.getByText(targetType.jsonName)
      expect(actual).toBeInTheDocument()
      expect(actual).toHaveProperty(
        'href',
        `http://types/${targetType.jsonName}`
      )
    })
  })
})
