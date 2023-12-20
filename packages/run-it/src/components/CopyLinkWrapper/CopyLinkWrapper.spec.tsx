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
import { screen, waitFor } from '@testing-library/react'
import React from 'react'
import userEvent from '@testing-library/user-event'
import { BrowserAdaptor, registerTestEnvAdaptor } from '@looker/extension-utils'
import { CopyLinkWrapper } from './index'
import { initRunItSdk } from '@looker/run-it'

jest.mock('react-router-dom', () => {
  const ReactRouterDOM = jest.requireActual('react-router-dom')
  return {
    ...ReactRouterDOM,
    useLocation: () => ({
      pathname: globalThis.location.pathname,
      search: globalThis.location.search,
    }),
  }
})

describe('CopyLinkWrapper', () => {
  test('it renders and hides button upon mouse hover', async () => {
    renderWithTheme(
      <CopyLinkWrapper>
        <div>test</div>
      </CopyLinkWrapper>
    )
    const div = screen.getByText('test')
    await userEvent.hover(div)
    expect(screen.queryByRole('button')).toBeInTheDocument()
    await userEvent.unhover(div)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  const mockClipboardCopy = jest
    .fn()
    .mockImplementation(() => Promise.resolve())
  Object.assign(navigator, {
    clipboard: {
      writeText: mockClipboardCopy,
    },
  })

  test('it copies to clipboard', async () => {
    registerTestEnvAdaptor()
    jest.spyOn(navigator.clipboard, 'writeText')
    renderWithTheme(
      <CopyLinkWrapper visible={true}>
        <div>test</div>
      </CopyLinkWrapper>
    )
    const div = screen.getByText('test')
    await userEvent.hover(div)
    await userEvent.click(screen.getByRole('button'))
    expect(mockClipboardCopy).toHaveBeenCalledWith(location.href)
  })

  test('it updates tooltip content upon copy', async () => {
    const sdk = initRunItSdk()
    registerTestEnvAdaptor(new BrowserAdaptor(sdk))
    renderWithTheme(
      <CopyLinkWrapper visible={true}>
        <div>test</div>
      </CopyLinkWrapper>
    )
    const div = screen.getByText('test')
    await userEvent.hover(div)
    const button = screen.getByRole('button')
    await userEvent.hover(button)
    expect(screen.getAllByText('Copy to clipboard')[0]).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button'))
    expect(mockClipboardCopy).toHaveBeenCalledWith(location.href)
    await userEvent.hover(button)
    const copied = screen.getAllByText('Copied to clipboard')
    expect(copied[0]).toBeInTheDocument() // TODO why does .toBeVisible() fail now?
  })
})
