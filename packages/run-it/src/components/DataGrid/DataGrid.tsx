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

import React, { FC, ReactElement, useState } from 'react'
import {
  ActionList,
  Pagination,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  useTabs,
} from '@looker/components'
import { gridHeaders, gridRows } from './gridUtils'

interface DataGridProps {
  /** grid data. First row is header names. All other rows are data */
  data: any[]
  /** Component to render "raw" output */
  raw: ReactElement<any> | ReactElement[]
  /** Number of rows per page. Defaults to 15 */
  pageSize?: number
}

export const DataGrid: FC<DataGridProps> = ({ data, raw, pageSize = 15 }) => {
  const tabs = useTabs()
  const headers = gridHeaders(data)
  const [page, setPage] = useState(1)
  const pageCount = Math.round((data.length - 1) / pageSize)

  // The +1 is to skip the header row
  const pageItemData = data.slice(
    (page - 1) * pageSize + 1,
    page * pageSize + 1
  )
  const pageItems = gridRows(pageItemData)

  return (
    <>
      <TabList {...tabs}>
        <Tab key="grid">Grid</Tab>
        <Tab key="raw">Raw</Tab>
      </TabList>
      <TabPanels {...tabs} pt="0">
        <TabPanel key="grid">
          <ActionList key="datagrid" columns={headers}>
            {pageItems}
          </ActionList>
          <Pagination
            current={page}
            pages={pageCount}
            onChange={(nextPage) => {
              setPage(nextPage)
            }}
          />
        </TabPanel>
        <TabPanel key="raw">{raw}</TabPanel>
      </TabPanels>
    </>
  )
}
