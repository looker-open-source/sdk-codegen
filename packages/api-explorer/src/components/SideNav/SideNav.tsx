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
import {
  TabList,
  Tab,
  TabPanel,
  TabPanels,
  Box,
  useTabs,
} from '@looker/components'
import { useRouteMatch } from 'react-router-dom'
import { ApiModel } from '@looker/sdk-codegen'

import { SideNavSearch } from '../Search'
import { SideNavTags } from './SideNavTags'
import { SideNavTypes } from './SideNavTypes'

interface SideNavProps {
  api: ApiModel
  specKey: string
}

interface SideNavParams {
  sideNavTab: string
}

export const SideNav: FC<SideNavProps> = ({ api, specKey }) => {
  const tabNames = ['search', 'methods', 'types']
  const match = useRouteMatch<SideNavParams>(`/:specKey/:sideNavTab?`)
  let defaultIndex = tabNames.indexOf('methods')
  if (match && match.params.sideNavTab) {
    defaultIndex = tabNames.indexOf(match.params.sideNavTab)
  }
  const tabs = useTabs({ defaultIndex })
  const types = api.types || {}
  const tags = api.tags || {}

  return (
    <Box paddingTop="small">
      <TabList {...tabs}>
        <Tab>Search</Tab>
        <Tab>Methods</Tab>
        <Tab>Types</Tab>
      </TabList>
      <TabPanels {...tabs}>
        <TabPanel>
          <SideNavSearch api={api} specKey={specKey} />
        </TabPanel>
        <TabPanel>
          <SideNavTags tags={tags} specKey={specKey} />
        </TabPanel>
        <TabPanel>
          <SideNavTypes types={types} specKey={specKey} />
        </TabPanel>
      </TabPanels>
    </Box>
  )
}
