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

import { ApiModel, SpecList } from '@looker/sdk-codegen'
import { Location as HLocation } from 'history'

import { diffPath, oAuthPath } from '../../utils'
import { SpecState } from './reducer'

export type AbstractLocation = HLocation | Location

/**
 * Given a collection of specs, it returns the spec marked as default, the one
 * marked as current or the first one, in that order.
 * @param specs A collection of specs
 * @returns A spec
 */
export const getDefaultSpecKey = (specs: SpecList): string => {
  const items = Object.entries(specs)

  if (items.length === 0) {
    throw Error('No specs found.')
  }

  let specKey = ''
  items.forEach(([key, item]) => {
    if (item.isDefault) {
      specKey = key
    }
  })

  if (!specKey) {
    items.forEach(([key, item]) => {
      if (item.status === 'current') {
        specKey = key
      }
    })
  }

  if (!specKey) {
    specKey = Object.keys(specs)[0]
  }

  if (!specKey) {
    throw Error('No specs found.')
  }

  return specKey
}

/**
 * Load the spec
 * @param spec Spec content
 * @returns ApiModel Parsed api with dynamic types loaded
 */
export const parseSpec = (spec: string) => ApiModel.fromJson(spec)

/**
 * Fetches and loads the API specification
 *
 * Generates dynamic types after loading
 *
 * TODO change default based on /versions
 * TODO use URL instead of version and derive version from reading the specification
 *
 * @param key API version
 * @param specs A collection of specs
 * @returns SpecItem Parsed api with dynamic types loaded
 */
export const fetchSpec = (key: string, specs: SpecList): SpecState => {
  const selectedSpec = specs[key]
  if (!selectedSpec) {
    throw Error(`Spec not found: "${key}"`)
  }

  let spec: SpecState
  if (selectedSpec.api) {
    spec = { ...selectedSpec, key } as SpecState
  } else if (selectedSpec.specContent) {
    // TODO: maybe discard specContent if specURL is present?
    spec = {
      ...selectedSpec,
      key,
      api: parseSpec(selectedSpec.specContent),
    }
  } else if (selectedSpec.specURL) {
    // TODO: add fetch
    // const content = await fetch(spec.specURL)
    // spec.api = parseSpec(await content.text())
    // return spec
  } else {
    throw Error('Could not fetch spec.')
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return spec
}

/**
 * Determine the API specification key from URL pattern or default spec
 * @param location service to examine
 * @param specs to use to find the default spec key
 */
export const getSpecKey = (location: AbstractLocation, specs?: SpecList) => {
  const pathNodes = location.pathname.split('/')
  let specKey = ''
  if (
    pathNodes.length > 1 &&
    pathNodes[1] &&
    pathNodes[1] !== oAuthPath &&
    pathNodes[1] !== diffPath
  ) {
    specKey = pathNodes[1]
  } else if (specs) {
    specKey = getDefaultSpecKey(specs)
  }
  return specKey
}

/**
 * Creates a default state object with the spec matching the specKey defined
 * in the url or the default criteria in getDefaultSpecKey
 * @param specs A collection of specs
 * @param location Standalone or extension location
 * @returns An object to be used as default state
 */
export const initDefaultSpecState = (
  specs: SpecList,
  location: AbstractLocation
): SpecState => {
  const specKey = getSpecKey(location, specs)
  return fetchSpec(specKey, specs)
}
