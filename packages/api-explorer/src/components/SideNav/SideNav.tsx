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

import type { FC, Dispatch } from 'react'
import React, { useContext, useEffect, useState } from 'react'
import {
  Heading,
  TabList,
  Tab,
  TabPanel,
  TabPanels,
  useTabs,
  InputSearch,
  SpaceVertical,
} from '@looker/components'
import type {
  SpecItem,
  SpecList,
  ISearchResult,
  ApiModel,
} from '@looker/sdk-codegen'
import { CriteriaToSet, tagTypes } from '@looker/sdk-codegen'
import { useRouteMatch } from 'react-router-dom'

import { SearchContext } from '../../context'
import type { SpecAction } from '../../reducers'
import { setPattern } from '../../reducers'
import { useWindowSize } from '../../utils'
import { HEADER_REM } from '../Header'
import { SelectorContainer } from '../SelectorContainer'
import { SideNavMethodTags } from './SideNavMethodTags'
import { SideNavTypeTags } from './SideNavTypeTags'
import { useDebounce, countMethods, countTypes } from './searchUtils'
import { SearchMessage } from './SearchMessage'

interface SideNavProps {
  headless?: boolean
  /** Specs to choose from */
  specs: SpecList
  /** Current selected spec */
  spec: SpecItem
  /** Spec state setter */
  specDispatch: Dispatch<SpecAction>
}

interface SideNavParams {
  sideNavTab: string
}

export const SideNav: FC<SideNavProps> = ({
  headless = false,
  specs,
  spec,
  specDispatch,
}) => {
  const api = spec.api || ({} as ApiModel)
  const specKey = spec.key
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
  const [typeTags, setTypeTags] = useState(api.typeTags || {})
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
    let newTypeTags
    if (debouncedPattern && api.search) {
      results = api.search(pattern, searchCriteria)
      newTags = results.tags
      newTypes = results.types
      newTypeTags = tagTypes(api, results.types)
    } else {
      newTags = api.tags || {}
      newTypes = api.types || {}
      newTypeTags = api.typeTags || {}
    }

    setTags(newTags)
    setTypes(newTypes)
    setTypeTags(newTypeTags)
    setMethodCount(countMethods(newTags))
    setTypeCount(countTypes(newTypes))
    setSearchResults(results)
    setSearchSettings(setPattern(debouncedPattern!))
  }, [debouncedPattern, specKey, spec])

  const size = useWindowSize()
  const headlessOffset = headless ? 200 : 120
  const menuH = size.height - 16 * HEADER_REM - headlessOffset

  return (
    <nav>
      <SpaceVertical alignItems="center" p="large" gap="xsmall">
        {headless && (
          <SpaceVertical>
            <Heading as="h5" color="key" fontWeight="bold">
              API Documentation
            </Heading>
            <SelectorContainer
              specs={specs}
              spec={spec}
              specDispatch={specDispatch}
            />
          </SpaceVertical>
        )}
        <InputSearch
          aria-label="Search"
          onChange={handleInputChange}
          placeholder="Search"
          value={pattern}
          isClearable
          changeOnSelect
        />
      </SpaceVertical>
      <SearchMessage search={searchResults} />
      <TabList {...tabs} distribute>
        <Tab>Methods ({methodCount})</Tab>
        <Tab>Types ({typeCount})</Tab>
      </TabList>
      <TabPanels {...tabs} pt="xsmall" height={`${menuH}px`} overflow="auto">
        <TabPanel>
          <SideNavMethodTags
            tags={tags}
            specKey={specKey}
            defaultOpen={!!searchResults}
          />
        </TabPanel>
        <TabPanel>
          <SideNavTypeTags
            tags={typeTags}
            specKey={specKey}
            defaultOpen={!!searchResults}
          />
        </TabPanel>
      </TabPanels>
    </nav>
  )
}
