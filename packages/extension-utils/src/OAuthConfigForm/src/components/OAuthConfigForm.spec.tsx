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
import type { ReactElement } from 'react'
import React from 'react'
import type { Store } from 'redux'
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
import type { ValidationMessages } from '@looker/components'
import type { ILookerVersions } from '@looker/sdk-codegen'
import type { OAuthFormState } from '../types'
import { OAuthFormSlice, defaultOAuthFormState } from '../state/slice'
import { OAuthConfigForm } from '..'
import type { ConfigValues } from '../utils'
import { getVersions } from '../utils'

import {
  BrowserAdaptor,
  registerTestEnvAdaptor,
  OAuthConfigProvider,
} from '@looker/extension-utils'

const mockedVersionRes = {
  looker_release_version: '23.4.30',
  current_version: {
    version: '4.0',
    full_version: '4.0.23.4',
    status: 'current',
    swagger_url: 'https://devtools.cloud.looker.com/api/4.0/swagger.json',
  },
  supported_versions: [
    {
      version: '3.0',
      full_version: '3.0.0',
      status: 'legacy',
      swagger_url: 'https://devtools.cloud.looker.com/api/3.0/swagger.json',
    },
    {
      version: '3.1',
      full_version: '3.1.0',
      status: 'legacy',
      swagger_url: 'https://devtools.cloud.looker.com/api/3.1/swagger.json',
    },
    {
      version: '4.0',
      full_version: '4.0.23.4',
      status: 'current',
      swagger_url: 'https://devtools.cloud.looker.com/api/4.0/swagger.json',
    },
  ],
  api_server_url: 'https://devtools.cloud.looker.com',
  web_server_url: 'https://devtools.cloud.looker.com',
}

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

jest.mock('../utils', () => ({
  __esModule: true,
  ...jest.requireActual('../utils'),
  getVersions: jest.fn().mockResolvedValue(),
}))

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

const renderWithReduxProvider = (
  consumers: ReactElement<any>,
  store: Store<{ OauthConfigForm: OAuthFormState }>
) => renderWithTheme(withReduxProvider(consumers, store))

type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>
}

const createTestStore = (overrides: DeepPartial<OAuthFormState>) =>
  createStore({
    preloadedState: {
      OauthConfigForm: {
        ...defaultOAuthFormState,
        ...overrides,
      } as OAuthFormState,
    },
    reducer: {
      OauthConfigForm: OAuthFormSlice.reducer,
    },
  })

const withReduxProvider = (
  consumers: ReactElement<any>,
  store: Store<{ OauthConfigForm: OAuthFormState }>
) => {
  return <Provider store={store}>{consumers}</Provider>
}

describe('ConfigForm', () => {
  const adaptor = new BrowserAdaptor(initSdk())
  registerTestEnvAdaptor(adaptor)

  const apiLabel = /API server URL/i
  const authLabel = /OAuth server URL/i
  beforeEach(() => {
    localStorage.removeItem(ConfigKey)
  })

  test('it renders with default values', async () => {
    const storeState = {}
    const store = createTestStore(storeState)

    renderWithReduxProvider(
      <OAuthConfigForm
        configKey={ConfigKey}
        clientId="looker.cool-client"
        clientLabel="Looker Cool Client"
      />,
      store
    )

    expect(
      screen.getByRole('heading', { name: 'Looker OAuth Configuration' })
    ).toBeInTheDocument()

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

  test('it disables verify button if url is not valid', async () => {
    const storeState = {
      apiServerUrlValue: 'nonValidUrl',
      validationMessages: {
        baseUrl: {
          type: 'error',
          message: 'nonValidUrl is not a valid url',
        },
      } as ValidationMessages,
    } as OAuthFormState
    const store = createTestStore(storeState)

    renderWithReduxProvider(
      <OAuthConfigForm
        configKey={ConfigKey}
        clientId="looker.cool-client"
        clientLabel="Looker Cool Client"
      />,
      store
    )

    expect(
      screen.getByRole('heading', { name: 'Looker OAuth Configuration' })
    ).toBeInTheDocument()

    const apiUrl = screen.getByRole('textbox', {
      name: apiLabel,
    }) as HTMLInputElement
    expect(apiUrl).toBeInTheDocument()
    expect(apiUrl).toHaveValue(storeState.apiServerUrlValue)

    const verifyBtn = screen.getByRole('button', { name: 'Verify' })

    expect(verifyBtn).toBeInTheDocument()
    expect(verifyBtn).toBeDisabled()
    expect(
      screen.getByText('nonValidUrl is not a valid url')
    ).toBeInTheDocument()
  })

  test('it adds validation error on type', async () => {
    const storeState = {} as OAuthFormState
    const store = createTestStore(storeState)

    renderWithReduxProvider(
      <OAuthConfigForm
        configKey={ConfigKey}
        clientId="looker.cool-client"
        clientLabel="Looker Cool Client"
      />,
      store
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

  test('it calls adaptors login on login click', async () => {
    adaptor.login = jest.fn()

    const storeState = {
      apiServerUrlValue: 'https://devtools.cloud.looker.com',
      webUrlValue: 'https://devtools.cloud.looker.com',
      savedConfig: {
        base_url: 'https://devtools.cloud.looker.com',
        looker_url: 'https://devtools.cloud.looker.com',
      } as ConfigValues,
    } as OAuthFormState
    const store = createTestStore(storeState)

    renderWithReduxProvider(
      <OAuthConfigForm
        configKey={ConfigKey}
        clientId="looker.cool-client"
        clientLabel="Looker Cool Client"
      />,
      store
    )

    const loginBtn = screen.getByRole('button', {
      name: 'Login',
    })

    expect(loginBtn).toBeInTheDocument()
    expect(loginBtn).toBeEnabled()
    fireEvent.click(loginBtn)

    await expect(adaptor.login).toHaveBeenCalled()
  })

  describe('verify function', () => {
    test('it shows Oauth help message, success banner, and updates web_url on successful verify', async () => {
      const clientLabel = 'Looker Cool Client'
      const storeState = {
        apiServerUrlValue: 'https://devtools.cloud.looker.com',
      } as OAuthFormState
      const store = createTestStore(storeState)
      getVersions.mockResolvedValue(mockedVersionRes as ILookerVersions)

      renderWithReduxProvider(
        <OAuthConfigForm
          configKey={ConfigKey}
          clientId="looker.cool-client"
          clientLabel={clientLabel}
        />,
        store
      )

      const authUrl = screen.getByRole('textbox', {
        name: authLabel,
      }) as HTMLInputElement
      expect(authUrl).toBeInTheDocument()
      expect(authUrl).toHaveValue('')

      const button = screen.getByRole('button', {
        name: 'Verify',
      }) as HTMLButtonElement
      expect(button).toBeInTheDocument()
      expect(button).toBeEnabled()

      fireEvent.click(button)
      expect(getVersions).toHaveBeenCalledWith(
        'https://devtools.cloud.looker.com/versions'
      )

      await waitFor(() => {
        expect(screen.getByText('Configuration is valid')).toBeInTheDocument()
        const helpMessage = screen.queryByText((text) =>
          text.includes(
            'If API Explorer is also installed, the configuration below can be used to'
          )
        )
        expect(helpMessage).toBeVisible()
        expect(authUrl).toHaveValue(mockedVersionRes.web_server_url)
      })
    })

    test('it shows Oauth help message and error banner on failed verify', async () => {
      const clientLabel = 'Looker Cool Client'
      const storeState = {
        apiServerUrlValue: 'https://devtools.cloud.looker.com',
      } as OAuthFormState
      const store = createTestStore(storeState)
      const mockErrorMessage = 'This is the mock error.'

      getVersions.mockRejectedValueOnce(new Error(mockErrorMessage))

      renderWithReduxProvider(
        <OAuthConfigForm
          configKey={ConfigKey}
          clientId="looker.cool-client"
          clientLabel={clientLabel}
        />,
        store
      )

      const authUrl = screen.getByRole('textbox', {
        name: authLabel,
      }) as HTMLInputElement
      expect(authUrl).toBeInTheDocument()
      expect(authUrl).toHaveValue('')

      const button = screen.getByRole('button', {
        name: 'Verify',
      }) as HTMLButtonElement
      expect(button).toBeInTheDocument()
      expect(button).toBeEnabled()

      fireEvent.click(button)
      expect(getVersions).toHaveBeenCalledWith(
        'https://devtools.cloud.looker.com/versions'
      )

      await waitFor(() => {
        expect(screen.getByText(mockErrorMessage)).toBeInTheDocument()
        const helpMessage = screen.queryByText((text) =>
          text.includes(
            'If API Explorer is also installed, the configuration below can be used to'
          )
        )
        expect(helpMessage).toBeVisible()
      })
    })
  })

  describe('storage', () => {
    test('it renders with a savedConfig in localstorage', async () => {
      const savedConfig = {
        base_url: 'http://locb',
        looker_url: 'http://local',
      }
      const storeState = {} as OAuthFormState
      const store = createTestStore(storeState)

      const getLocalStorageSpy = jest
        .spyOn(window.localStorage, 'getItem')
        .mockReturnValue(JSON.stringify(savedConfig))

      renderWithReduxProvider(
        <OAuthConfigForm
          configKey={ConfigKey}
          clientId="looker.cool-client"
          clientLabel="Looker Cool Client"
        />,
        store
      )

      expect(getLocalStorageSpy).toHaveBeenCalledWith(ConfigKey)
      const apiUrl = screen.getByRole('textbox', {
        name: apiLabel,
      }) as HTMLInputElement
      expect(apiUrl).toBeInTheDocument()
      expect(apiUrl).toHaveValue(savedConfig.base_url)

      const authUrl = screen.getByRole('textbox', {
        name: authLabel,
      }) as HTMLInputElement
      expect(authUrl).toBeInTheDocument()
      expect(authUrl).toHaveValue(savedConfig.looker_url)
    })

    test('it clears storage', async () => {
      const savedConfig = {
        base_url: 'http://locb',
        looker_url: 'http://local',
      }
      const storeState = {} as OAuthFormState
      const store = createTestStore(storeState)

      const getLocalStorageSpy = jest
        .spyOn(window.localStorage, 'getItem')
        .mockReturnValue(JSON.stringify(savedConfig))
      const removeItem = jest.spyOn(window.localStorage, 'removeItem')

      renderWithReduxProvider(
        <OAuthConfigForm
          configKey={ConfigKey}
          clientId="looker.cool-client"
          clientLabel="Looker Cool Client"
        />,
        store
      )

      const clearBtn = screen.getByRole('button', {
        name: 'Clear',
      })

      expect(getLocalStorageSpy).toHaveBeenCalledWith(ConfigKey)
      const apiUrl = screen.getByRole('textbox', {
        name: apiLabel,
      }) as HTMLInputElement
      expect(apiUrl).toBeInTheDocument()
      expect(apiUrl).toHaveValue(savedConfig.base_url)

      const authUrl = screen.getByRole('textbox', {
        name: authLabel,
      }) as HTMLInputElement
      expect(authUrl).toBeInTheDocument()
      expect(authUrl).toHaveValue(savedConfig.looker_url)

      fireEvent.click(clearBtn)
      expect(removeItem).toHaveBeenCalledWith(ConfigKey)
    })

    test('it saves storage', async () => {
      const storeState = {
        apiServerUrlValue: 'http://locb',
        webUrlValue: 'http://local',
      } as OAuthFormState
      const store = createTestStore(storeState)
      getVersions.mockResolvedValue(mockedVersionRes as ILookerVersions)

      const setItem = jest.spyOn(window.localStorage, 'setItem')

      renderWithReduxProvider(
        <OAuthConfigForm
          configKey={ConfigKey}
          clientId="looker.cool-client"
          clientLabel="Looker Cool Client"
        />,
        store
      )

      const saveBtn = screen.getByRole('button', {
        name: 'Save',
      })
      fireEvent.click(saveBtn)

      await waitFor(() => {
        expect(setItem).toHaveBeenCalled()
      })
    })
  })
})
