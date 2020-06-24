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

import React, { BaseSyntheticEvent, FC, useState } from 'react'
import {
  TabList,
  useTabs,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  Text,
  Heading,
  Box,
} from '@looker/components'
import { IRawResponse } from '@looker/sdk/lib/browser'

import {
  RequestForm,
  ShowResponse,
  createRequestParams,
  defaultRequestCallback,
} from './components'

export type TryItHttpMethod = 'GET' | 'PUT' | 'POST' | 'PATCH' | 'DELETE'

export type TryItValues = { [key: string]: any }

export interface TryItCallback {
  (
    httpMethod: TryItHttpMethod,
    path: string,
    pathParams: TryItValues,
    queryParams: TryItValues,
    body: any
  ): Promise<IRawResponse>
}

export interface TryItInput {
  name: string
  /** Location is 'body' | 'path' | 'query' | 'header' | 'cookie' */
  location: string
  type: string | any
  required: boolean
  description: string
}

interface TryItProps {
  inputs: TryItInput[]
  httpMethod: TryItHttpMethod
  endpoint: string
  requestCallback?: TryItCallback
}

type ResponseContent = IRawResponse | undefined

export const TryIt: FC<TryItProps> = ({
  inputs,
  httpMethod,
  endpoint,
  requestCallback,
}) => {
  const [requestContent, setRequestContent] = useState({})
  // const [resp, setResp] = useState<ResponseContent>(undefined)
  const [responseContent, setResponseContent] = useState<ResponseContent>(
    undefined
  )
  const tabs = useTabs()

  // TODO: Make jest stop complaining when using the ?? syntax below
  const callback = requestCallback || defaultRequestCallback

  const handleSubmit = async (e: BaseSyntheticEvent) => {
    e.preventDefault()
    const [pathParams, queryParams, body] = createRequestParams(
      inputs,
      requestContent
    )
    setResponseContent(
      await callback(httpMethod, endpoint, pathParams, queryParams, body)
    )
  }

  return (
    <Box>
      <Heading>
        <Badge>{httpMethod}</Badge> <Text>{endpoint}</Text>
      </Heading>
      <TabList {...tabs}>
        <Tab key="request">Request</Tab>
        <Tab key="response">Response</Tab>
      </TabList>
      <TabPanels {...tabs}>
        <TabPanel key="request">
          <RequestForm
            httpMethod={httpMethod}
            inputs={inputs}
            requestContent={requestContent}
            setRequestContent={setRequestContent}
            handleSubmit={handleSubmit}
          />
        </TabPanel>
        <TabPanel key="response">
          {responseContent && <ShowResponse response={responseContent} />}
        </TabPanel>
      </TabPanels>
    </Box>
  )
}
