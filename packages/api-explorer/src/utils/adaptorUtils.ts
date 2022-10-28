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

import type { ILookerVersions, SpecItem, SpecList } from '@looker/sdk-codegen'
import { ApiModel, upgradeSpecObject } from '@looker/sdk-codegen'
import { api_spec } from '@looker/sdk'
import { getEnvAdaptor } from '@looker/extension-utils'
import type { RunItValues } from '@looker/run-it'
import { getUrl } from '@looker/run-it'

export type StorageLocation = 'session' | 'local'

/** Object returned from storage service */
export interface IStorageValue {
  /** Location of the stored object */
  location: StorageLocation
  /** Stored string representation of the value (usually JSON) */
  value: string
}

/** function to retrieve a spec based on version and name */
export type ApiSpecFetcher = (
  version: string,
  name: string
) => Promise<string | RunItValues>

/** Either the spec is parsed or it's undefined */
export type ParsedSpec = ApiModel | undefined

/** service abstraction for extension and browser based usage */
export interface RunItConfigurator {
  getStorage: (key: string, defaultValue?: string) => IStorageValue
  setStorage(key: string, value: string, location: 'local' | 'session'): string
  removeStorage(key: string): void
}

/** Processed specifications */
export interface ILoadedSpecs {
  /** API server url */
  baseUrl: string
  /** Web server url */
  webUrl: string
  /** should APIX run headless? */
  headless: boolean
  /** loaded specifications */
  specs: SpecList
  /** communication errors */
  fetchResult: string
}

/** Extends versions payload with headless toggle for API Explorer */
export interface IAPIXConfig extends ILookerVersions {
  headless?: boolean
}

/**
 * Convert content into an ApiModel
 * @param content to convert
 */
const makeApi = (content: string | RunItValues) => {
  let json
  if (typeof content === 'string') {
    json = JSON.parse(content)
  } else {
    json = content
  }
  json = upgradeSpecObject(json)
  return ApiModel.fromJson(json)
}

/**
 * Ensure the URI is a full URL
 * @param uri possible relative path
 * @param baseUrl base url for qualifying full path
 */
export const fullify = (uri: string, baseUrl: string): string => {
  if (uri.match(/^https?:/)) {
    return uri
  }
  const url = new URL(uri, baseUrl)
  console.log({ baseUrl, uri, url })
  return url.toString()
}
/**
 * parse spec url into version and name for api_spec call
 * @param spec to parse
 */
const apiSpecBits = (spec: SpecItem): string[] =>
  spec.specURL?.split('/').slice(-2) || []

/**
 * Use the functional api_spec fetch
 * @param version to retrieve
 * @param name to retrieve
 */
export const funFetch = (version: string, name: string): Promise<string> => {
  const sdk = getEnvAdaptor().sdk
  return sdk.ok(api_spec(sdk, version, name))
}

/**
 * try to fetch a spec by URL, trap any errors and return undefined
 * @param url to convert to an API spec
 */
export const specUrlFetch = async (url: string): Promise<ParsedSpec> => {
  try {
    const content = await getUrl(url)
    return makeApi(content)
  } catch (error) {
    return undefined
  }
}

/**
 * fetch and compile an API specification to an ApiModel if it's not already available
 *
 * **NOTE**: This uses Looker API 4.0 to fetch the specification so fetch works with CORS
 *
 * @param spec to fetch and compile
 * @param fetcher function to retrieve API spec content
 */
export const sdkSpecFetch = async (
  spec: SpecItem,
  fetcher: ApiSpecFetcher
): Promise<ParsedSpec> => {
  if (spec.api) return spec.api
  if (!spec.specURL) return undefined
  const [version, name] = apiSpecBits(spec)
  const content = await fetcher(version, name)
  return makeApi(content)
}

/** Attempt to retrieve spec by URL, then api_spec SDK call
 *
 * @param spec to fetch
 * @param fetcher function to retrieve and parse spec
 */
export const fallbackFetch = async (
  spec: SpecItem,
  fetcher: ApiSpecFetcher
): Promise<ParsedSpec> => {
  if (spec.api) return spec.api
  if (!spec.specURL) return undefined
  let api: ParsedSpec
  try {
    api = await specUrlFetch(spec.specURL)
  } catch (error) {
    console.error({ error })
  }
  if (!api) {
    const sdk = getEnvAdaptor().sdk
    const authed = sdk.authSession.isAuthenticated()
    if (!authed) {
      await sdk.authSession.login()
    }
    api = await sdkSpecFetch(spec, fetcher)
  }
  return api
}
