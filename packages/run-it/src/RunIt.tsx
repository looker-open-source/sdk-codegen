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

import React, {
  BaseSyntheticEvent,
  FC,
  useContext,
  useState,
  useEffect,
} from 'react'
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
import { IRawResponse, Looker40SDK } from '@looker/sdk/lib/browser'
import {
  RequestForm,
  ShowResponse,
  ConfigForm,
  LoginForm,
  Loading,
  RunItConfigurator,
} from './components'
import {
  createRequestParams,
  runRequest,
  pathify,
  sdkNeedsConfig,
  RunItSettings,
} from './utils'
import { PerfTracker } from './components/PerfTracker/PerfTracker'
import { PerfTimings } from './components/PerfTracker/perfUtils'
import { RunItContext } from '.'

export type RunItHttpMethod = 'GET' | 'PUT' | 'POST' | 'PATCH' | 'DELETE'

/**
 * Generic collection
 */
export type RunItValues = { [key: string]: any }

type RunItInputType =
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

type RunItInputLocation = 'body' | 'path' | 'query' | 'header' | 'cookie'

/**
 * A RunIt input type describing a single REST request's parameter or a structure
 */
export interface RunItInput {
  name: string
  location: RunItInputLocation
  /** A RunItInputType or a structure */
  type: RunItInputType | any
  required: boolean
  description: string
}

export type StorageLocation = 'session' | 'local'

export interface IStorageValue {
  location: StorageLocation
  value: string
}

interface PerfTabPanelProps {
  perf: PerfTimings
  /** Is this running in an extension? */
  isExtension: boolean
  /** Configuration provider */
  configurator: RunItConfigurator
}

export const PerfTabPanel: FC<PerfTabPanelProps> = ({
  perf,
  isExtension,
  configurator,
}) => {
  if (isExtension) return <></>
  return (
    <TabPanel key="performance">
      <PerfTracker perf={perf} configurator={configurator} />
    </TabPanel>
  )
}

interface PerfTabProps {
  /** Is this running in an extension? */
  isExtension: boolean
}

export const PerfTab: FC<PerfTabProps> = ({ isExtension }) => {
  if (isExtension) return <></>
  return <Tab key="performance">Performance</Tab>
}

interface RunItProps {
  /** An array of parameters associated with a given endpoint */
  inputs: RunItInput[]
  /** HTTP Method */
  httpMethod: RunItHttpMethod
  /** Request path with path params in curly braces e.g. /looks/{look_id}/run/{result_format} */
  endpoint: string
}

type ResponseContent = IRawResponse | undefined

/**
 * Given an array of inputs, an HTTP method, an endpoint and an api version (specKey) it renders a REST request form
 * which on submit performs a REST request and renders the response with the appropriate MIME type handler
 */
export const RunIt: FC<RunItProps> = ({ inputs, httpMethod, endpoint }) => {
  const { sdk, configurator, basePath } = useContext(RunItContext)

  const [requestContent, setRequestContent] = useState({})
  const [activePathParams, setActivePathParams] = useState({})
  const [loading, setLoading] = useState(false)
  const [responseContent, setResponseContent] = useState<ResponseContent>(
    undefined
  )
  const [hasConfig, setHasConfig] = useState<boolean>(true)
  const [needsAuth, setNeedsAuth] = useState<boolean>(true)
  const tabs = useTabs()
  let configIsNeeded = false

  const perf = new PerfTimings()

  useEffect(() => {
    if (sdk && sdk instanceof Looker40SDK) {
      const settings = sdk.authSession.settings as RunItSettings
      configIsNeeded = sdkNeedsConfig(sdk)
      setHasConfig(!configIsNeeded || settings.authIsConfigured())
      setNeedsAuth(configIsNeeded && !sdk.authSession.isAuthenticated())
    } else {
      setHasConfig(true)
      setNeedsAuth(false)
    }
  }, [sdk])

  const handleSubmit = async (e: BaseSyntheticEvent) => {
    e.preventDefault()

    const [pathParams, queryParams, body] = createRequestParams(
      inputs,
      requestContent
    )
    setActivePathParams(pathParams)
    tabs.onSelectTab(1)
    if (sdk) {
      setLoading(true)
      setResponseContent(
        await runRequest(
          sdk,
          basePath,
          httpMethod,
          endpoint,
          pathParams,
          queryParams,
          body
        )
      )
    }
  }

  useEffect(() => {
    setLoading(!responseContent)
  }, [responseContent])

  // No SDK, no RunIt for you!
  if (!sdk) return <></>

  return (
    <Box>
      <Heading>
        <Badge>{httpMethod}</Badge> <Text>{endpoint}</Text>
      </Heading>
      <TabList {...tabs}>
        <Tab key="request">Request</Tab>
        <Tab key="response">Response</Tab>
        <PerfTab isExtension={!configIsNeeded} />
      </TabList>
      <TabPanels {...tabs}>
        <TabPanel key="request">
          {!needsAuth && hasConfig && (
            <RequestForm
              httpMethod={httpMethod}
              inputs={inputs}
              requestContent={requestContent}
              setRequestContent={setRequestContent}
              handleSubmit={handleSubmit}
              setHasConfig={setHasConfig}
              configurator={configurator}
            />
          )}
          {!hasConfig && (
            <ConfigForm
              setHasConfig={setHasConfig}
              configurator={configurator}
            />
          )}
          {hasConfig && needsAuth && (
            <LoginForm
              sdk={sdk as Looker40SDK}
              setHasConfig={setHasConfig}
              configurator={configurator}
            />
          )}
        </TabPanel>
        <TabPanel key="response">
          <Loading
            loading={loading}
            message={`${httpMethod} ${pathify(endpoint, activePathParams)}`}
          />
          {responseContent && (
            <ShowResponse
              response={responseContent}
              verb={httpMethod}
              path={pathify(endpoint, activePathParams)}
            />
          )}
        </TabPanel>
        <PerfTabPanel
          perf={perf}
          isExtension={!configIsNeeded}
          configurator={configurator}
        />
      </TabPanels>
    </Box>
  )
}
