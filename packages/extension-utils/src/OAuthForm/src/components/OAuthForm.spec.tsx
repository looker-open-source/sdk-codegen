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
import { fireEvent, screen } from '@testing-library/react'
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
import type { OAuthFormState } from '../state/slice'
import {
  useOAuthFormState,
  useOAuthFormActions,
  OAuthFormSlice,
  defaultOAuthFormState,
} from '../state/slice'
import { OAuthForm } from '..'
import type { ConfigValues } from '../utils'
import { getVersions } from '../utils'

import {
  BrowserAdaptor,
  registerTestEnvAdaptor,
  OAuthConfigProvider,
} from '@looker/extension-utils'

const validUrl = 'https://validUrl'

const mockedVersionRes = {
  looker_release_version: '23.4.30',
  current_version: {
    version: '4.0',
    full_version: '4.0.23.4',
    status: 'current',
    swagger_url: 'https://validUrl/api/4.0/swagger.json',
  },
  supported_versions: [
    {
      version: '3.0',
      full_version: '3.0.0',
      status: 'legacy',
      swagger_url: 'https://validUrl/api/3.0/swagger.json',
    },
    {
      version: '3.1',
      full_version: '3.1.0',
      status: 'legacy',
      swagger_url: 'https://validUrl/api/3.1/swagger.json',
    },
    {
      version: '4.0',
      full_version: '4.0.23.4',
      status: 'current',
      swagger_url: 'https://validUrl/api/4.0/swagger.json',
    },
  ],
  api_server_url: validUrl,
  web_server_url: validUrl,
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
  getVersions: jest.fn(),
}))

jest.mock('../state/slice', () => ({
  ...jest.requireActual('../state/slice'),
  useOAuthFormState: jest.fn(),
  useOAuthFormActions: jest.fn().mockReturnValue({
    initAction: jest.fn(),
    setUrlAction: jest.fn(),
    clearConfigAction: jest.fn(),
    verifyAction: jest.fn(),
    clearMessageBarAction: jest.fn(),
    saveConfigAction: jest.fn(),
  }),
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
  store: Store<{ OAuthForm: OAuthFormState }>
) => renderWithTheme(withReduxProvider(consumers, store))

type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>
}

const createTestStore = (overrides: DeepPartial<OAuthFormState>) =>
  createStore({
    preloadedState: {
      OAuthForm: {
        ...defaultOAuthFormState,
        ...overrides,
      } as OAuthFormState,
    },
    reducer: {
      OAuthForm: OAuthFormSlice.reducer,
    },
  })

const withReduxProvider = (
  consumers: ReactElement<any>,
  store: Store<{ OAuthForm: OAuthFormState }>
) => {
  return <Provider store={store}>{consumers}</Provider>
}

describe('ConfigForm', () => {
  const adaptor = new BrowserAdaptor(initSdk())
  registerTestEnvAdaptor(adaptor)
  let store = createTestStore({})

  const apiLabel = /API server URL/i
  const authLabel = /OAuth server URL/i
  beforeEach(() => {
    localStorage.removeItem(ConfigKey)
    ;(useOAuthFormActions as jest.Mock).mockReturnValue({
      initAction: jest.fn(),
      setUrlAction: jest.fn(),
      clearConfigAction: jest.fn(),
      verifyAction: jest.fn(),
      clearMessageBarAction: jest.fn(),
      saveConfigAction: jest.fn(),
    })
  })

  test('it renders with default values', async () => {
    const storeState = {}
    store = createTestStore(storeState)
    ;(useOAuthFormState as jest.Mock).mockReturnValue(
      store.getState().OAuthForm
    )

    renderWithReduxProvider(
      <OAuthForm
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
      apiServerUrl: 'nonValidUrl',
      validationMessages: {
        baseUrl: {
          type: 'error',
          message: 'nonValidUrl is not a valid url',
        },
      } as ValidationMessages,
    } as OAuthFormState

    store = createTestStore(storeState)
    ;(useOAuthFormState as jest.Mock).mockReturnValue(
      store.getState().OAuthForm
    )

    renderWithReduxProvider(
      <OAuthForm
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
    expect(apiUrl).toHaveValue(storeState.apiServerUrl)

    const verifyBtn = screen.getByRole('button', { name: 'Verify' })

    expect(verifyBtn).toBeInTheDocument()
    expect(verifyBtn).toBeDisabled()
    expect(
      screen.getByText('nonValidUrl is not a valid url')
    ).toBeInTheDocument()
  })

  test('it triggers validation on type', async () => {
    const storeState = {} as OAuthFormState
    store = createTestStore(storeState)
    ;(useOAuthFormState as jest.Mock).mockReturnValue(
      store.getState().OAuthForm
    )

    renderWithReduxProvider(
      <OAuthForm
        configKey={ConfigKey}
        clientId="looker.cool-client"
        clientLabel="Looker Cool Client"
      />,
      store
    )
    const { setUrlAction } = useOAuthFormActions()
    const apiUrl = screen.getByRole('textbox', {
      name: apiLabel,
    }) as HTMLInputElement
    expect(apiUrl).toBeInTheDocument()
    expect(apiUrl).toHaveValue('')

    await userEvent.type(apiUrl, 'bad')
    expect(setUrlAction).toHaveBeenCalled()
  })

  test('verify button enabled if valid url', async () => {
    const storeState = {
      apiServerUrl: validUrl,
    } as OAuthFormState
    store = createTestStore(storeState)
    ;(useOAuthFormState as jest.Mock).mockReturnValue(
      store.getState().OAuthForm
    )
    const { verifyAction } = useOAuthFormActions()

    renderWithReduxProvider(
      <OAuthForm
        configKey={ConfigKey}
        clientId="looker.cool-client"
        clientLabel="Looker Cool Client"
      />,
      store
    )

    const button = screen.getByRole('button', {
      name: 'Verify',
    }) as HTMLButtonElement
    expect(button).toBeInTheDocument()
    expect(button).toBeEnabled()
    fireEvent.click(button)
    expect(verifyAction).toHaveBeenCalled()
  })

  test('it shows Oauth help message after verify and enabled save button', async () => {
    const storeState = {
      apiServerUrl: validUrl,
      fetchedUrl: validUrl,
      webUrl: validUrl,
      messageBar: {
        intent: 'positive',
        text: 'Configuration is valid',
      },
    } as OAuthFormState
    store = createTestStore(storeState)
    ;(useOAuthFormState as jest.Mock).mockReturnValue(
      store.getState().OAuthForm
    )
    renderWithReduxProvider(
      <OAuthForm
        configKey={ConfigKey}
        clientId="looker.cool-client"
        clientLabel="Looker Cool Client"
      />,
      store
    )

    const button = screen.getByRole('button', {
      name: 'Verify',
    }) as HTMLButtonElement
    expect(button).toBeInTheDocument()
    expect(button).toBeEnabled()

    expect(screen.getByText('Configuration is valid')).toBeInTheDocument()
    const helpMessage = screen.queryByText((text) =>
      text.includes(
        'If API Explorer is also installed, the configuration below can be used to'
      )
    )
    expect(helpMessage).toBeVisible()
    const saveBtn = screen.getByRole('button', {
      name: 'Save',
    })
    expect(saveBtn).toBeEnabled()
  })

  test('it saves storage', async () => {
    const storeState = {
      apiServerUrl: validUrl,
      webUrl: validUrl,
    } as OAuthFormState
    store = createTestStore(storeState)
    ;(useOAuthFormState as jest.Mock).mockReturnValue(
      store.getState().OAuthForm
    )
    ;(getVersions as jest.Mock).mockResolvedValueOnce(mockedVersionRes)
    const { saveConfigAction } = useOAuthFormActions()

    renderWithReduxProvider(
      <OAuthForm
        configKey={ConfigKey}
        clientId="looker.cool-client"
        clientLabel="Looker Cool Client"
      />,
      store
    )

    const saveBtn = screen.getByRole('button', {
      name: 'Save',
    })
    expect(saveBtn).toBeEnabled()
    fireEvent.click(saveBtn)
    expect(saveConfigAction).toHaveBeenCalled()
  })

  test('it calls adaptors login on login click', async () => {
    adaptor.login = jest.fn()

    const storeState = {
      apiServerUrl: validUrl,
      webUrl: validUrl,
      savedConfig: {
        base_url: validUrl,
        looker_url: validUrl,
      } as ConfigValues,
    } as OAuthFormState
    store = createTestStore(storeState)
    ;(useOAuthFormState as jest.Mock).mockReturnValue(
      store.getState().OAuthForm
    )

    renderWithReduxProvider(
      <OAuthForm
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
})
