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
  ButtonTransparent,
  FieldRadioGroup,
} from '@looker/components'

import { getStorage, RunItConfigKey } from '../ConfigForm'
import { PerfTimings, LoadTimes } from './perfUtils'
import { PerfChart } from './PerfChart'
import { PerfTable } from './PerfTable'
import { tableColumns } from './perfTableUtils'

interface PerfTrackerProps {
  perf?: PerfTimings
}

const perfFilter = (all = false) => {
  if (all) return '.*'
  const storage = getStorage(RunItConfigKey)
  if (!storage.value) return '.*'
  const config = JSON.parse(storage.value)
  const url = new URL(config.base_url)
  return `${url.protocol}//${url.hostname}.*`
}

const filterOptions = [
  { label: 'API calls', value: 'api' },
  { label: 'All calls', value: 'all' },
]

export const PerfTracker: FC<PerfTrackerProps> = ({
  perf = new PerfTimings(),
}) => {
  // TODO UI option to filter by url pattern
  const [filterOption, setFilterOption] = useState('api')
  const [filter, setFilter] = useState(perfFilter())
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

  const handleRefresh = (_: BaseSyntheticEvent) => {
    const pf = perfFilter()
    setFilter(pf)
    setData(perf.entries(pf))
  }

  const handleFilterChange = (value: string) => {
    setFilterOption(value)
    const pf = perfFilter(value === 'all')
    setFilter(pf)
    setData(perf.entries(pf))
  }

  const handleSelect = (item: LoadTimes) => setTimings(item)

  return (
    <>
      <Space mb="large">
        <Heading>Resource Load Times for {filter}</Heading>
        <Button iconAfter="Trash" color="critical" onClick={handleClear}>
          Clear
        </Button>
        <ButtonTransparent iconAfter="Refresh" onClick={handleRefresh}>
          Refresh
        </ButtonTransparent>
        <FieldRadioGroup
          description="Performance result filtering"
          label="Show"
          name="filtering"
          options={filterOptions}
          defaultValue={filterOption}
          onChange={handleFilterChange}
          inline
        />
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
        {data.length < 1 && 'No performance data is loaded'}
      </>
    </>
  )
}
