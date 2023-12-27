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
import type { IDeclarationMine } from '@looker/sdk-codegen'
import { codeSearchLink } from '@looker/sdk-codegen'
import userEvent from '@testing-library/user-event'
import { api } from '../../test-data'
import { renderWithLode } from '../../test-utils'
import { DocSource } from './DocSource'

describe('DocSource', () => {
  const examples = {
    commitHash: 'ac58fabde00090162d71d6a430ba061a236b1997',
    remoteOrigin: 'https://github.com/looker-open-source/sdk-codegen',
    summaries: {
      'packages/sdk-codegen/src/codeGenerators.ts': {
        summary: '`codeGenerators.ts`',
        sourceFile: 'packages/sdk-codegen/src/codeGenerators.ts',
      },
    },
    nuggets: {
      AuthRequest: {
        operationId: 'AuthRequest',
        calls: {
          '.cs': [
            {
              sourceFile: 'csharp/rtl.Tests/ApiMethodsTests.cs',
              column: 38,
              line: 48,
            },
          ],
        },
      },
    },
  }

  const method = api.methods.login
  const type = api.types.Query

  const declarations: IDeclarationMine = {
    commitHash: '1546035fd531c14a1172c9ad5c5b70e5279c1980',
    remoteOrigin: 'https://github.com/looker/helltool',
    types: {
      Query: {
        line: 2,
        sourceFile: 'lib/looker/core/mappers/query_mapper.rb',
      },
    },
    methods: {
      'POST /login': {
        line: 49,
        sourceFile: 'lib/looker/core/controllers/auth_controller.rb',
      },
    },
  }

  test('it renders a type declaration link', async () => {
    renderWithLode(<DocSource type={type} />, examples, declarations)
    const link = screen.getByRole('link')
    const declaration = declarations.types.Query
    const expected = codeSearchLink(
      declarations.remoteOrigin,
      declarations.commitHash,
      declaration.sourceFile,
      declaration.line
    )
    expect(link.closest('a')).toHaveAttribute('href', expected)
    await userEvent.hover(link)
    expect(screen.getByRole('tooltip')).toHaveTextContent(
      `${declaration.sourceFile}#L${declaration.line}`
    )
  })

  test('it renders a method declaration link', async () => {
    renderWithLode(<DocSource method={method} />, examples, declarations)
    const link = screen.getByRole('link')
    const declaration = declarations.methods['POST /login']
    const expected = codeSearchLink(
      declarations.remoteOrigin,
      declarations.commitHash,
      declaration.sourceFile,
      declaration.line
    )
    expect(link.closest('a')).toHaveAttribute('href', expected)
    await userEvent.hover(link)
    expect(screen.getByRole('tooltip')).toHaveTextContent(
      `${declaration.sourceFile}#L${declaration.line}`
    )
  })
})
