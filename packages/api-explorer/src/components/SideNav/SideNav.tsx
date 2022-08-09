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

import type { FC } from 'react'
import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  TabList,
  Tab,
  TabPanel,
  TabPanels,
  useTabs,
  InputSearch,
  Box2,
} from '@looker/components'
import type {
  SpecItem,
  ISearchResult,
  ApiModel,
  TagList,
  TypeTagList,
} from '@looker/sdk-codegen'
import { criteriaToSet, tagTypes } from '@looker/sdk-codegen'
import { useSelector } from 'react-redux'
import { CopyLinkWrapper } from '@looker/run-it'
import { useWindowSize, useNavigation } from '../../utils'
import { HEADER_REM } from '../Header'
import { selectSearchCriteria, selectSearchPattern } from '../../state'
import { SideNavMethodTags } from './SideNavMethodTags'
import { SideNavTypeTags } from './SideNavTypeTags'
import { useDebounce, countMethods, countTypes } from './searchUtils'
import { SearchMessage } from './SearchMessage'

interface SideNavState {
  tags: TagList
  typeTags: TypeTagList
  methodCount: number
  typeCount: number
  searchResults?: ISearchResult
}

interface SideNavProps {
  headless?: boolean
  /** Current selected spec */
  spec: SpecItem
}

export const SideNav: FC<SideNavProps> = ({ headless = false, spec }) => {
  const location = useLocation()
  const navigate = useNavigation()
  const specKey = spec.key
  const tabNames = ['methods', 'types']
  const pathParts = location.pathname.split('/')
  const sideNavTab = pathParts[1] === 'diff' ? pathParts[3] : pathParts[2]
  let defaultIndex = tabNames.indexOf(sideNavTab)
  if (defaultIndex < 0) {
    defaultIndex = tabNames.indexOf('methods')
  }
  const onTabChange = (index: number) => {
    const parts = location.pathname.split('/')
    if (parts[1] === 'diff') {
      if (parts[3] !== tabNames[index]) {
        parts[3] = tabNames[index]
        navigate(parts.join('/'))
      }
    } else {
      if (parts[2] !== tabNames[index]) {
        parts[2] = tabNames[index]
        navigate(parts.join('/'))
      }
    }
  }
  const tabs = useTabs({ defaultIndex, onChange: onTabChange })
  const searchCriteria = useSelector(selectSearchCriteria)
  const searchPattern = useSelector(selectSearchPattern)
  const [pattern, setSearchPattern] = useState(searchPattern)
  const debouncedPattern = useDebounce(pattern, 250)
  const [sideNavState, setSideNavState] = useState<SideNavState>(() => ({
    tags: spec?.api?.tags || {},
    typeTags: spec?.api?.typeTags || {},
    methodCount: countMethods(spec?.api?.tags || {}),
    typeCount: countTypes(spec?.api?.types || {}),
    searchResults: undefined,
  }))
  const { tags, typeTags, methodCount, typeCount, searchResults } = sideNavState

  const handleInputChange = (value: string) => {
    setSearchPattern(value)
  }

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    if (debouncedPattern && debouncedPattern !== searchParams.get('s')) {
      searchParams.set('s', debouncedPattern)
      navigate(location.pathname, { s: searchParams.get('s') })
    } else if (!debouncedPattern && searchParams.get('s')) {
      searchParams.delete('s')
      navigate(location.pathname, { s: null })
    }
  }, [debouncedPattern])
  // Removed location.search as dep to fix bug related to
  // browser forward / backward navigation

  useEffect(() => {
    let results
    let newTags
    let newTypes
    let newTypeTags
    const api = spec.api || ({} as ApiModel)
    setSearchPattern(searchPattern)

    if (searchPattern && api.search) {
      results = api.search(searchPattern, criteriaToSet(searchCriteria))
      newTags = results.tags
      newTypes = results.types
      newTypeTags = tagTypes(api, results.types)
    } else {
      newTags = api.tags || {}
      newTypes = api.types || {}
      newTypeTags = api.typeTags || {}
    }

    setSideNavState({
      tags: newTags,
      typeTags: newTypeTags,
      typeCount: countTypes(newTypes),
      methodCount: countMethods(newTags),
      searchResults: results,
    })
  }, [searchPattern, specKey, spec, searchCriteria])

  useEffect(() => {
    const { selectedIndex, onSelectTab } = tabs
    if (defaultIndex !== selectedIndex) {
      onSelectTab(defaultIndex)
    }
  }, [defaultIndex, tabs])

  const size = useWindowSize()
  const headlessOffset = headless ? 200 : 120
  const menuH = size.height - 16 * HEADER_REM - headlessOffset

  return (
    <nav>
      <Box2
        pl="large"
        pr="large"
        pb="large"
        pt={headless ? 'u3' : 'large'}
        position={'relative'}
        width={'100%'}
      >
        <CopyLinkWrapper visible={!!pattern}>
          <InputSearch
            aria-label="Search"
            onChange={handleInputChange}
            placeholder="Search"
            value={pattern}
            isClearable
          />
        </CopyLinkWrapper>
        <SearchMessage search={searchResults} />
      </Box2>
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
