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
import {
  ApiModel,
  getSpecsFromVersions,
  upgradeSpecObject,
} from '@looker/sdk-codegen'
import { BrowserTransport, DefaultSettings } from '@looker/sdk-rtl'
import { api_spec } from '@looker/sdk'
import { getEnvAdaptor } from '@looker/extension-utils'

import type { RunItValues } from '../..'

export type StorageLocation = 'session' | 'local'
export const RunItConfigKey = 'RunItConfig'
export const RunItFormKey = 'RunItForm'
export const RunItNoConfig = { base_url: '', looker_url: '' }

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
 * Validates URL and standardizes it
 * @param url to validate
 * @returns the standardized url.origin if it's valid, or an empty string if it's not
 */
export const validateUrl = (url: string): string => {
  try {
    const result = new URL(url)
    if (url.endsWith(':')) return url
    return result.origin
  } catch {
    return ''
  }
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
 * Use the browser transport to GET a url
 * @param url to fetch
 */
export const getUrl = async (url: string): Promise<string | RunItValues> => {
  const settings = {
    ...DefaultSettings(),
    ...{ base_url: url, verify_ssl: false },
  }
  const xp = new BrowserTransport(settings)
  const response = await xp.rawRequest('GET', url)
  return response.body
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
  return url.toString()
}
/**
 * parse spec url into version and name for api_spec cccall
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
 * Load versions payload and retrieve all supported specs
 *
 * The versions payload should match the structure of Looker's /versions endpoint
 *
 * @param url that has an unauthenticated versions payload. For Looker, this is <LookerHostName>/versions
 * @param content content of versions payload that may already be assigned
 * @param defer true to defer fetching and parsing the spec. Defaults to true.
 */
export const loadSpecsFromVersions = async (
  url: string,
  content: string | Record<string, unknown> = '',
  defer = true
): Promise<ILoadedSpecs> => {
  let fetchResult = ''
  let specs: SpecList = {}
  let baseUrl = ''
  let webUrl = ''
  let headless = false
  try {
    if (!content) {
      content = await getUrl(url)
    }
    const versions = (
      typeof content === 'string' ? JSON.parse(content) : content
    ) as IAPIXConfig
    const origin = (window as any).location.origin
    baseUrl = versions.api_server_url
    webUrl = versions.web_server_url
    if (versions.headless !== undefined) {
      headless = versions.headless
    }
    const fetchSpec = async (spec: SpecItem) => {
      if (spec.specURL) {
        spec.specURL = fullify(spec.specURL, origin)
        if (!defer) {
          spec.api = await fallbackFetch(spec, funFetch)
        }
      }
      return spec.api
    }
    specs = await getSpecsFromVersions(versions, fetchSpec)
  } catch (e: any) {
    fetchResult = e.message
  }

  return {
    baseUrl,
    webUrl,
    specs,
    headless,
    fetchResult: fetchResult,
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
