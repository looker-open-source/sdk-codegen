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
import { IMethod, ISearchResult, TagList } from '@looker/sdk-codegen'
import React, { FC } from 'react'
import { ComboboxList } from '@looker/components'

import { TypeResults } from './TypeResults'
import { MethodResults } from './MethodResults'
import { ListItem } from '@looker/components'

const allMethods = (tags: TagList): Array<IMethod> => {
  const result: Array<IMethod> = []
  Object.values(tags).forEach((methods) => {
    Object.values(methods).forEach((method) => {
      result.push(method)
    })
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
  const methods = allMethods(tags)
  const methodMatches = Object.entries(methods).length > 0
  const typeMatches = Object.entries(types).length > 0

  return (
    <ComboboxList closeOnSelect={true}>
      {!methodMatches && !typeMatches && <ListItem>No matches found.</ListItem>}
      {methodMatches && <MethodResults specKey={specKey} tags={tags} />}
      {typeMatches && <TypeResults specKey={specKey} types={types} />}
    </ComboboxList>
  )
}
