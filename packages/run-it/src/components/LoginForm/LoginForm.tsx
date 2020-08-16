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

import React, { BaseSyntheticEvent, Dispatch, FC } from 'react'
import { Looker40SDK } from '@looker/sdk/lib/browser'
import { Button, Heading, Text, Paragraph, Space } from '@looker/components'
import { runItSDK } from '../../utils'
import { ConfigDialog, RunItConfigurator } from '../ConfigForm'

interface LoginFormProps {
  /** A set state callback which if present allows for editing, setting or clearing OAuth configuration parameters */
  setHasConfig?: Dispatch<boolean>
  /** SDK to use for login. Defaults to the `runItSDK` */
  sdk?: Looker40SDK
  configurator: RunItConfigurator
}

export const LoginForm: FC<LoginFormProps> = ({
  sdk = runItSDK,
  setHasConfig,
  configurator,
}) => {
  const handleSubmit = async (e: BaseSyntheticEvent) => {
    e.preventDefault()
    // This will set storage variables and return to OAuthScene when successful
    await sdk?.authSession.login()
  }

  return (
    <>
      <Heading>
        <Text>OAuth Login</Text>
      </Heading>
      <Paragraph>
        OAuth authentication is already configured, but the browser session is
        not authenticated. Please click <strong>Login</strong> to authenticate.
      </Paragraph>
      <Space>
        <Button onClick={handleSubmit}>Login</Button>
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
