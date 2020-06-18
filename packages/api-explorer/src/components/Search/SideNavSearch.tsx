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

import React, {
  BaseSyntheticEvent,
  FC,
  useState,
  useEffect,
  useContext,
} from 'react'
import { Box, Divider, InputSearch } from '@looker/components'
import { IApiModel, CriteriaToSet, ISearchResult } from '@looker/sdk-codegen'

import { SearchContext } from '../../context'
import { setPattern } from '../../reducers'
import useDebounce from './hooks'
import { SearchCriteriaSelector } from './SearchCriteriaSelector'
import { SearchResults } from './SearchResults'

interface SideNavSearchProps {
  api: IApiModel
  specKey: string
}

export const SideNavSearch: FC<SideNavSearchProps> = ({ api, specKey }) => {
  const { searchSettings, setSearchSettings } = useContext(SearchContext)
  const [keywords, setKeywords] = useState(searchSettings.pattern)
  const [results, setResults] = useState({} as ISearchResult)

  const onChange = (event: BaseSyntheticEvent) => {
    setKeywords(event.currentTarget.value)
  }

  const debouncedKeywords = useDebounce(keywords, 250)

  useEffect(() => {
    if (debouncedKeywords) {
      const searchCriteria = CriteriaToSet(searchSettings.criteria)
      setSearchSettings(setPattern(keywords))
      const results = api.search(keywords, searchCriteria)
      setResults(results)
    } else {
      setResults({} as ISearchResult)
    }
  }, [debouncedKeywords])

  return (
    <Box padding="small">
      <InputSearch
        hideSearchIcon
        placeholder="Type your search"
        value={keywords}
        onChange={onChange}
        width="100%"
        mb="xsmall"
      />
      <SearchCriteriaSelector />
      <Divider />
      {results.message && <SearchResults specKey={specKey} {...results} />}
    </Box>
  )
}
