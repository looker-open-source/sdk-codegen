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
import type { BaseSyntheticEvent } from 'react'
import React, { useState } from 'react'
import { Form, FieldText, Button, Space } from '@looker/components'
import { getEnvAdaptor } from '@looker/extension-utils'
import { ConfigKey } from './utils'

export const ConfigForm: React.FC = () => {
  const [serverUrl, setServerUrl] = useState('')
  const [canLogin, setCanLogin] = useState(false)

  const handleChange = (e: BaseSyntheticEvent) => {
    setServerUrl(e.target.value)
  }

  const handleSave = (e: BaseSyntheticEvent) => {
    e.preventDefault()
    const config = {
      base_url: `${serverUrl}:19999`,
      looker_url: `${serverUrl}:9999`,
    }
    localStorage.setItem(ConfigKey, JSON.stringify(config))
    setCanLogin(true)
  }

  const handleLogin = (e: BaseSyntheticEvent) => {
    e.preventDefault()
    const adaptor = getEnvAdaptor()
    adaptor.login()
  }

  return (
    <Form>
      <FieldText
        required
        label="Looker server URL"
        description="typically https://myserver.looker.com"
        value={serverUrl}
        onChange={handleChange}
      />
      <Space>
        <Button onClick={handleSave} mr="small">
          Save
        </Button>
        <Button onClick={handleLogin} mr="small" disabled={!canLogin}>
          Login
        </Button>
      </Space>
    </Form>
  )
}
