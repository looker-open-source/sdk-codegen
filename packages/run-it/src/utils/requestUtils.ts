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

import { Looker31SDK, Looker40SDK } from '@looker/sdk/lib/browser'
import { IRawResponse } from '@looker/sdk-rtl/lib/browser'
import { cloneDeep } from 'lodash'

import { RunItHttpMethod, RunItInput, RunItValues } from '../RunIt'
import { runItSDK } from './RunItSDK'

/**
 * Replaces {foo} with vars[foo] in provided path
 * @param path with templatized param names
 * @param vars Collection of path params
 * @returns Path with param names replaced with values
 */
const macro = (path: string, vars: RunItValues) =>
  path.replace(/{(\w+)}/g, (_, b) => vars[b])

/**
 * Construct a full request path including path params
 * @param path A request path with path params in curly braces e.g. /queries/{query_id}/run/{result_format}
 * @param pathParams Collection of path params
 * @returns a full request path
 */
export const pathify = (path: string, pathParams?: RunItValues): string => {
  let result = path
  if (pathParams && path.includes('{')) {
    result = macro(path, pathParams)
  }
  return result
}

export const prepareInputs = (
  inputs: RunItInput[],
  requestContent: RunItValues
) => {
  const result = cloneDeep(requestContent)
  for (const input of inputs) {
    const name = input.name
    if (input.location === 'body') {
      try {
        result[name] = JSON.parse(result[name])
      } catch (e) {
        /** Treat as x-www-form-urlencoded */
        result[name] = requestContent[name]
      }
    }
  }
  return result
}

/**
 * Takes all form input values and categorizes them based on their request location
 * @param inputs RunIt form inputs
 * @param requestContent Form input values
 * @returns path, query and body param objects
 */
export const createRequestParams = (
  inputs: RunItInput[],
  requestContent: RunItValues
) => {
  const pathParams = {}
  const queryParams = {}
  const prepped = prepareInputs(inputs, requestContent)
  let body
  for (const input of inputs) {
    const name = input.name
    switch (input.location) {
      case 'path':
        pathParams[name] = prepped[name]
        break
      case 'query':
        queryParams[name] = prepped[name]
        break
      case 'body':
        body = prepped[name]
        break
      default:
        throw new Error(`Invalid input location: '${input.location}'`)
    }
  }
  return [pathParams, queryParams, body]
}

/**
 * Makes an http request using the SDK browser transport rawRequest method
 * @param basePath base path for the URL. For standalone this includes the specKey. Empty for extension.
 * @param httpMethod Request operation
 * @param endpoint Request path with path params in curly braces e.g. /queries/{query_id}/run/{result_format}
 * @param pathParams Collection of path params
 * @param queryParams Collection of query params
 * @param body Collection of body params
 */
export const runRequest = async (
  sdk: Looker31SDK | Looker40SDK,
  basePath: string,
  httpMethod: RunItHttpMethod,
  endpoint: string,
  pathParams: RunItValues,
  queryParams: RunItValues,
  body: any
): Promise<IRawResponse> => {
  if (!sdk.authSession.isAuthenticated()) {
    await sdk.ok(runItSDK.authSession.login())
  }
  const url = `${basePath}${pathify(endpoint, pathParams)}`
  return await sdk.authSession.transport.rawRequest(
    httpMethod,
    url,
    queryParams,
    body,
    (props) => runItSDK.authSession.authenticate(props)
  )
}
