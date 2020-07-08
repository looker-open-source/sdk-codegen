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

import {
  ApiSettings,
  DefaultSettings,
  IApiSettings,
  IApiSection,
  IRawResponse,
  LookerBrowserSDK,
} from '@looker/sdk/lib/browser'

import { TryItHttpMethod, TryItInput, TryItValues } from '../TryIt'

// https://docs.looker.com/reference/api-and-integration/api-cors
// TODO create a separate file for TryItSettings and the default request handler
const settings = {
  ...DefaultSettings(),
  agentTag: 'TryIt',
  base_url: 'https://self-signed.looker.com:19999',
} as IApiSettings

class TryItSettings extends ApiSettings {
  constructor(settings: Partial<IApiSettings>) {
    super({ ...settings, ...{ client_id: 'looker.api-explorer' } })
  }

  isConfigured(): boolean {
    const creds = this.readConfig()
    return (
      super.isConfigured() && 'redirect_uri' in creds && 'looker_url' in creds
    )
  }

  readConfig(_section?: string): IApiSection {
    return {
      ...super.readConfig(_section),
      ...{
        client_id: 'looker.api-explorer',
        looker_url: 'https://self-signed.looker.com:9999',
        redirect_uri: 'https://localhost:8080/oauth',
      },
    }
  }
}

// TODO get these values from the stand-alone TryIt provider
export const tryItSDK = LookerBrowserSDK.init40(new TryItSettings(settings))

/**
 * Replaces {foo} with vars[foo] in provided path
 * @param template Path with path param names
 * @param vars Collection of path params
 * @returns Path with param names replaced with values
 */
const macro = (path: string, vars: TryItValues) =>
  path.replace(/{(\w+)}/g, (_, b) => vars[b])

/**
 * Construct a full request path including path params
 * @param path A request path with path params in curly braces e.g. /queries/{query_id}/run/{result_format}
 * @param pathParams Collection of path params
 * @returns a full request path
 */
export const pathify = (path: string, pathParams?: TryItValues): string => {
  let result = path
  if (pathParams && path.includes('{')) {
    result = macro(path, pathParams)
  }
  return result
}

/**
 * Takes all form input values and categorizes them based on their request location
 * @param inputs TryIt form inputs
 * @param requestContent Form input values
 * @returns path, query and body param objects
 */
export const createRequestParams = (
  inputs: TryItInput[],
  requestContent: TryItValues
) => {
  const pathParams = {}
  const queryParams = {}
  let body
  for (const input of inputs) {
    const name = input.name
    switch (input.location) {
      case 'path':
        pathParams[name] = requestContent[name]
        break
      case 'query':
        queryParams[name] = requestContent[name]
        break
      case 'body':
        try {
          body = JSON.parse(requestContent[name])
        } catch (e) {
          /** Treat as x-www-form-urlencoded */
          body = requestContent[name]
        }
        break
      default:
        throw new Error(`Invalid input location: '${input.location}'`)
    }
  }
  return [pathParams, queryParams, body]
}

/**
 * Makes an http request using the SDK browser transport rawRequest method
 * @param specKey API version to Try
 * @param httpMethod Request operation
 * @param endpoint Request path with path params in curly braces e.g. /queries/{query_id}/run/{result_format}
 * @param pathParams Collection of path params
 * @param queryParams Collection of query params
 * @param body Collection of body params
 */
export const defaultTryItCallback = async (
  specKey: string,
  httpMethod: TryItHttpMethod,
  endpoint: string,
  pathParams: TryItValues,
  queryParams: TryItValues,
  body: any
): Promise<IRawResponse> => {
  // TODO provide the API path via callback
  if (!tryItSDK.authSession.isAuthenticated()) await tryItSDK.ok(tryItSDK.authSession.login())
  const url = `/api/${specKey}${pathify(endpoint, pathParams)}`
  return await tryItSDK.authSession.transport.rawRequest(
    httpMethod,
    url,
    queryParams,
    body,
    (props) => tryItSDK.authSession.authenticate(props)
  )
}
