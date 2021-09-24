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

import type { BaseSyntheticEvent, Dispatch, FC } from 'react'
import React from 'react'
import { Button, Tooltip } from '@looker/components'
import type { IAPIMethods } from '@looker/sdk-rtl'
import { runItSDK } from '../../utils'
import type { RunItConfigurator } from '../ConfigForm'
import { RunItFormKey } from '../ConfigForm'
import type { RunItValues, RunItSetter } from '../..'

interface LoginFormProps {
  configurator: RunItConfigurator
  requestContent: RunItValues
  setVersionsUrl: RunItSetter
  /** A set state callback which if present allows for editing, setting or clearing OAuth configuration parameters */
  setHasConfig?: Dispatch<boolean>
  /** SDK to use for login. Defaults to the `runItSDK` */
  sdk?: IAPIMethods
}

export const readyToLogin =
  'OAuth is configured but your browser session is not authenticated. Click Login to enable RunIt.'

export const LoginForm: FC<LoginFormProps> = ({
  configurator,
  requestContent,
  sdk = runItSDK,
}) => {
  const handleLogin = async (e: BaseSyntheticEvent) => {
    e.preventDefault()
    if (requestContent) {
      configurator.setStorage(
        RunItFormKey,
        JSON.stringify(requestContent),
        'local'
      )
    }
    // This will set storage variables and return to OAuthScene when successful
    await sdk?.authSession.login()
  }

  return (
    <Tooltip content={readyToLogin}>
      <Button onClick={handleLogin}>Login</Button>
    </Tooltip>
  )
}
