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

import React, { BaseSyntheticEvent, FC, useState, useEffect } from 'react'
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
  Spinner,
  Flex,
} from '@looker/components'
import { IRawResponse, Looker40SDK } from '@looker/sdk/lib/browser'

import {
  RequestForm,
  ShowResponse,
  createRequestParams,
  defaultTryItCallback,
  pathify,
  ConfigForm,
  tryItSDK,
  TryItSettings,
} from './components'
import { sdkNeedsConfig } from './components/configUtils'

export type TryItHttpMethod = 'GET' | 'PUT' | 'POST' | 'PATCH' | 'DELETE'

export type TryItValues = { [key: string]: any }

export interface TryItCallback {
  (
    specKey: string,
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
  specKey: string
  inputs: TryItInput[]
  httpMethod: TryItHttpMethod
  endpoint: string
  tryItCallback?: TryItCallback
  sdk?: Looker40SDK
}

type ResponseContent = IRawResponse | undefined

export const TryIt: FC<TryItProps> = ({
  specKey,
  inputs,
  httpMethod,
  endpoint,
  tryItCallback,
  sdk = tryItSDK,
}) => {
  const [requestContent, setRequestContent] = useState({})
  const [activePathParams, setActivePathParams] = useState(undefined)
  const [loading, setLoading] = useState(false)
  const [responseContent, setResponseContent] = useState<ResponseContent>(
    undefined
  )
  const tabs = useTabs()
  const configIsNeeded = sdkNeedsConfig(sdk)
  const settings = sdk?.authSession.settings as TryItSettings
  const [hasConfig, setHasConfig] = useState<boolean>(
    !configIsNeeded || settings.authIsConfigured()
  )

  // TODO: Make jest stop complaining when using the ?? syntax below
  const callback = tryItCallback || defaultTryItCallback

  const handleSubmit = async (e: BaseSyntheticEvent) => {
    e.preventDefault()
    const [pathParams, queryParams, body] = createRequestParams(
      inputs,
      requestContent
    )
    setActivePathParams(pathParams)
    tabs.onSelectTab(1)
    setLoading(true)
    setResponseContent(
      await callback(
        specKey,
        httpMethod,
        endpoint,
        pathParams,
        queryParams,
        body
      )
    )
  }

  useEffect(() => {
    setLoading(!responseContent)
  }, [responseContent])

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
          {hasConfig && (
            <RequestForm
              httpMethod={httpMethod}
              inputs={inputs}
              requestContent={requestContent}
              setRequestContent={setRequestContent}
              handleSubmit={handleSubmit}
            />
          )}
          {!hasConfig && <ConfigForm setHasConfig={setHasConfig} />}
        </TabPanel>
        <TabPanel key="response">
          {loading && (
            <>
              <Flex>
                <Spinner />
                {`${httpMethod} ${pathify(endpoint, activePathParams)}`}
              </Flex>
            </>
          )}
          {responseContent && (
            <ShowResponse
              response={responseContent}
              verb={httpMethod}
              path={pathify(endpoint, activePathParams)}
            />
          )}
        </TabPanel>
      </TabPanels>
    </Box>
  )
}
