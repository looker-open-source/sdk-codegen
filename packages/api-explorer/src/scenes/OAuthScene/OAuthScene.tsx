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
import { BrowserSession, Looker40SDK } from '@looker/sdk/lib/browser'
import { tryItSDK } from '@looker/try-it'
import { Redirect } from 'react-router'
import { Spinner, Text } from '@looker/components'

interface OAuthSceneProps {
  sdk?: Looker40SDK
}

export const OAuthScene: React.FC<OAuthSceneProps> = ({ sdk }) => {
  const [loading, setLoading] = useState(true)
  if (!sdk) sdk = tryItSDK
  const auth = sdk.authSession as BrowserSession

  const newUrl = auth.returnUrl || `/`

  useEffect(() => {
    // TODO is async really this complicated? https://dev.to/alexandrudanpop/correctly-handling-async-await-in-react-components-part-2-4fl7
    async function login() {
      console.log('logging in ...')
      try {
        await auth.login()
      } catch (err) {
        console.error(err)
      }
    }

    if (!auth.isAuthenticated()) {
      login().then(() => {
        console.log('OAuth login completed')
      })
    }
    setLoading(false)
  }, [])

  // TODO display OAuth login completed with a click to redirect, and redirect automatically after 3 seconds or so?
  // TODO Or just show "OAuth login completed" as a disappearing banner on the redirected page?
  return (
    <>
      {loading && (
        <>
          <Spinner />
          <Text>
            Establishing OAuth session before redirecting to {newUrl} ...
          </Text>
        </>
      )}
      {!loading && sdk && sdk.authSession.isAuthenticated() && (
        <Redirect to={newUrl} />
      )}
    </>
  )
}
