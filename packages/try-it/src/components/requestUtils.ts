import {
  BrowserTransport,
  IRawResponse,
  ITransportSettings,
} from '@looker/sdk/lib/browser'

import { TryItHttpMethod, TryItInput, TryItValues } from '../TryIt'

const options: ITransportSettings = {
  agentTag: 'TryIt',
  base_url: '',
  verify_ssl: true,
  timeout: 120,
}
const transport = new BrowserTransport(options)

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
 * @param httpMethod Request operation
 * @param endpoint Request path with path params in curly braces e.g. /queries/{query_id}/run/{result_format}
 * @param pathParams Collection of path params
 * @param queryParams Collection of query params
 * @param body Collection of body params
 */
export const defaultRequestCallback = async (
  httpMethod: TryItHttpMethod,
  endpoint: string,
  pathParams: TryItValues,
  queryParams: TryItValues,
  body: any
): Promise<IRawResponse> => {
  const url = pathify(endpoint, pathParams)
  return await transport.rawRequest(httpMethod, url, queryParams, body)
}
