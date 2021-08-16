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

import React, { BaseSyntheticEvent, Dispatch, FC } from 'react'
import { Button, Tooltip, Space } from '@looker/components'
import { IAPIMethods } from '@looker/sdk-rtl'
import { runItSDK } from '../../utils'
import { ConfigDialog, RunItFormKey, RunItConfigurator } from '../ConfigForm'
import { RunItValues } from '../..'

interface LoginFormProps {
  /** A set state callback which if present allows for editing, setting or clearing OAuth configuration parameters */
  setHasConfig?: Dispatch<boolean>
  /** SDK to use for login. Defaults to the `runItSDK` */
  sdk?: IAPIMethods
  configurator: RunItConfigurator
  requestContent: RunItValues
}

export const LoginForm: FC<LoginFormProps> = ({
  sdk = runItSDK,
  setHasConfig,
  configurator,
  requestContent,
}) => {
  const handleSubmit = async (e: BaseSyntheticEvent) => {
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
    <>
      <Space>
        <Tooltip content="OAuth authentication is already configured, but the browser session is not authenticated. Please click Login to authenticate.">
          <Button onClick={handleSubmit}>Login</Button>
        </Tooltip>
        {setHasConfig && (
          <ConfigDialog
            setHasConfig={setHasConfig}
            configurator={configurator}
          />
        )}
      </Space>
    </>
  )
}
