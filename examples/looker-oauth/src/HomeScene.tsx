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
import React, { useState, useEffect } from 'react'
import { getEnvAdaptor } from '@looker/extension-utils'
import { Heading } from '@looker/components'
import type { ILooker40SDK } from '@looker/sdk'
import { me } from '@looker/sdk'

export const HomeScene = () => {
  const adaptor = getEnvAdaptor()
  const [name, setName] = useState<string | undefined>()

  const getName = async () => {
    const sdk = adaptor.sdk as ILooker40SDK
    const res = await sdk.ok(me(sdk))
    if (res) {
      setName(res.first_name!)
    }
  }

  useEffect(() => {
    getName()
  }, [])

  return <>{name && <Heading>{`Welcome, ${name}`}</Heading>}</>
}
