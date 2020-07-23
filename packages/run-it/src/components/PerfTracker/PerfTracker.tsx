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

import React, { BaseSyntheticEvent, FC, useState } from 'react'
import {
  ActionList,
  ActionListColumns,
  ActionListItem,
  ActionListItemColumn,
  doDefaultActionListSort,
  Heading,
  Space,
  Button,
} from '@looker/components'
import { getStorage, RunItConfigKey } from '../ConfigForm/configUtils'
import { PerfTimings } from './perfUtils'
import { PerfChart } from './PerfChart'

interface PerfTrackerProps {
  perf?: PerfTimings
}

const perfColumns: ActionListColumns = [
  {
    canSort: true,
    id: 'id',
    primaryKey: true,
    title: 'Url',
    type: 'string',
    sortDirection: 'asc',
    widthPercent: 18,
  },
  {
    canSort: true,
    id: 'duration',
    title: 'Duration',
    type: 'number',
    widthPercent: 8.8,
  },
  // {
  //   canSort: true,
  //   id: 'domainLookup',
  //   title: 'Domain',
  //   type: 'number',
  //   widthPercent: 8.8,
  // },
  // {
  //   canSort: true,
  //   id: 'connect',
  //   title: 'Connect',
  //   type: 'number',
  //   widthPercent: 8.8,
  // },
  {
    canSort: true,
    id: 'secureConnection',
    title: 'Secure',
    type: 'number',
    widthPercent: 8.8,
  },
  {
    canSort: true,
    id: 'responseTime',
    title: 'Response',
    type: 'number',
    widthPercent: 8.8,
  },
  {
    canSort: true,
    id: 'fetchUntilResponseEnd',
    title: 'Fetch',
    type: 'number',
    widthPercent: 8.8,
  },
  {
    canSort: true,
    id: 'requestUntilResponseEnd',
    title: 'Request',
    type: 'number',
    widthPercent: 8.8,
  },
  {
    canSort: true,
    id: 'startUntilResponseEnd',
    title: 'Start',
    type: 'number',
    widthPercent: 8.8,
  },
]

const perfFilter = () => {
  const storage = getStorage(RunItConfigKey)
  if (!storage.value) return '.*'
  const config = JSON.parse(storage.value)
  return `${config.base_url}.*`
}

export const PerfTracker: FC<PerfTrackerProps> = ({
  perf = new PerfTimings(),
}) => {
  // TODO provide option to filter only traffic to the API server
  // TODO UI option to filter by url pattern
  const [filter] = useState(perfFilter())
  const [data, setData] = useState(perf.entries(filter))

  const [columns, setColumns] = useState(perfColumns)

  const [timings, setTimings] = useState(data.length > 0 ? data[0] : undefined)

  const onSort = (id: any, sortDirection: 'asc' | 'desc') => {
    const {
      columns: sortedColumns,
      data: sortedData,
    } = doDefaultActionListSort(data, columns, id, sortDirection)
    // @ts-ignore
    setData(sortedData)
    setColumns(sortedColumns)
  }

  const handleClear = (_: BaseSyntheticEvent) => {
    perf.clear()
    setData([])
    setTimings(undefined)
  }

  const items = data.map((item, index) => {
    const id = `${item.name}.${index}`
    return (
      <ActionListItem id={id} key={id} onClick={() => setTimings(item)}>
        <ActionListItemColumn>
          <Heading as="h5" mb="0" pt="0" truncate>
            {item.name}
          </Heading>
        </ActionListItemColumn>
        <ActionListItemColumn>{item.duration}</ActionListItemColumn>
        <ActionListItemColumn>{item.redirect}</ActionListItemColumn>
        {false && (
            <ActionListItemColumn>{item.domainLookup}</ActionListItemColumn>
          ) && <ActionListItemColumn>{item.connect}</ActionListItemColumn>}
        <ActionListItemColumn>{item.secureConnection}</ActionListItemColumn>
        <ActionListItemColumn>{item.responseTime}</ActionListItemColumn>
        <ActionListItemColumn>
          {item.fetchUntilResponseEnd}
        </ActionListItemColumn>
        <ActionListItemColumn>
          {item.requestUntilResponseEnd}
        </ActionListItemColumn>
        <ActionListItemColumn>
          {item.startUntilResponseEnd}
        </ActionListItemColumn>
      </ActionListItem>
    )
  })

  return (
    <>
      <Space>
        <Heading>Resource Load Times</Heading>
        <Button iconAfter="Trash" color="critical" onClick={handleClear}>
          Clear
        </Button>
      </Space>
      <>
        {timings && <PerfChart loadTimes={timings} />}
        {!perf.supported &&
          'Performance timing is not supported in this browser'}
        {items.length > 0 && (
          <ActionList onSort={onSort} columns={columns}>
            {items}
          </ActionList>
        )}
        {items.length < 1 && 'No performance data is loaded'}
      </>
    </>
  )
}
