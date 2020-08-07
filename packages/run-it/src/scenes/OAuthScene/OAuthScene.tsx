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
import { BrowserSession, Looker40SDK } from '@looker/sdk/lib/browser'
import { Spinner, Text } from '@looker/components'
import { runItSDK } from '../..'

interface OAuthSceneProps {
  sdk?: Looker40SDK
}

export const OAuthScene: React.FC<OAuthSceneProps> = ({ sdk }) => {
  const [loading, setLoading] = useState(true)
  const history = useHistory()
  // Default to the OAuth/CORS sdk implementation
  if (!sdk) sdk = runItSDK
  const auth = sdk.authSession as BrowserSession

  /** capture the stored return URL before `OAuthSession.login()` clears it */
  const oldUrl = auth.returnUrl || `/`

  async function mayLogin() {
    if (!auth.isAuthenticated()) {
      await auth.login()
    }
    setLoading(false)
  }

  useEffect(() => {
    mayLogin()
      .then((res) => {
        if (!auth.isAuthenticated()) {
          console.error(`Authentication failed ${res}`)
        }
        history.push(oldUrl)
      })
      .catch((err) => {
        console.error(err)
        history.push(oldUrl)
      })
  }, [auth, history])

  return (
    <>
      {loading && (
        <>
          <Spinner />
          <Text>Returning to {oldUrl} after OAuth login ...</Text>
        </>
      )}
    </>
  )
}
