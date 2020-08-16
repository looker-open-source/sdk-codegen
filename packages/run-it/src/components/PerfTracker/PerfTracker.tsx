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

import React, { BaseSyntheticEvent, FC, useEffect, useState } from 'react'
import {
  Heading,
  FlexItem,
  IconButton,
  SpaceVertical,
  FieldToggleSwitch,
  Flex,
} from '@looker/components'

import { RunItConfigKey, RunItConfigurator } from '../ConfigForm'
import { Loading } from '../Loading'
import { PerfTimings, LoadTimes } from './perfUtils'
import { PerfChart } from './PerfChart'
import { PerfTable } from './PerfTable'

interface PerfTrackerProps {
  perf?: PerfTimings
  showAllColumns?: boolean
  configurator: RunItConfigurator
}

const perfFilter = (configurator: RunItConfigurator, all = false) => {
  if (all) return '.*'
  const storage = configurator.getStorage(RunItConfigKey)
  if (!storage.value) return '.*'
  const config = JSON.parse(storage.value)
  const url = new URL(config.base_url)
  return `${url.protocol}//${url.hostname}.*`
}

export const PerfTracker: FC<PerfTrackerProps> = ({
  perf = new PerfTimings(),
  showAllColumns = false,
  configurator,
}) => {
  // TODO UI option to filter by url pattern
  const [loading, setLoading] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [filter, setFilter] = useState(perfFilter(configurator))
  const [data, setData] = useState<LoadTimes[]>(perf.entries(filter))
  const [timings, setTimings] = useState(data.length > 0 ? data[0] : undefined)

  const handleClear = (_: BaseSyntheticEvent) => {
    setLoading(true)
    perf.clear()
    setData([])
    setTimings(undefined)
  }

  const handleFilterChange = (e: BaseSyntheticEvent) => {
    setLoading(true)
    const all = e.target.checked
    setShowAll(all)
    const pf = perfFilter(all)
    setFilter(pf)
    setData(perf.entries(pf))
  }

  useEffect(() => {
    setLoading(false)
  }, [data])

  const handleSelect = (item: LoadTimes) => setTimings(item)

  return (
    <>
      <Heading>Load Times for {filter}</Heading>
      <Flex>
        <FlexItem>
          <IconButton
            icon="Trash"
            onClick={handleClear}
            label="Clear the performance queue"
          />
        </FlexItem>
        <FlexItem>
          <FieldToggleSwitch
            name="filtering"
            label="Show All"
            onChange={handleFilterChange}
            on={showAll}
          />
        </FlexItem>
        <FlexItem>
          <Loading loading={loading} />
        </FlexItem>
      </Flex>
      <>
        {!PerfTimings.supported &&
          'Performance timing is not supported in this browser'}
        {PerfTimings.supported && !!timings && (
          <SpaceVertical gap="small">
            <PerfChart loadTimes={timings} />
            <PerfTable
              data={data}
              onSelect={handleSelect}
              showAllColumns={showAllColumns}
            />
          </SpaceVertical>
        )}
        {PerfTimings.supported &&
          data.length < 1 &&
          'No performance data is loaded'}
      </>
    </>
  )
}
