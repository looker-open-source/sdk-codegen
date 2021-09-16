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
import React, { useContext, useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import type { BrowserSession } from '@looker/sdk-rtl'
import { RunItContext } from '../..'
import { Loading } from '../../components'

export const OAuthScene: FC = () => {
  const origin = (window as any).location.origin
  const [loading, setLoading] = useState(true)
  const [auth, setAuth] = useState<BrowserSession>()
  const [oldUrl, setOldUrl] = useState<string>()
  const history = useHistory()
  const { sdk } = useContext(RunItContext)

  useEffect(() => {
    if (sdk) {
      const authSession = sdk.authSession as BrowserSession
      setAuth(authSession)
      /** capture the stored return URL before `OAuthSession.login()` clears it */
      const old = authSession.returnUrl || `/`
      setOldUrl(old)
    } else {
      setAuth(undefined)
      setOldUrl(undefined)
    }
  }, [sdk])

  useEffect(() => {
    const maybeLogin = async () => {
      if (auth) {
        try {
          const res = await auth.login()
          if (!auth.isAuthenticated()) {
            console.error(`Authentication failed ${res}`)
          }
        } catch (error) {
          console.error(error)
        }
        setLoading(false)
        if (oldUrl) {
          history.push(oldUrl)
        }
      }
    }
    maybeLogin()
  }, [auth, history])

  // No sdk no OAuth for you
  if (!sdk) return <></>

  return (
    <Loading
      loading={loading}
      message={`Returning to ${oldUrl || origin} after OAuth login ...`}
    />
  )
}
