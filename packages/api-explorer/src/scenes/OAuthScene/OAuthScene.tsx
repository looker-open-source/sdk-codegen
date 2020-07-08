import React, { useEffect } from 'react'
import { Looker40SDK } from '@looker/sdk/lib/browser'
import { tryItSDK } from '@looker/try-it'
import { Redirect } from 'react-router'

interface OAuthSceneProps {
  sdk?: Looker40SDK
}

export const OAuthScene: React.FC<OAuthSceneProps> = ({ sdk }) => {
  if (!sdk) sdk = tryItSDK

  useEffect(() => {
    // TODO is async really this complicated? https://dev.to/alexandrudanpop/correctly-handling-async-await-in-react-components-part-2-4fl7
    async function login() {
      try {
        await sdk!.authSession.login()
      } catch (err) {
        console.error(err)
      }
    }

    login().then(() => console.log('OAuth login completed'))
  })

  // TODO display OAuth login completed with a click to redirect, and redirect automatically after 3 seconds or so?
  // TODO Or just show "OAuth login completed" as a disappearing banner on the redirected page?
  return <Redirect to="/" />
}
