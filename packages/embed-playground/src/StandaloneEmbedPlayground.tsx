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
import React, { useState, useEffect } from 'react'
import { ComponentsProvider } from '@looker/components'
import {
  BrowserAdaptor,
  registerEnvAdaptor,
  OAuthScene,
  OAuthConfigProvider,
  OAuthForm,
} from '@looker/extension-utils'
import { Provider } from 'react-redux'
import { useLocation } from 'react-router'
import type { IApiSettings } from '@looker/sdk-rtl'
import {
  BrowserSession,
  BrowserTransport,
  DefaultSettings,
} from '@looker/sdk-rtl'
import { functionalSdk40 } from '@looker/sdk'
import { store } from '@looker/embed-components'
import { Loader } from './components'
import { EmbedPlayground } from './EmbedPlayground'

const ConfigKey = 'EPConfig'

const OAuthClientId = 'looker.embed-playground'

export const initSdk = () => {
  const settings = {
    ...DefaultSettings(),
    base_url: 'https://self-signed.looker.com:19999',
    agentTag: 'EmbedPlayground 0.1',
  } as IApiSettings

  const options = new OAuthConfigProvider(settings, OAuthClientId, ConfigKey)
  const transport = new BrowserTransport(options)
  const session = new BrowserSession(options, transport)
  const sdk = functionalSdk40(session)
  return sdk
}

export const StandaloneEmbedPlayground = () => {
  const location = useLocation()
  const oauthReturn = location.pathname === '/oauth'
  const [adaptor] = useState(new BrowserAdaptor(initSdk()))
  const sdk = adaptor.sdk
  const authIsConfigured = (
    sdk.authSession.settings as OAuthConfigProvider
  ).authIsConfigured()
  const canLogin =
    authIsConfigured && !sdk.authSession.isAuthenticated() && !oauthReturn

  useEffect(() => {
    const login = async () => await adaptor.login()
    if (canLogin) {
      login()
    }
  }, [])

  const { looker_url } = (
    sdk.authSession.settings as OAuthConfigProvider
  ).getStoredConfig()
  registerEnvAdaptor(adaptor)

  const themeOverrides = adaptor.themeOverrides()

  if (!authIsConfigured) {
    return (
      <Provider store={store}>
        <ComponentsProvider
          loadGoogleFonts={themeOverrides.loadGoogleFonts}
          themeCustomizations={themeOverrides.themeCustomizations}
        >
          <OAuthForm
            configKey="EPConfig"
            clientId={OAuthClientId}
            clientLabel="Embed Playground"
          />
        </ComponentsProvider>
      </Provider>
    )
  }

  if (canLogin) {
    return (
      <Provider store={store}>
        <Loader
          themeOverrides={adaptor.themeOverrides()}
          message={`Configuration found. Logging into ${looker_url}`}
        />
      </Provider>
    )
  }

  return (
    <Provider store={store}>
      {oauthReturn ? (
        <OAuthScene adaptor={adaptor} />
      ) : (
        <EmbedPlayground adaptor={adaptor} />
      )}
    </Provider>
  )
}
