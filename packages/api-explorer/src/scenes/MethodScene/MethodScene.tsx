/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2020 Looker Data Sciences, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import React, { FC } from 'react'
import { Flex, Space } from '@looker/components'
import { useParams } from 'react-router-dom'
import { ApiModel, typeRefs } from '@looker/sdk-codegen'
import { TryIt, TryItHttpMethod } from '@looker/try-it'

import { DocMarkdown, DocReferences, DocTitle, DocSDKs } from '../../components'
import {
  DocActivityType,
  DocRateLimited,
  DocResponse,
  DocStatus,
  DocOperation,
} from './components'
import { createInputs } from './utils'

interface DocMethodProps {
  api: ApiModel
}

interface DocMethodParams {
  methodName: string
  specKey: string
}

export const MethodScene: FC<DocMethodProps> = ({ api }) => {
  const { methodName, specKey } = useParams<DocMethodParams>()
  const method = api.methods[methodName]
  const seeTypes = typeRefs(api, method.customTypes)

  return (
    <>
      <DocTitle title={method.summary} />
      <Flex mb="xxlarge">
        <Space gap="large">
          <DocStatus method={method} />
          <DocActivityType method={method} />
          <DocRateLimited method={method} />
        </Space>
      </Flex>
      <DocOperation method={method} />
      <DocMarkdown source={method.description} specKey={specKey} />
      <DocSDKs api={api} method={method} />
      {seeTypes.length > 0 && (
        <>
          Referenced types:
          <DocReferences items={seeTypes} api={api} specKey={specKey} />
        </>
      )}
      {method.responses && <DocResponse responses={method.responses} />}
      <TryIt
        inputs={createInputs(api, method)}
        httpMethod={method.httpMethod as TryItHttpMethod}
        endpoint={method.endpoint}
      />
    </>
  )
}
