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

import React, { FC, useContext } from 'react'
import { Space, Text } from '@looker/components'
import { useParams } from 'react-router-dom'
import { RunIt, RunItCallback, RunItHttpMethod } from '@looker/run-it'
import { ApiModel, typeRefs } from '@looker/sdk-codegen'
import { Looker40SDK, Looker31SDK } from '@looker/sdk/lib/browser'
import { ExplorerContext, ExplorerContextProps } from '../../context'

import {
  DocActivityType,
  DocMarkdown,
  DocRateLimited,
  DocReferences,
  DocResponses,
  DocSDKs,
  DocStatus,
  DocTitle,
} from '../../components'
import { DocOperation } from './components'
import { createInputs } from './utils'

interface DocMethodProps {
  api: ApiModel
  runItCallback?: RunItCallback
  sdk?: Looker40SDK | Looker31SDK
}

interface DocMethodParams {
  methodName: string
  specKey: string
}

export const MethodScene: FC<DocMethodProps> = ({
  api,
  runItCallback,
  sdk,
}) => {
  const { runtimeEnvironment } = useContext<ExplorerContextProps>(
    ExplorerContext
  )
  const { methodName, specKey } = useParams<DocMethodParams>()
  const method = api.methods[methodName]
  const seeTypes = typeRefs(api, method.customTypes)

  return (
    <>
      <DocTitle>{method.summary}</DocTitle>
      <Space mb="xlarge" gap="small">
        <DocStatus method={method} />
        <DocActivityType method={method} />
        <DocRateLimited method={method} />
      </Space>
      <DocOperation method={method} />
      <DocMarkdown source={method.description} specKey={specKey} />
      <DocSDKs api={api} method={method} />
      {seeTypes.length > 0 && (
        <Space mb="large" gap="xsmall">
          <Text>Referenced types:</Text>
          <DocReferences items={seeTypes} api={api} specKey={specKey} />
        </Space>
      )}
      {method.responses && <DocResponses responses={method.responses} />}
      <RunIt
        specKey={specKey}
        inputs={createInputs(api, method)}
        httpMethod={method.httpMethod as RunItHttpMethod}
        endpoint={method.endpoint}
        runItCallback={runItCallback}
        sdk={sdk}
        configurator={runtimeEnvironment}
      />
    </>
  )
}
