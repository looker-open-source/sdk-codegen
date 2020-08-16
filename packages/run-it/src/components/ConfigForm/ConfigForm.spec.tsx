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
import userEvent from '@testing-library/user-event'
import { ConfigForm, defaultConfigurator, RunItConfigKey } from '.'

describe('ConfigForm', () => {
  // https://testing-library.com/docs/guide-which-query

  beforeEach(() => {
    defaultConfigurator.removeStorage(RunItConfigKey)
  })

  test('it creates an empty config form without stored config', async () => {
    renderWithTheme(<ConfigForm configurator={defaultConfigurator} />)
    const title = screen.getByRole('heading') as HTMLHeadingElement
    expect(title).toHaveTextContent('RunIt Configuration')

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

    expect(
      screen.getByRole('button', {
        name: 'Save',
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'Remove',
      })
    ).toBeInTheDocument()
  })

  test('it disables and enable save for bad and good urls', async () => {
    renderWithTheme(<ConfigForm configurator={defaultConfigurator} />)
    const apiUrl = screen.getByRole('textbox', {
      name: /API server url/i,
    }) as HTMLInputElement
    expect(apiUrl).toBeInTheDocument()
    expect(apiUrl).toHaveValue('')

    await userEvent.type(apiUrl, 'bad')
    await waitFor(() => {
      const button = screen.getByRole('button', {
        name: 'Save',
      }) as HTMLButtonElement
      expect(button).toBeInTheDocument()
      expect(button).not.toBeEnabled()
      expect(screen.getByText(`'bad' is not a valid url`)).toBeInTheDocument()
    })

    fireEvent.change(apiUrl, { target: { value: '' } })
    await userEvent.type(apiUrl, 'https:good')
    await waitFor(() => {
      expect(apiUrl).toHaveValue('https://good')
      const button = screen.getByRole('button', {
        name: 'Save',
      }) as HTMLButtonElement
      expect(button).toBeInTheDocument()
      expect(button).toBeEnabled()
    })
  })

  test('it saves and clears storage', async () => {
    renderWithTheme(<ConfigForm configurator={defaultConfigurator} />)
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

    const save = screen.getByRole('button', {
      name: 'Save',
    }) as HTMLButtonElement
    expect(save).toBeInTheDocument()

    const remove = screen.getByRole('button', {
      name: 'Remove',
    }) as HTMLButtonElement
    expect(remove).toBeInTheDocument()

    await userEvent.type(apiUrl, 'https://foo:199')
    await userEvent.type(authUrl, 'https://foo:99')
    await userEvent.click(save)
    await waitFor(() => {
      const storage = defaultConfigurator.getStorage(RunItConfigKey)
      expect(storage.location).toEqual('local')
      expect(JSON.parse(storage.value)).toEqual({
        base_url: 'https://foo:199',
        looker_url: 'https://foo:99',
      })
    })

    await userEvent.click(remove)
    await waitFor(() => {
      const storage = defaultConfigurator.getStorage(RunItConfigKey)
      expect(storage.location).toEqual('session')
      expect(storage.value).toEqual('')
    })
  })

  test('it can have a custom tile', () => {
    renderWithTheme(
      <ConfigForm title="New title" configurator={defaultConfigurator} />
    )
    const title = screen.getByRole('heading') as HTMLHeadingElement
    expect(title.textContent).toEqual('New title')
  })

  test('it gets config from local storage', async () => {
    defaultConfigurator.setStorage(
      RunItConfigKey,
      JSON.stringify({
        base_url: 'http://locb',
        looker_url: 'http://local',
      }),
      'local'
    )

    renderWithTheme(<ConfigForm configurator={defaultConfigurator} />)
    const title = screen.getByRole('heading') as HTMLHeadingElement
    expect(title).toHaveTextContent('RunIt Configuration')

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

    fireEvent.change(apiUrl, { target: { value: apiUrl.value } })
    await waitFor(() => {
      const button = screen.getByRole('button', {
        name: 'Save',
      }) as HTMLButtonElement
      expect(button).toBeInTheDocument()
    })
  })
})
