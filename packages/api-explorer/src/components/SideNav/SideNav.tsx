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

import React, { FC, useContext, useEffect, useState } from 'react'
import {
  TabList,
  Tab,
  TabPanel,
  TabPanels,
  useTabs,
  InputSearch,
} from '@looker/components'
import styled from 'styled-components'
import { useRouteMatch } from 'react-router-dom'
import { ApiModel, CriteriaToSet, ISearchResult } from '@looker/sdk-codegen'

import { SearchContext } from '../../context'
import { setPattern } from '../../reducers'
import { SideNavTags } from './SideNavTags'
import { SideNavTypes } from './SideNavTypes'
import { SearchResults } from './SearchResults'
import { useDebounce } from './searchUtils'

interface SideNavProps {
  api: ApiModel
  diffApi?: ApiModel
  diffKey?: string
  specKey: string
  className?: string
}

type SearchResult = ISearchResult

interface SideNavParams {
  sideNavTab: string
}

const SideNavLayout: FC<SideNavProps> = ({ api, specKey, className }) => {
  const tabNames = ['methods', 'types']
  const match = useRouteMatch<SideNavParams>(`/:specKey/:sideNavTab?`)
  let defaultIndex = tabNames.indexOf('methods')
  if (match && match.params.sideNavTab) {
    defaultIndex = tabNames.indexOf(match.params.sideNavTab)
  }
  const tabs = useTabs({ defaultIndex })
  const types = api.types || {}
  const tags = api.tags || {}

  const { searchSettings, setSearchSettings } = useContext(SearchContext)
  const [pattern, setSearchPattern] = useState(searchSettings.pattern)
  const debouncedPattern = useDebounce(pattern, 250)
  const [searchResults, setSearchResults] = useState<SearchResult>()
  const searchCriteria = CriteriaToSet(searchSettings.criteria)

  const handleInputChange = (value: string) => {
    setSearchPattern(value)
  }

  useEffect(() => {
    let results
    if (debouncedPattern) {
      results = api.search(pattern, searchCriteria)
    }
    setSearchResults(results)
    setSearchSettings(setPattern(debouncedPattern!))
  }, [debouncedPattern])

  return (
    <nav className={className}>
      <InputSearch
        onChange={handleInputChange}
        placeholder="Search"
        value={pattern}
        isClearable
        changeOnSelect
        pl="large"
        pr="large"
        pb="large"
      />
      {searchResults ? (
        <SearchResults {...searchResults} specKey={specKey} />
      ) : (
        <>
          <TabList {...tabs} distribute>
            <Tab>Methods</Tab>
            <Tab>Types</Tab>
          </TabList>
          <TabPanels {...tabs} pt="xsmall">
            <TabPanel>
              <SideNavTags tags={tags} specKey={specKey} />
            </TabPanel>
            <TabPanel>
              <SideNavTypes types={types} specKey={specKey} />
            </TabPanel>
          </TabPanels>
        </>
      )}
    </nav>
  )
}

export const SideNav = styled(SideNavLayout)`
  padding: ${({ theme }) => theme.space.large} 0;
  border-right: 1px solid ${({ theme }) => theme.colors.ui2};
  height: 100%;
`
