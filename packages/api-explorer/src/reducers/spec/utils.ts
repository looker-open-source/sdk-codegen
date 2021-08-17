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

import { SpecList } from '@looker/sdk-codegen'
import { Location as HLocation } from 'history'
import { OAuthSession } from '@looker/sdk-rtl'
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
 * Determine the API specification key from URL pattern or default spec
 * @param location service to examine
 * @param specs to use to find the default spec key
 */
export const getSpecKey = (location: AbstractLocation, specs?: SpecList) => {
  let pathName = location.pathname
  if (pathName === '/oauth') {
    const returnUrl = sessionStorage.getItem(OAuthSession.returnUrlKey)
    if (returnUrl) {
      pathName = returnUrl
    }
  }
  const pathNodes = pathName.split('/')
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
  console.log({ pathName, specKey })
  return specKey
}

/**
 * Creates a default state object with the spec matching the specKey defined
 * in the url or the default criteria in getDefaultSpecKey
 * @param specList A collection of specs
 * @param location Standalone or extension location
 * @returns An object to be used as default state
 */
export const initDefaultSpecState = (
  specList: SpecList,
  location: AbstractLocation
): SpecState => {
  const specKey = getSpecKey(location, specList)
  return {
    specList,
    spec: specList[specKey],
  }
}
