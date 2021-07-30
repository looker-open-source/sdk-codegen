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

import {
  ApiModel,
  getSpecsFromVersions,
  ILookerVersions,
  SpecItem,
  SpecList,
  upgradeSpecObject,
} from '@looker/sdk-codegen'
import { BrowserTransport, DefaultSettings } from '@looker/sdk-rtl'
import { IStorageValue } from '../../index'

export const RunItConfigKey = 'RunItConfig'

export const RunItValuesKey = 'RunItValues'

export interface RunItConfigurator {
  getStorage: (key: string, defaultValue?: string) => IStorageValue
  setStorage(key: string, value: string, location: 'local' | 'session'): string
  removeStorage(key: string): void
}

// TODO move into its own file and probably completely refactor. This is just an example
export class StandaloneConfigurator implements RunItConfigurator {
  getStorage(key: string, defaultValue = ''): IStorageValue {
    let value = sessionStorage.getItem(key)
    if (value) {
      return {
        location: 'session',
        value,
      }
    }
    value = localStorage.getItem(key)
    if (value) {
      return {
        location: 'local',
        value,
      }
    }
    return {
      location: 'session',
      value: defaultValue,
    }
  }

  setStorage(
    key: string,
    value: string,
    location: 'local' | 'session' = 'session'
  ): string {
    switch (location.toLocaleLowerCase()) {
      case 'local':
        localStorage.setItem(key, value)
        break
      case 'session':
        sessionStorage.setItem(key, value)
        break
    }
    return value
  }

  removeStorage(key: string) {
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  }
}

export const defaultConfigurator = new StandaloneConfigurator()

/**
 * Validates URL and standardizes it
 * @param url to validate
 * @returns the standardized url.origin if it's valid, or an empty string if it's not
 */
export const validateUrl = (url: string) => {
  try {
    const result = new URL(url)
    if (url.endsWith(':')) return url
    return result.origin
  } catch {
    return ''
  }
}

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
  fetchError: string
}

/**
 * Use the browser transport to GET a url
 * @param url to fetch
 */
export const getUrl = async (url: string) => {
  const settings = {
    ...DefaultSettings(),
    ...{ base_url: url, verify_ssl: false, headers: { mode: 'cors' } },
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
export const fullify = (uri: string, baseUrl: string) => {
  if (uri.match(/^https?:/)) {
    return uri
  }
  const url = new URL(uri, baseUrl)
  return url.toString()
}

/**
 * Loads the API spec, parses, and assigns to API model
 * @param url for Swagger or OpenAPI specification
 */
export const loadApi = async (url: string) => {
  const source = await getUrl(url)
  const obj = JSON.parse(source)
  const upgrade = upgradeSpecObject(obj)
  return ApiModel.fromJson(upgrade)
}

/**
 * Fetches, parses, and loads the spec's API model if it's not already assigned
 * @param spec to resolve
 */
export const loadSpecApi = async (spec: SpecItem) => {
  if (!spec.api && spec.specURL) {
    spec.api = await loadApi(spec.specURL)
  }
  return spec.api
}

export interface IAPIXConfig extends ILookerVersions {
  headless?: boolean
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
  let fetchError = ''
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
          await loadSpecApi(spec)
        }
      }
      return spec.api
    }
    specs = await getSpecsFromVersions(versions, fetchSpec)
  } catch (e) {
    fetchError = e.message
  }

  return {
    baseUrl,
    webUrl,
    specs,
    headless,
    fetchError,
  }
}

export const validLocation = (location: string) =>
  ['local', 'session'].includes(location.toLocaleLowerCase())
