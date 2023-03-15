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
import type { IEnvironmentAdaptor } from '@looker/extension-utils'
import { me } from '@looker/sdk'

interface EmbedPlaygroundProps {
  adaptor: IEnvironmentAdaptor
  headless?: boolean
}

export const EmbedPlayground = ({ adaptor }: EmbedPlaygroundProps) => {
  const [greeting, setGreeting] = useState('Hello World!')
  const sdk = adaptor.sdk
  useEffect(() => {
    const getCurrentUser = async () => {
      const currentUser = await sdk.ok(me(sdk))
      if (currentUser) {
        const { first_name, last_name } = currentUser

        setGreeting(`Hello ${first_name} ${last_name}!`)
      }
      return currentUser
    }
    getCurrentUser()
  })

  return <ComponentsProvider>{greeting}</ComponentsProvider>
}
