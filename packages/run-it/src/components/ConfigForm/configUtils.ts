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
  /** apiServerUrl */
  baseUrl: string
  /** /versions server url */
  lookerUrl: string
  /** loaded specifications */
  specs: SpecList
  /** communication errors */
  fetchError: string
}

const getUrl = async (url: string) => {
  const settings = {
    ...DefaultSettings(),
    ...{ base_url: url, verify_ssl: false, headers: { mode: 'cors' } },
  }
  const xp = new BrowserTransport(settings)
  const response = await xp.rawRequest('GET', url)
  return response.body
}

/**
 * Load versions payload and retrieve all supported specs
 *
 * The versions payload should match the structure of Looker's /versions endpoint
 *
 * @param url that has an unauthenticated versions payload. For Looker, this is <LookerHostName>/versions
 * @param content content of versions payload that may already be assigned
 */
export const loadSpecsFromVersions = async (
  url: string,
  content: string | Record<string, unknown> = ''
): Promise<ILoadedSpecs> => {
  let fetchError = ''
  let specs: SpecList = {}
  let baseUrl = ''
  try {
    if (!content) {
      content = await getUrl(url)
    }
    const versions = (
      typeof content === 'string' ? JSON.parse(content) : content
    ) as ILookerVersions
    baseUrl = versions.api_server_url
    const fetchSpec = async (spec: SpecItem) => {
      if (spec.specURL) {
        const source = await getUrl(spec.specURL!)
        const obj = JSON.parse(source)
        const upgrade = upgradeSpecObject(obj)
        spec.api = ApiModel.fromJson(upgrade)
      }
      return spec.api
    }
    specs = await getSpecsFromVersions(versions, fetchSpec)
  } catch (e) {
    fetchError = e.message
  }

  return {
    baseUrl,
    specs,
    lookerUrl: url,
    fetchError,
  }
}

export const validLocation = (location: string) =>
  ['local', 'session'].includes(location.toLocaleLowerCase())
