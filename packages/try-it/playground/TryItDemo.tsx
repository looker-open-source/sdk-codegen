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

import React, { FC, useState } from 'react'
import { BrowserRouter, Route } from 'react-router-dom'
import { ApiModel } from '@looker/sdk-codegen'
import { ComponentsProvider, Select, Space } from '@looker/components'
import { TryIt, TryItHttpMethod } from '../src/TryIt'
import { specs } from '../../api-explorer/src/test-data'
import { createInputs } from '../../api-explorer/src/scenes/MethodScene/utils'
import { OAuthScene } from '../src/scenes/OAuthScene/OAuthScene'
import { tryItSDK } from '../src/utils/TryItSDK'

export const TryItDemo: FC = () => {
  const specKey = '4.0'
  const api = ApiModel.fromJson(specs[specKey].specContent)
  const [method, setMethod] = useState(api.methods.me)
  const [inputs, setInputs] = useState(createInputs(api, method))
  const options = Object.values(api.methods).map((m) => {
    const result: any = {
      value: m.name,
      label: `${m.name}: ${m.summary}`,
    }
    if (m.name === 'me') result.scrollIntoView = true
    return result
  })

  const handleSelection = (value: string) => {
    const method = api.methods[value]
    setMethod(method)
    setInputs(createInputs(api, method))
  }

  return (
    <ComponentsProvider>
      <BrowserRouter>
        <Space>
          <span>Method to try:</span>
          <Select
            autoResize
            placeholder="Select the method to try ..."
            options={options}
            listLayout={{ width: 'auto' }}
            onChange={handleSelection}
          />
        </Space>
        <TryIt
          specKey={specKey}
          inputs={inputs}
          httpMethod={method.httpMethod as TryItHttpMethod}
          endpoint={method.endpoint}
        />
        <Route path="/oauth">
          <OAuthScene sdk={tryItSDK} />
        </Route>
      </BrowserRouter>
    </ComponentsProvider>
  )
}
