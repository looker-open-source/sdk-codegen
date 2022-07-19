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

import { renderWithTheme } from '@looker/components-test-utils'
import { act, screen } from '@testing-library/react'
import React from 'react'
import userEvent from '@testing-library/user-event'
import { CopyLinkButton } from '@looker/api-explorer'

describe('CopyLinkButton', () => {
  test('it renders', () => {
    renderWithTheme(<CopyLinkButton top={'1px'} right={'1px'} visible={true} />)
    expect(screen.getByText('Copy link to this page view')).toBeInTheDocument()
  })

  const mockClipboardCopy = jest.fn()
  jest.mock('navigator', () => {
    return {
      clipboard: () => ({
        writeText: mockClipboardCopy,
      }),
    }
  })
  test('it copies to clipboard', () => {
    jest.spyOn(navigator.clipboard, 'writeText')
    renderWithTheme(<CopyLinkButton top={'1px'} right={'1px'} visible={true} />)
    act(() => {
      userEvent.click(screen.getByRole('button'))
      expect(mockClipboardCopy).toHaveBeenCalledWith(location.href)
    })
  })
})
