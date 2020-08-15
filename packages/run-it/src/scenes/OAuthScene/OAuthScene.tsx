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

import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import {
  BrowserSession,
  Looker40SDK,
  Looker31SDK,
} from '@looker/sdk/lib/browser'
import { RunItConfigurator, initRunItSdk } from '../..'
import { Loading } from '../../components'

interface OAuthSceneProps {
  sdk?: Looker31SDK | Looker40SDK
  configurator: RunItConfigurator
}

export const OAuthScene: React.FC<OAuthSceneProps> = ({
  sdk,
  configurator,
}) => {
  const [runSdk, setRunSdk] = useState<Looker40SDK>()
  const [loading, setLoading] = useState(true)
  const [auth, setAuth] = useState<BrowserSession>()
  const [oldUrl, setOldUrl] = useState<string>()
  const history = useHistory()

  useEffect(() => {
    if (!sdk) {
      setRunSdk(initRunItSdk(configurator) as Looker40SDK)
    } else {
      setRunSdk(sdk as Looker40SDK)
    }
  }, [])

  useEffect(() => {
    if (runSdk) {
      setAuth(runSdk.authSession as BrowserSession)
      /** capture the stored return URL before `OAuthSession.login()` clears it */
      setOldUrl((runSdk.authSession as BrowserSession).returnUrl || `/`)
    }
  }, [runSdk])

  async function mayLogin() {
    if (auth) {
      if (!auth.isAuthenticated()) {
        await auth.login()
      }
      setLoading(false)
    }
  }

  useEffect(() => {
    if (auth) {
      mayLogin()
        .then((res) => {
          if (!auth.isAuthenticated()) {
            console.error(`Authentication failed ${res}`)
          }
          if (oldUrl) {
            history.push(oldUrl)
          }
        })
        .catch((err) => {
          console.error(err)
          if (oldUrl) {
            history.push(oldUrl)
          }
        })
    }
  }, [auth, history])

  return (
    <Loading
      loading={loading}
      message={`Returning to ${oldUrl} after OAuth login ...`}
    />
  )
}
