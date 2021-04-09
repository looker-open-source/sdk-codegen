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
  Flex,
} from '@looker/components'
import { useRouteMatch } from 'react-router-dom'
import { ApiModel, CriteriaToSet, ISearchResult } from '@looker/sdk-codegen'

import { SearchContext } from '../../context'
import { setPattern } from '../../reducers'
import { useWindowSize } from '../../utils'
import { HEADER_REM } from '../Header'
import { SideNavTags } from './SideNavTags'
import { SideNavTypes } from './SideNavTypes'
import { useDebounce, countMethods, countTypes } from './searchUtils'
import { SearchMessage } from './SearchMessage'

interface SideNavProps {
  api: ApiModel
  diffApi?: ApiModel
  diffKey?: string
  specKey: string
  className?: string
}

interface SideNavParams {
  sideNavTab: string
}

export const SideNav: FC<SideNavProps> = ({ api, specKey }) => {
  const tabNames = ['methods', 'types']
  const match = useRouteMatch<SideNavParams>(`/:specKey/:sideNavTab?`)
  let defaultIndex = tabNames.indexOf('methods')
  if (match && match.params.sideNavTab) {
    defaultIndex = tabNames.indexOf(match.params.sideNavTab)
  }
  const tabs = useTabs({ defaultIndex })
  const { searchSettings, setSearchSettings } = useContext(SearchContext)
  const [pattern, setSearchPattern] = useState(searchSettings.pattern)
  const debouncedPattern = useDebounce(pattern, 250)
  const [searchResults, setSearchResults] = useState<ISearchResult>()
  const searchCriteria = CriteriaToSet(searchSettings.criteria)
  const [tags, setTags] = useState(api.tags || {})
  const [types, setTypes] = useState(api.types || {})
  const [methodCount, setMethodCount] = useState(countMethods(tags))
  const [typeCount, setTypeCount] = useState(countTypes(types))

  const handleInputChange = (value: string) => {
    setSearchPattern(value)
  }

  useEffect(() => {
    let results
    let newTags
    let newTypes
    if (debouncedPattern) {
      results = api.search(pattern, searchCriteria)
      newTags = results.tags
      newTypes = results.types
    } else {
      newTags = api.tags || {}
      newTypes = api.types || {}
    }

    setTags(newTags)
    setTypes(newTypes)
    setMethodCount(countMethods(newTags))
    setTypeCount(countTypes(newTypes))
    setSearchResults(results)
    setSearchSettings(setPattern(debouncedPattern!))
  }, [debouncedPattern, specKey])

  const size = useWindowSize()
  const menuH = size.height - 16 * HEADER_REM - 120

  return (
    <nav>
      <Flex alignItems="center" pl="large" pr="large" pb="large">
        <InputSearch
          onChange={handleInputChange}
          placeholder="Search"
          value={pattern}
          isClearable
          changeOnSelect
        />
        {/* <WordIcon onClick={handleWordToggle}>W</WordIcon> */}
      </Flex>
      <SearchMessage search={searchResults} />
      <TabList {...tabs} distribute>
        <Tab>Methods ({methodCount})</Tab>
        <Tab>Types ({typeCount})</Tab>
      </TabList>
      <TabPanels {...tabs} pt="xsmall" height={`${menuH}px`} overflow="auto">
        <TabPanel>
          <SideNavTags
            tags={tags}
            specKey={specKey}
            defaultOpen={!!searchResults}
          />
        </TabPanel>
        <TabPanel>
          <SideNavTypes types={types} specKey={specKey} />
        </TabPanel>
      </TabPanels>
    </nav>
  )
}
