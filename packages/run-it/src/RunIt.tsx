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

import React, {
  BaseSyntheticEvent,
  FC,
  useContext,
  useState,
  useEffect,
} from 'react'
import {
  Box,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
  useTabs,
} from '@looker/components'
import { ApiModel, IMethod } from '@looker/sdk-codegen'
import {
  RequestForm,
  ResponseExplorer,
  Loading,
  DocSdkCalls,
  ResponseContent,
  RunItConfigurator,
  RunItFormKey,
} from './components'
import {
  createRequestParams,
  runRequest,
  pathify,
  sdkNeedsConfig,
  prepareInputs,
  RunItSettings,
} from './utils'
import { PerfTracker, PerfTimings } from './components/PerfTracker'
import { RunItSetter, runItNoSet, RunItContext } from '.'

export type RunItHttpMethod = 'GET' | 'PUT' | 'POST' | 'PATCH' | 'DELETE'

/**
 * Generic collection
 */
export type RunItValues = Record<string, any>

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

/**
 * Load and clear any saved form values from the session
 * @param configurator storage service
 */
const formValues = (configurator: RunItConfigurator) => {
  const storage = configurator.getStorage(RunItFormKey)
  const result = storage.value ? JSON.parse(storage.value) : {}
  configurator.removeStorage(RunItFormKey)
  return result
}

interface RunItProps {
  /** spec model to use for sdk call generation */
  api: ApiModel
  /** An array of parameters associated with a given endpoint */
  inputs: RunItInput[]
  /** Method to test */
  method: IMethod
  /** Set versions Url callback */
  setVersionsUrl: RunItSetter
  /** Sdk language to use for generating call syntax */
  sdkLanguage?: string
}

/**
 * Given an array of inputs, a method, and an api model it renders a REST request form
 * which on submit performs a REST request and renders the response with the appropriate MIME type handler
 */
export const RunIt: FC<RunItProps> = ({
  api,
  inputs,
  method,
  setVersionsUrl = runItNoSet,
  sdkLanguage = 'All',
}) => {
  const httpMethod = method.httpMethod as RunItHttpMethod
  const endpoint = method.endpoint
  const { sdk, configurator, basePath } = useContext(RunItContext)

  const [requestContent, setRequestContent] = useState(formValues(configurator))
  const [activePathParams, setActivePathParams] = useState({})
  const [loading, setLoading] = useState(false)
  const [responseContent, setResponseContent] =
    useState<ResponseContent>(undefined)
  const [isExtension, setIsExtension] = useState<boolean>(false)
  const [hasConfig, setHasConfig] = useState<boolean>(true)
  const [needsAuth, setNeedsAuth] = useState<boolean>(true)
  const tabs = useTabs()

  const perf = new PerfTimings()

  useEffect(() => {
    if (sdk) {
      const settings = sdk.authSession.settings as RunItSettings
      const configIsNeeded = sdkNeedsConfig(sdk)
      setIsExtension(!configIsNeeded)
      setHasConfig(!configIsNeeded || settings.authIsConfigured())
      setNeedsAuth(configIsNeeded && !sdk.authSession.isAuthenticated())
    } else {
      setIsExtension(true)
      setHasConfig(true)
      setNeedsAuth(false)
    }
  }, [hasConfig, isExtension, needsAuth, sdk])

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
      let response: ResponseContent
      try {
        response = await runRequest(
          sdk,
          basePath,
          httpMethod,
          endpoint,
          pathParams,
          queryParams,
          body
        )
      } catch (err) {
        // This should not happen but it could. runRequest uses
        // sdk.ok to login once. sdk.ok throws an error so fake
        // out the response so something can be rendered.
        response = {
          ok: false,
          statusMessage: err.message ? err.message : 'Unknown error!',
          statusCode: -1,
          contentType: 'application/json',
          body: JSON.stringify(err),
          headers: {},
        } as ResponseContent
      }
      setResponseContent(response)
      setLoading(false)
    }
  }

  // useEffect(() => {
  //   setLoading(!responseContent)
  // }, [responseContent])

  // No SDK, no RunIt for you!
  if (!sdk) return <></>

  return (
    <Box bg="background" py="large" height="100%">
      <TabList distribute {...tabs}>
        <Tab key="request">Request</Tab>
        <Tab key="response">Response</Tab>
        <Tab key="makeTheCall">SDK Call</Tab>
        {isExtension ? <></> : <Tab key="performance">Performance</Tab>}
      </TabList>
      <TabPanels px="xxlarge" {...tabs} overflow="auto" height="87vh">
        <TabPanel key="request">
          <RequestForm
            sdk={sdk}
            httpMethod={httpMethod}
            inputs={inputs}
            requestContent={requestContent}
            setRequestContent={setRequestContent}
            handleSubmit={handleSubmit}
            needsAuth={needsAuth}
            hasConfig={hasConfig}
            setHasConfig={setHasConfig}
            configurator={configurator}
            isExtension={isExtension}
            setVersionsUrl={setVersionsUrl}
          />
        </TabPanel>
        <TabPanel key="response">
          <Loading
            loading={loading}
            message={`${httpMethod} ${pathify(endpoint, activePathParams)}`}
          />
          <ResponseExplorer
            response={responseContent}
            verb={httpMethod}
            path={pathify(endpoint, activePathParams)}
          />
        </TabPanel>
        <TabPanel key="makeTheCall">
          <DocSdkCalls
            sdkLanguage={sdkLanguage}
            api={api}
            method={method}
            inputs={prepareInputs(inputs, requestContent)}
          />
        </TabPanel>
        {isExtension ? (
          <></>
        ) : (
          <TabPanel key="performance">
            <PerfTracker perf={perf} configurator={configurator} />
          </TabPanel>
        )}
      </TabPanels>
    </Box>
  )
}
