/*

 MIT License

 Copyright (c) 2023 Looker Data Sciences, Inc.

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
import type { IApiSettings } from '@looker/sdk-rtl'
import {
  DefaultSettings,
  BrowserTransport,
  BrowserSession,
} from '@looker/sdk-rtl'
import { functionalSdk40 } from '@looker/sdk'
import { createStore } from '@looker/redux'
import { Provider } from 'react-redux'
import { configureStore, DeepPartial } from '@reduxjs/toolkit'
import type { UpdateFormPayload } from '../types'
import { OauthConfigFormState } from '../types'
import {
  useOauthConfigFormState,
  defaultOauthConfigFormState,
  slice,
} from '../slice'
import { renderWithReduxProvider } from '../../../../../api-explorer/src/test-utils'
import { OAuthConfigForm } from '..'
import {
  BrowserAdaptor,
  registerTestEnvAdaptor,
  OAuthConfigProvider,
} from '@looker/extension-utils'

jest.mock('react-router-dom', () => {
  const ReactRouterDOM = jest.requireActual('react-router-dom')
  return {
    ...ReactRouterDOM,
    useLocation: () => ({
      pathname: '/',
    }),
    useHistory: jest
      .fn()
      .mockReturnValue({ push: jest.fn(), location: globalThis.location }),
  }
})

const ConfigKey = 'ConfigKey'

const initSdk = () => {
  const settings = {
    ...DefaultSettings(),
    base_url: 'https://self-signed.looker.com:19999',
    agentTag: 'EmbedPlayground 0.1',
  } as IApiSettings

  const options = new OAuthConfigProvider(
    settings,
    'looker.my-app-id',
    ConfigKey
  )
  const transport = new BrowserTransport(options)
  const session = new BrowserSession(options, transport)
  const sdk = functionalSdk40(session)
  return sdk
}

export const createTestStore = (overrides?: UpdateFormPayload) =>
  createStore({
    preloadedState: {
      oauthForm: { ...defaultOauthConfigFormState, ...overrides },
    },
    reducer: {
      oauthForm: slice.reducer,
    },
  })

describe('ConfigForm', () => {
  const adaptor = new BrowserAdaptor(initSdk())
  registerTestEnvAdaptor(adaptor)

  const apiLabel = /API server URL/i
  const authLabel = /OAuth server URL/i
  beforeEach(() => {
    localStorage.removeItem(ConfigKey)
  })

  test('it creates an empty config form without stored config', async () => {
    const storeState = {
      apiServerUrlValue: 'abcd',
    }

    // ;(useOauthConfigFormState as jest.Mock).mockReturnValue({
    //   ...defaultOauthConfigFormState,
    //   ...storeState
    // })
    renderWithReduxProvider(
      <OAuthConfigForm
        configKey={ConfigKey}
        clientId="looker.cool-client"
        clientLabel="Looker Cool Client"
      />,
      createTestStore(storeState)
    )

    expect(
      screen.getByRole('heading', { name: 'Looker OAuth Configuration' })
    ).toBeInTheDocument()

    const apiUrl = screen.getByRole('textbox', {
      name: apiLabel,
    }) as HTMLInputElement
    expect(apiUrl).toBeInTheDocument()
    // Todo: this shouldn't be empty according to state
    expect(apiUrl).toHaveValue('')

    const authUrl = screen.getByRole('textbox', {
      name: authLabel,
    }) as HTMLInputElement
    expect(authUrl).toBeInTheDocument()
    expect(authUrl).toHaveValue('')

    expect(
      screen.getByRole('button', {
        name: 'Clear',
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'Verify',
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'Save',
      })
    ).toBeInTheDocument()
  })

  test.skip('it disables and enables verify for bad and good urls', async () => {
    renderWithTheme(
      <OAuthConfigForm
        configKey={ConfigKey}
        clientId="looker.cool-client"
        clientLabel="Looker Cool Client"
      />
    )
    const apiUrl = screen.getByRole('textbox', {
      name: apiLabel,
    }) as HTMLInputElement
    expect(apiUrl).toBeInTheDocument()
    expect(apiUrl).toHaveValue('')

    await userEvent.type(apiUrl, 'bad')
    await waitFor(() => {
      const button = screen.getByRole('button', {
        name: 'Verify',
      }) as HTMLButtonElement
      expect(button).toBeInTheDocument()
      expect(button).toBeDisabled()
      expect(screen.getByText(`'bad' is not a valid url`)).toBeInTheDocument()
    })

    await fireEvent.change(apiUrl, { target: { value: '' } })
    await userEvent.type(apiUrl, 'https:good')
    await waitFor(() => {
      expect(apiUrl).toHaveValue('https://good')
      const button = screen.getByRole('button', {
        name: 'Verify',
      }) as HTMLButtonElement
      expect(button).toBeInTheDocument()
      expect(button).toBeEnabled()
    })
  })

  describe('storage', () => {
    test.skip('it saves and clears storage', async () => {
      // TODO need to rewrite this test
      renderWithTheme(
        <OAuthConfigForm
          configKey={ConfigKey}
          clientId="looker.cool-client"
          clientLabel="Looker Cool Client"
        />
      )
      const apiUrl = screen.getByRole('textbox', {
        name: apiLabel,
      }) as HTMLInputElement
      expect(apiUrl).toBeInTheDocument()
      expect(apiUrl).toHaveValue('')

      const authUrl = screen.getByRole('textbox', {
        name: authLabel,
      }) as HTMLInputElement
      expect(authUrl).toBeInTheDocument()
      expect(authUrl).toHaveValue('')

      const save = screen.getByRole('button', {
        name: 'Save',
      }) as HTMLButtonElement
      expect(save).toBeInTheDocument()

      const clear = screen.getByRole('button', {
        name: 'Clear',
      }) as HTMLButtonElement
      expect(clear).toBeInTheDocument()

      await waitFor(() => {
        const value = localStorage.getItem(ConfigKey)
        expect(value).toBeDefined()
        expect(JSON.parse(value!)).toEqual({
          base_url: 'https://foo:199',
          looker_url: 'https://foo:99',
        })
      })

      await userEvent.click(clear)
      await waitFor(() => {
        const value = localStorage.getItem(ConfigKey)
        expect(value).toBeEmpty()
      })
    })

    test.skip('it shows login section when configured', async () => {
      localStorage.setItem(
        ConfigKey,
        JSON.stringify({
          base_url: 'http://locb',
          looker_url: 'http://local',
        })
      )

      renderWithTheme(
        <OAuthConfigForm
          configKey={ConfigKey}
          clientId="looker.cool-client"
          clientLabel="Looker Cool Client"
        />
      )
      expect(
        screen.getByRole('heading', { name: 'Looker OAuth Configuration' })
      ).toBeInTheDocument()

      expect(
        screen.getByRole('button', {
          name: 'Login',
        })
      ).toBeInTheDocument()
    })
  })
})
