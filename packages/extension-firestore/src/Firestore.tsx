/*

 MIT License

 Copyright (c) 2022 Looker Data Sciences, Inc.

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
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { getFirestore } from 'firebase/firestore'
import {
  getAuth,
  signInWithCredential,
  GoogleAuthProvider,
} from 'firebase/auth'
import { FirestoreProvider, useFirebaseApp } from 'reactfire'
import {
  SpaceVertical,
  MessageBar,
  Button,
  Tabs2,
  Tab2,
} from '@looker/components'
import { ExtensionContext40 } from '@looker/extension-sdk-react'
import { Counter } from './Counter'
import { AnimalsList } from './AnimalsList'

export const Firestore = () => {
  const [authorized, setAuthorized] = useState<boolean | undefined>()
  const firebaseApp = useFirebaseApp()
  const firebaseAuth = getAuth(firebaseApp)
  const firestoreInstance = getFirestore(firebaseApp)
  const { extensionSDK } = useContext(ExtensionContext40)
  const [errorMessage, setErrorMessage] = useState<string>()

  const authorize = useCallback(async () => {
    setErrorMessage(undefined)
    try {
      const googleAccessToken = await extensionSDK.getGoogleAccessToken()
      if (googleAccessToken) {
        const { access_token } = googleAccessToken
        const credential = GoogleAuthProvider.credential(null, access_token)
        await signInWithCredential(firebaseAuth, credential)
        setAuthorized(true)
      } else {
        setAuthorized(false)
        setErrorMessage('Google credentials are missing')
      }
    } catch (error: any) {
      setAuthorized(false)
      console.error(JSON.stringify(error, null, 2))
      setErrorMessage('An error occurred authorizing access to firestore!')
    }
  }, [extensionSDK, setAuthorized, setErrorMessage])

  useEffect(() => {
    if (!authorized) {
      authorize()
    }
  }, [authorized, setAuthorized])

  const reauthorize = useCallback(async () => {
    await firebaseAuth.signOut()
    await extensionSDK.reauthorizeGoogleApiScopes()
    await authorize()
  }, [authorize, extensionSDK])

  return (
    <FirestoreProvider sdk={firestoreInstance}>
      <SpaceVertical>
        {errorMessage && (
          <MessageBar intent="critical">{errorMessage}</MessageBar>
        )}
        {authorized === false && (
          <Button onClick={reauthorize}>Reauthorize</Button>
        )}
        {authorized && (
          <Tabs2>
            <Tab2 label="Counter">
              <Counter />
            </Tab2>
            <Tab2 label="Animal lists">
              <AnimalsList />
            </Tab2>
          </Tabs2>
        )}
      </SpaceVertical>
    </FirestoreProvider>
  )
}
