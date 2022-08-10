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

import type { ApiModel, IMethod, IType } from '@looker/sdk-codegen'
import { firstMethodRef } from '@looker/sdk-codegen'
import type { Location as HLocation } from 'history'
import { matchPath } from 'react-router'

export const methodFilterOptions = /GET$|POST$|PUT$|PATCH$|DELETE$/i
export const typeFilterOptions = /SPECIFICATION$|WRITE$|REQUEST$|ENUMERATED$/i

/**
 * Builds a path matching the route used by MethodScene
 * @param specKey A string to identify the spec in the URL
 * @param tag Corresponding method tag
 * @param methodName A method name
 * @param params Hash of query param name/value pairs to include in the destination url
 * @returns a Method path
 */
export const buildMethodPath = (
  specKey: string,
  tag: string,
  methodName: string,
  params?: string
) => `/${specKey}/methods/${tag}/${methodName}${params ? `?${params}` : ''}`

/**
 * Builds a path matching the route used by TypeScene
 * @param specKey A string to identify the spec in the URL
 * @param tag Corresponding type tag
 * @param typeName A type name
 * @param params Hash of query param name/value pairs to include in the destination url
 * @returns a Type path
 */
export const buildTypePath = (
  specKey: string,
  tag: string,
  typeName: string,
  params?: string
) => `/${specKey}/types/${tag}/${typeName}${params ? `?${params}` : ''}`

export const diffPath = 'diff'
export const oAuthPath = 'oauth'

/**
 * Returns the tag for a given method name
 * @param api Parsed api
 * @param methodName SDK method name
 * @returns Corresponding tag
 */
const getMethodTag = (api: ApiModel, methodName: string) => {
  // Find tag containing methodName
  return Object.entries(api.tags)
    .filter(([, methods]) => methodName in methods)
    .map(([methodTag]) => methodTag)[0]
}

/**
 * Is this item a method? Check without requiring `instanceof Method`
 * @param item to check for method or type
 */
export const isMethod = (item: IMethod | IType) => 'params' in item

/**
 * Return the tag for a give type
 * @param api Parsed api
 * @param type to tag
 */
const getTypeTag = (api: ApiModel, type: IType) => {
  const method = firstMethodRef(api, type)
  return getMethodTag(api, method.name)
}

/**
 * Builds a path matching MethodScene or TypeScene route
 * @param api parsed api
 * @param item A method or type item
 * @param specKey A string to identify the spec in the url
 * @returns a method or type path
 */
export const buildPath = (
  api: ApiModel,
  item: IMethod | IType,
  specKey: string
) => {
  let path
  if (isMethod(item)) {
    const tag = getMethodTag(api, item.name)
    path = buildMethodPath(specKey, tag, item.name)
  } else {
    const tag = getTypeTag(api, item as IType)
    path = buildTypePath(specKey, tag, item.name)
  }
  return path
}

/**
 * Determine API specification keys from URL pattern
 * @param location service to examine
 */
export const getSpecKey = (location: HLocation | Location): string | null => {
  const pathname = location.pathname
  let match
  if (pathname.startsWith(`/${diffPath}`)) {
    const pattern = new RegExp(`(?:/${diffPath})/(?<specKey>\\w+.\\w+)`)
    match = pathname.match(pattern)
  } else {
    match = pathname.match(/\/(?<specKey>\w+\.\w+).*/)
  }
  return match?.groups?.specKey || null
}

/**
 * Gets the scene type of the current page
 * @param path path of browser location
 * @returns string representing the scene type
 */
export const getSceneType = (path: string) => {
  const match = matchPath<{ tagType: string }>(path, {
    path: '/:specKey/:tagType',
  })
  return match ? match!.params.tagType : ''
}

/**
 * Confirms if filter is valid for the page scene type
 * @param location browser location
 * @param filter filter tag for page
 */
export const isValidFilter = (
  location: HLocation | Location,
  filter: string
) => {
  const sceneType = getSceneType(location.pathname)
  if (!sceneType) return false
  else if (!filter.localeCompare('all', 'en', { sensitivity: 'base' }))
    return true
  else if (sceneType === 'methods') {
    return methodFilterOptions.test(filter)
  } else {
    return typeFilterOptions.test(filter)
  }
}
