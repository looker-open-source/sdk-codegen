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
import React, { useEffect } from 'react'
import {
  BrowserAdaptor,
  OAuthScene,
  registerEnvAdaptor,
} from '@looker/extension-utils'
import type { OAuthConfigProvider } from '@looker/extension-utils'
import { Flex, FlexItem } from '@looker/components'
import { Route, Switch } from 'react-router'

import { ConfigForm } from './ConfigForm'
import { initSdk } from './utils'
import { HomeScene } from './HomeScene'
import { Loader } from './Loader'

const App: React.FC = () => {
  const adaptor = new BrowserAdaptor(initSdk())
  registerEnvAdaptor(adaptor)
  const oauthReturn = window.location.pathname === '/oauth'
  const authIsConfigured = (
    adaptor.sdk.authSession.settings as OAuthConfigProvider
  ).authIsConfigured()
  const canLogin =
    authIsConfigured &&
    !adaptor.sdk.authSession.isAuthenticated() &&
    !oauthReturn

  useEffect(() => {
    const login = async () => await adaptor.login()
    if (canLogin) {
      login()
    }
  }, [])

  return (
    <Flex flexDirection="column" justifyContent="center" mt="25%">
      <FlexItem alignSelf="center">
        <Switch>
          <Route path="/oauth">
            <OAuthScene adaptor={adaptor} />
          </Route>
          <Route path="/" exact>
            {canLogin ? (
              <Loader message={`Configuration found. Logging in`} />
            ) : (
              <> {authIsConfigured ? <HomeScene /> : <ConfigForm />} </>
            )}
          </Route>
        </Switch>
      </FlexItem>
    </Flex>
  )
}

export default App
