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
import React from 'react'
import { ApiModel, IMethod, IType, Method } from '@looker/sdk-codegen'
import { Link } from 'react-router-dom'

import { buildMethodPath, buildTypePath, highlightHTML } from '../../utils'
import { ApixHeading } from '../common'

/**
 * Returns the tag for a given method name
 * @param api Parsed api
 * @param methodName SDK method name
 * @returns Corresponding tag
 */
const getTag = (api: ApiModel, methodName: string) => {
  // Find tag containing methodName
  return Object.entries(api.tags)
    .filter(([, methods]) => methodName in methods)
    .map(([methodTag]) => methodTag)[0]
}

/**
 * Builds a path matching MethodScene or TypeScene route
 * @param api
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
  if (item instanceof Method) {
    path = buildMethodPath(specKey, getTag(api, item.name), item.name)
  } else {
    path = buildTypePath(specKey, item.name)
  }
  return path
}

/**
 * Renders a heading and links to all item types
 */
export const DocReferenceItems = (
  heading: string,
  items: (IType | IMethod)[],
  api: ApiModel,
  specKey: string,
  pattern: string
) => {
  if (items.length === 0) return <></>

  return (
    <>
      <ApixHeading as="h4">{heading}</ApixHeading>
      {items.map((item, index) => (
        <span className="doc-link" key={item.name}>
          {index ? ', ' : ''}
          <Link to={buildPath(api, item, specKey)}>
            {highlightHTML(pattern, item.name)}
          </Link>
        </span>
      ))}
    </>
  )
}
