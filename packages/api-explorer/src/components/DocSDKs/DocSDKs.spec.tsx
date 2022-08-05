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
import { screen } from '@testing-library/react'
import { codeGenerators } from '@looker/sdk-codegen'
import type { Store } from 'redux'

import { api } from '../../test-data'
import { renderWithReduxProvider, createTestStore } from '../../test-utils'
import type { RootState } from '../../state'
import { getAliasByLanguage } from '../../utils'
import { DocSDKs } from './DocSDKs'

describe('DocSDKs', () => {
  let store: Store<RootState>
  const supportedLanguages = codeGenerators.map((g) => g.language)
  const pattern = new RegExp(`${supportedLanguages.join('|')}`)

  beforeAll(() => {
    store = createTestStore({
      settings: {
        initialized: false,
        sdkLanguage: 'All',
      },
    })
  })

  test.each([
    ['method', { method: api.methods.run_look }],
    ['type', { type: api.types.Look }],
  ])(
    'it can render an SDK declaration for all supported languages',
    (_, props) => {
      renderWithReduxProvider(<DocSDKs api={api} {...props} />, store)
      expect(
        screen.getAllByRole('tab', {
          name: pattern,
        })
      ).toHaveLength(supportedLanguages.length)
    }
  )

  test.each(supportedLanguages)(
    'it can render a %s method declaration',
    (sdkLanguage) => {
      store = createTestStore({
        settings: {
          initialized: false,
          sdkLanguage: getAliasByLanguage(sdkLanguage),
        },
      })
      renderWithReduxProvider(
        <DocSDKs api={api} method={api.methods.run_look} />,
        store
      )
      expect(screen.queryByRole('tab')).not.toBeInTheDocument()
      expect(
        screen.getByRole('heading', { name: `${sdkLanguage} Declaration` })
      ).toBeInTheDocument()
    }
  )
})
