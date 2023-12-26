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
import { renderWithTheme } from '@looker/components-test-utils'
import userEvent from '@testing-library/user-event'
import { screen } from '@testing-library/react'

import { pythonTestCode } from '../test-data'
import { CodeEditor } from './CodeEditor'

describe('CodeEditor', () => {
  const setState = jest.fn()
  const useStateSpy = jest.spyOn(React, 'useState')
  useStateSpy.mockImplementation(() => [pythonTestCode, setState])

  test('it syntax highlights', () => {
    renderWithTheme(
      <CodeEditor onChange={setState} code={pythonTestCode} language="python" />
    )
    expect(screen.getByText('all_lookml_models').closest('span')).toHaveClass(
      'function'
    )
    expect(screen.getByText('def').closest('span')).toHaveClass('keyword')
    expect(
      screen
        .getByText('# GET /lookml_models -> Sequence[models.LookmlModel]')
        .closest('span')
    ).toHaveClass('comment')
  })
  test('it is edittable', async () => {
    renderWithTheme(
      <CodeEditor onChange={setState} code={pythonTestCode} language="python" />
    )
    const editPattern = '\n# This is the new code'
    const input = screen
      .getByRole('code-editor')
      .getElementsByClassName(
        'npm__react-simple-code-editor__textarea'
      )[0] as HTMLElement
    await userEvent.click(input)
    // await userEvent.pointer({ target: input, offset: pythonTestCode.length })
    await userEvent.paste(input, editPattern, undefined, {
      initialSelectionEnd: pythonTestCode.length,
    })
    expect(setState).toHaveBeenCalledWith(pythonTestCode + editPattern)
  })
})
