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
import React, { ReactElement } from 'react'
import { ApiModel } from '@looker/sdk-codegen'

import { NotFound } from '../components'

/**
 * Checks if spec key matches API spec version
 */
export const validSpecKey = (api: ApiModel, specKey: string) =>
  api.version.startsWith(specKey)

/**
 * Checks if api spec contains tag
 */
export const validTag = (api: ApiModel, tag: string) => tag in api.tags

/**
 * Checks if API spec contains method
 */
export const validMethod = (api: ApiModel, method: string) =>
  method in api.methods

/**
 * Checks if Api spec contains type
 */
export const validType = (api: ApiModel, type: string) => type in api.types

type routeTypes = 'home' | 'tag' | 'method' | 'type'

/**
 * Validates a matched route's params and renders the scene if valid
 * @param match A react router object containing route match information
 * @param routeType The type of route to validate
 * @param api Api spec
 * @param scene Scene to render if route params are valid
 */
export const validateAndRender = (
  match: any,
  routeType: routeTypes,
  api: ApiModel,
  scene: ReactElement<any>
) => {
  let isValid = false

  if (routeType === 'home') {
    isValid = validSpecKey(api, match.params.specKey)
  } else if (routeType === 'tag') {
    isValid = validTag(api, match.params.methodTag)
  } else if (routeType === 'method') {
    isValid =
      validMethod(api, match.params.methodName) &&
      validTag(api, match.params.methodTag)
  } else if (routeType === 'type') {
    isValid = validType(api, match.params.typeName)
  }

  return isValid ? scene : <NotFound />
}
