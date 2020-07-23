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

import React, { FC } from 'react'
import { Chart } from 'react-google-charts'
import { Heading } from '@looker/components'
import { IResourceLoadTimes } from './perfUtils'

interface PerfChartProps {
  /** Performance Resource timing data */
  loadTimes: IResourceLoadTimes
}

// https://react-google-charts.com/timeline-chart#putting-bars-on-one-row
const chartItem = (list: any[], desc: string, start: number, end: number) => {
  if (start > 0) list.push([desc, desc, start, end])
  return list
}

const chartData = (times: IResourceLoadTimes) => {
  const item = times.entry as PerformanceResourceTiming
  const result = [
    [
      { type: 'string', id: 'Metric' },
      { type: 'string', role: 'tooltip' },
      { type: 'date', id: 'Start' },
      { type: 'date', id: 'End' },
    ],
  ]
  chartItem(result, 'redirect', item.redirectStart, item.redirectEnd)
  chartItem(
    result,
    'domainLookup',
    item.domainLookupStart,
    item.domainLookupEnd
  )
  chartItem(result, 'connect', item.connectStart, item.connectEnd)
  chartItem(
    result,
    'secureConnection',
    item.secureConnectionStart,
    item.connectEnd
  )
  chartItem(result, 'responseTime', item.responseStart, item.responseEnd)
  chartItem(result, 'fetchUntilResponseEnd', item.fetchStart, item.responseEnd)
  chartItem(
    result,
    'requestUntilResponseEnd',
    item.requestStart,
    item.responseEnd
  )
  chartItem(result, 'startUntilResponseEnd', item.startTime, item.responseEnd)
  return result
}

export const PerfChart: FC<PerfChartProps> = ({ loadTimes }) => {
  const data = chartData(loadTimes)
  return (
    <>
      <Heading as="h4">{loadTimes.name}</Heading>
      <Chart
        width={'100%'}
        height={'350px'}
        options={{
          showRowNumber: true,
          timeline: {
            showRowLabel: false,
            groupByRowLabel: true,
          },
          avoidOverlappingGridLines: false,
        }}
        chartType="Timeline"
        loader={<div>Loading Chart</div>}
        data={data}
      />
    </>
  )
}
