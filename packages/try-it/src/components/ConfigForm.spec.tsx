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
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { renderWithTheme } from '@looker/components-test-utils'
import { removeConfig, setConfig, TryItConfigKey } from './configUtils'
import { ConfigForm } from './ConfigForm'

describe('ConfigForm', () => {
  // const handleSubmit = jest.fn((e) => e.preventDefault())
  // const setRequestContent = jest.fn()
  // https://testing-library.com/docs/guide-which-query

  beforeEach(() => {
    removeConfig(TryItConfigKey)
  })

  // TODO get button disabled tests working
  // TODO check URL validation error messages
  // TODO check required errors
  test('it creates an empty config form without stored config', async () => {
    renderWithTheme(<ConfigForm />)
    const title = screen.getByRole('heading') as HTMLHeadingElement
    expect(title).toHaveTextContent('TryIt Configuration')

    const apiUrl = screen.getByRole('textbox', {
      name: /API server url/i,
    }) as HTMLInputElement
    expect(apiUrl).toBeInTheDocument()
    expect(apiUrl).toHaveValue('')

    const authUrl = screen.getByRole('textbox', {
      name: /Auth server Url/i,
    }) as HTMLInputElement
    expect(authUrl).toBeInTheDocument()
    expect(authUrl).toHaveValue('')

    const session = screen.getByRole('radio', {
      name: /session/i,
    }) as HTMLInputElement
    expect(session).toBeInTheDocument()
    expect(session).toBeChecked()

    const local = screen.getByRole('radio', {
      name: /local/i,
    }) as HTMLInputElement
    expect(local).toBeInTheDocument()
    expect(local).not.toBeChecked()

    fireEvent.change(apiUrl, { target: { value: '' } })
    await waitFor(() => {
      const button = screen.getByRole('button', {
        name: 'Save',
      }) as HTMLButtonElement
      expect(button).toBeInTheDocument()
      expect(button).not.toBeEnabled()
    })
  })

  test('it can have a custom tile', () => {
    renderWithTheme(<ConfigForm title="New title" />)
    const title = screen.getByRole('heading') as HTMLHeadingElement
    expect(title.textContent).toEqual('New title')
  })

  test('it gets config from session storage', async () => {
    setConfig(
      TryItConfigKey,
      JSON.stringify({
        base_url: 'http://base',
        looker_url: 'http://looker',
      })
    )

    renderWithTheme(<ConfigForm />)
    const title = screen.getByRole('heading') as HTMLHeadingElement
    expect(title).toHaveTextContent('TryIt Configuration')

    const apiUrl = screen.getByRole('textbox', {
      name: /API server url/i,
    }) as HTMLInputElement
    expect(apiUrl).toBeInTheDocument()
    expect(apiUrl).toHaveValue('http://base')

    const authUrl = screen.getByRole('textbox', {
      name: /Auth server Url/i,
    }) as HTMLInputElement
    expect(authUrl).toBeInTheDocument()
    expect(authUrl).toHaveValue('http://looker')

    const session = screen.getByRole('radio', {
      name: /session/i,
    }) as HTMLInputElement
    expect(session).toBeInTheDocument()
    expect(session).toBeChecked()

    const local = screen.getByRole('radio', {
      name: /local/i,
    }) as HTMLInputElement
    expect(local).toBeInTheDocument()
    expect(local).not.toBeChecked()

    fireEvent.change(apiUrl, { target: { value: apiUrl.value } })
    await waitFor(() => {
      const button = screen.getByRole('button', {
        name: 'Save',
      }) as HTMLButtonElement
      expect(button).toBeInTheDocument()
      // expect(button).not.toBeEnabled()
    })
  })

  test('it gets config from local storage', async () => {
    setConfig(
      TryItConfigKey,
      JSON.stringify({
        base_url: 'http://locb',
        looker_url: 'http://local',
      }),
      'local'
    )

    renderWithTheme(<ConfigForm />)
    const title = screen.getByRole('heading') as HTMLHeadingElement
    expect(title).toHaveTextContent('TryIt Configuration')

    const apiUrl = screen.getByRole('textbox', {
      name: /API server url/i,
    }) as HTMLInputElement
    expect(apiUrl).toBeInTheDocument()
    expect(apiUrl).toHaveValue('http://locb')

    const authUrl = screen.getByRole('textbox', {
      name: /Auth server Url/i,
    }) as HTMLInputElement
    expect(authUrl).toBeInTheDocument()
    expect(authUrl).toHaveValue('http://local')

    const session = screen.getByRole('radio', {
      name: /session/i,
    }) as HTMLInputElement
    expect(session).toBeInTheDocument()
    expect(session).not.toBeChecked()

    const local = screen.getByRole('radio', {
      name: /local/i,
    }) as HTMLInputElement
    expect(local).toBeInTheDocument()
    expect(local).toBeChecked()

    fireEvent.change(apiUrl, { target: { value: apiUrl.value } })
    await waitFor(() => {
      const button = screen.getByRole('button', {
        name: 'Save',
      }) as HTMLButtonElement
      expect(button).toBeInTheDocument()
      // expect(button).not.toBeEnabled()
    })
  })
})
