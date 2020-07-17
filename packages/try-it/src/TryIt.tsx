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
import { IRawResponse } from '@looker/sdk/lib/browser'

import { RequestForm, ShowResponse } from './components'
import { createRequestParams, defaultTryItCallback, pathify } from './utils'

export type TryItHttpMethod = 'GET' | 'PUT' | 'POST' | 'PATCH' | 'DELETE'

/**
 * Generic collection
 */
export type TryItValues = { [key: string]: any }

/**
 * HTTP request callback function type for fully downloaded raw HTTP responses
 */
export interface TryItCallback {
  /**
   *
   * @param specKey  API version to use for the request
   * @param httpMethod Method of HTTP request
   * @param path Data for the body of the request
   * @param pathParams A collection of path parameters to pass as part of the URL
   * @param queryParams A collection of query parameters to pass as part of the URL
   * @param body
   */
  (
    specKey: string,
    httpMethod: TryItHttpMethod,
    path: string,
    pathParams: TryItValues,
    queryParams: TryItValues,
    body: any
  ): Promise<IRawResponse>
}

type TryItInputType =
  | 'boolean'
  | 'int64'
  | 'integer'
  | 'float'
  | 'double'
  | 'string'
  | 'hostname'
  | 'uuid'
  | 'uri'
  | 'ipv4'
  | 'ipv6'
  | 'email'
  | 'password'
  | 'datetime'

type TryItInputLocation = 'body' | 'path' | 'query' | 'header' | 'cookie'

/**
 * A TryIt input type describing a single REST request's parameter or a structure
 */
export interface TryItInput {
  name: string
  location: TryItInputLocation
  /** A TryItInputType or a structure */
  type: TryItInputType | any
  required: boolean
  description: string
}

interface TryItProps {
  /** API version to Try */
  specKey: string
  /** An array of parameters associated with a given endpoint */
  inputs: TryItInput[]
  /** HTTP Method */
  httpMethod: TryItHttpMethod
  /** Request path with path params in curly braces e.g. /looks/{look_id}/run/{result_format} */
  endpoint: string
  /** A optional HTTP request provider to override the default Looker browser SDK request provider */
  tryItCallback?: TryItCallback
}

type ResponseContent = IRawResponse | undefined

/**
 * Given an array of inputs, an HTTP method, an endpoint and an api version (specKey) it renders a REST request form
 * which on submit performs a REST request and renders the response with the appropriate MIME type handler
 */
export const TryIt: FC<TryItProps> = ({
  specKey,
  inputs,
  httpMethod,
  endpoint,
  tryItCallback,
}) => {
  const [requestContent, setRequestContent] = useState({})
  const [activePathParams, setActivePathParams] = useState(undefined)
  const [loading, setLoading] = useState(false)
  const [responseContent, setResponseContent] = useState<ResponseContent>(
    undefined
  )
  const tabs = useTabs()
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
          <RequestForm
            httpMethod={httpMethod}
            inputs={inputs}
            requestContent={requestContent}
            setRequestContent={setRequestContent}
            handleSubmit={handleSubmit}
          />
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
