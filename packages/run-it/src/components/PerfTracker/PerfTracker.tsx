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
  doDefaultActionListSort,
  Heading,
  Space,
  Button,
  SpaceVertical,
} from '@looker/components'

import { getStorage, RunItConfigKey } from '../ConfigForm'
import { PerfTimings, LoadTimes } from './perfUtils'
import { PerfChart } from './PerfChart'
import { PerfTable } from './PerfTable'
import { tableColumns } from './perfTableUtils'

interface PerfTrackerProps {
  perf?: PerfTimings
}

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
  const [data, setData] = useState<LoadTimes[]>(perf.entries(filter))
  const [columns, setColumns] = useState(tableColumns)
  const [timings, setTimings] = useState(data.length > 0 ? data[0] : undefined)

  const handleSort = (id: string, sortDirection: 'asc' | 'desc') => {
    const {
      columns: sortedColumns,
      data: sortedData,
    } = doDefaultActionListSort(data, columns, id, sortDirection)
    setData(sortedData as LoadTimes[])
    setColumns(sortedColumns)
  }

  const handleClear = (_: BaseSyntheticEvent) => {
    perf.clear()
    setData([])
    setTimings(undefined)
  }
  const handleSelect = (item: LoadTimes) => setTimings(item)

  return (
    <>
      <Space mb="large">
        <Heading>Resource Load Times</Heading>
        <Button iconAfter="Trash" color="critical" onClick={handleClear}>
          Clear
        </Button>
      </Space>
      <>
        {!perf.supported &&
          'Performance timing is not supported in this browser'}
        {perf.supported && timings && (
          <SpaceVertical gap="small">
            <PerfChart loadTimes={timings} />
            <PerfTable
              columns={columns}
              data={data}
              onSort={handleSort}
              onSelect={handleSelect}
            />
          </SpaceVertical>
        )}
        {!data.length && 'No performance data is loaded'}
      </>
    </>
  )
}
