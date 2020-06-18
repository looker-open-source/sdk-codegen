/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2020 Looker Data Sciences, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import React, { FC } from 'react'
import { ISearchResult, TagList, IMethod } from '@looker/sdk-codegen'
import { Box, Heading } from '@looker/components'

import { SideNavTags } from '../SideNav/SideNavTags'
import { SideNavTypes } from '../SideNav/SideNavTypes'

const allMethods = (tags: TagList): Array<IMethod> => {
  const result: Array<IMethod> = []
  Object.values(tags).forEach((methods) => {
    Object.values(methods).forEach((method) => {
      result.push(method)
    })
  })
  return result
}

export const SearchResults: FC<ISearchResult & { specKey: string }> = ({
  tags = {},
  types = {},
  specKey,
}) => {
  const methods = allMethods(tags)
  const methodMatches = Object.entries(methods).length
  const typeMatches = Object.entries(types).length
  const resultMessage =
    methodMatches + typeMatches > 0
      ? `Found: ${methodMatches} methods, ${typeMatches} types`
      : 'No results found'
  const methodsRender =
    methodMatches > 0 ? (
      <>
        <Heading as="h4">{methodMatches} Methods</Heading>
        <SideNavTags specKey={specKey} tags={tags} showChildren={true} />
      </>
    ) : null

  const typesRender =
    typeMatches > 0 ? (
      <>
        <Heading as="h4">{typeMatches} Types</Heading>
        <SideNavTypes specKey={specKey} types={types} />
      </>
    ) : null
  return (
    <Box height="100vh" overflow="scroll">
      <Heading as="h5">{resultMessage}</Heading>
      {methodsRender}
      {typesRender}
    </Box>
  )
}
