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
import React, { FC } from 'react'
import { ISearchResult, TagList } from '@looker/sdk-codegen'
import { ComboboxList, ListItem } from '@looker/components'

import { TypeResults } from './TypeResults'
import { MethodResults } from './MethodResults'

const countMethods = (tags: TagList) => {
  let result = 0
  Object.values(tags).forEach((methods) => {
    result += Object.entries(methods).length
  })
  return result
}

interface SearchResultsProps extends ISearchResult {
  specKey: string
}

export const SearchResults: FC<SearchResultsProps> = ({
  tags,
  types,
  specKey,
}) => {
  const methodMatches = countMethods(tags)
  const typeMatches = Object.entries(types).length

  return (
    <ComboboxList closeOnSelect={true}>
      {!methodMatches && !typeMatches && <ListItem>No matches found.</ListItem>}
      {(methodMatches || typeMatches) && (
        <ListItem>
          {methodMatches} methods and {typeMatches} types found
        </ListItem>
      )}
      {methodMatches && <MethodResults specKey={specKey} tags={tags} />}
      {typeMatches && <TypeResults specKey={specKey} types={types} />}
    </ComboboxList>
  )
}
