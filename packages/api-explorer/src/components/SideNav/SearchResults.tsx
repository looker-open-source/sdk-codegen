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
import React, { FC, useEffect, useState } from 'react'
import { ISearchResult, TagList } from '@looker/sdk-codegen'
import {
  Box,
  Divider,
  Heading,
  IconNames,
  Icon,
  Flex,
} from '@looker/components'

import { SideNavTags, SideNavTypes } from '../SideNav'

const countMethods = (tags: TagList) => {
  let result = 0
  Object.values(tags).forEach((methods) => {
    result += Object.entries(methods).length
  })
  return result
}

interface SearchMessageProps {
  search: ISearchResult
}

interface SearchMessageValues {
  icon: IconNames
  color: string
  message: string
}

const calcSearchMessageValues = (
  search: ISearchResult
): SearchMessageValues => {
  const { ok, tags, types, message } = search
  const methodMatches = countMethods(tags)
  const typeMatches = Object.entries(types).length
  const result: SearchMessageValues = {
    icon: 'Functions',
    color: 'positive',
    message,
  }
  if (!ok) {
    result.icon = 'Error'
    result.color = 'critical'
  } else {
    if (methodMatches + typeMatches === 0) {
      result.icon = 'CircleQuestion'
      result.message = 'No matches found'
      result.color = 'warn'
    }
  }
  return { ...result }
}

export const SearchMessage: FC<SearchMessageProps> = ({ search }) => {
  const values = calcSearchMessageValues(search)
  return (
    <Flex alignItems="center">
      <Heading as="h4" color={values.color} truncate>
        <Icon key="resultIcon" name={values.icon} size="xxsmall" />
        {values.message}
      </Heading>
    </Flex>
  )
}

interface SearchResultsProps extends SearchMessageProps {
  specKey: string
}

export const SearchResults: FC<SearchResultsProps> = ({ search, specKey }) => {
  return (
    <>
      <Box pl="large" pr="large" pt="xxsmall">
        <SearchMessage search={search} />
        <Divider />
      </Box>
      <SideNavTags defaultOpen={true} tags={search.tags} specKey={specKey} />
      <SideNavTypes types={search.types} specKey={specKey} />
    </>
  )
}
