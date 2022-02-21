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

import type { FC } from 'react'
import React, { useEffect, useState } from 'react'
import { RunItConfigKey, RunItProvider } from '@looker/run-it'
import type { OAuthConfigProvider } from '@looker/extension-utils'
import { initSdk, OAuthScene } from '@looker/extension-utils'
import { Provider } from 'react-redux'
import { useLocation } from 'react-router'
import { functionalSdk40 } from '@looker/sdk'
import type { BrowserSession } from '@looker/sdk-rtl'

import { ApiExplorer } from './ApiExplorer'
import { store } from './state'
import { oAuthPath, ApixAdaptor } from './utils'
import { Loader } from './components'

export interface StandaloneApiExplorerProps {
  headless?: boolean
  versionsUrl: string
}

export const StandaloneApiExplorer: FC<StandaloneApiExplorerProps> = ({
  headless = false,
}) => {
  const [browserAdaptor] = useState(
    () =>
      new ApixAdaptor(
        initSdk({
          agentTag: 'RunIt 0.8',
          configKey: RunItConfigKey,
          clientId: 'looker.api-explorer',
          createSdkCallback: (session: BrowserSession) =>
            functionalSdk40(session),
        }),
        window.origin
      )
  )

  const location = useLocation()
  const oauthReturn = location.pathname === `/${oAuthPath}`
  const sdk = browserAdaptor.sdk
  const canLogin =
    (sdk.authSession.settings as OAuthConfigProvider).authIsConfigured() &&
    !sdk.authSession.isAuthenticated() &&
    !oauthReturn

  useEffect(() => {
    const login = async () => await browserAdaptor.login()
    if (canLogin) {
      login()
    }
  }, [])

  const { looker_url } = (
    sdk.authSession.settings as OAuthConfigProvider
  ).getStoredConfig()

  return (
    <Provider store={store}>
      <RunItProvider basePath="/api/4.0">
        {canLogin ? (
          <Loader
            themeOverrides={browserAdaptor.themeOverrides()}
            message={`Configuration found. Logging into ${looker_url}`}
          />
        ) : (
          <>
            {oauthReturn ? (
              <OAuthScene adaptor={browserAdaptor} />
            ) : (
              <ApiExplorer adaptor={browserAdaptor} headless={headless} />
            )}
          </>
        )}
      </RunItProvider>
    </Provider>
  )
}
