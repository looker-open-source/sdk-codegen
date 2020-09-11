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

import React, { FC, useContext, useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Looker40SDK } from '@looker/sdk/lib/browser'
import { BrowserSession } from '@looker/sdk-rtl/lib/browser'
import { RunItContext } from '../..'
import { Loading } from '../../components'

export const OAuthScene: FC = () => {
  const [loading, setLoading] = useState(true)
  const [auth, setAuth] = useState<BrowserSession>()
  const [oldUrl, setOldUrl] = useState<string>()
  const history = useHistory()
  const { sdk } = useContext(RunItContext)

  useEffect(() => {
    if (sdk && sdk instanceof Looker40SDK) {
      setAuth(sdk.authSession as BrowserSession)
      /** capture the stored return URL before `OAuthSession.login()` clears it */
      setOldUrl((sdk.authSession as BrowserSession).returnUrl || `/`)
    } else {
      setAuth(undefined)
      setOldUrl(undefined)
    }
  }, [sdk])

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

  // No LookerSDK40 no OAuth for you
  if (!(sdk && sdk instanceof Looker40SDK)) return <></>

  return (
    <Loading
      loading={loading}
      message={`Returning to ${oldUrl} after OAuth login ...`}
    />
  )
}
