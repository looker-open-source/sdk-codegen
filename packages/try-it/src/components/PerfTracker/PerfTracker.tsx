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

import React, { FC, useState } from 'react'
import {
  ActionList,
  ActionListColumns,
  ActionListItem,
  ActionListItemAction,
  ActionListItemColumn,
  doDefaultActionListSort,
  Heading,
  Text,
} from '@looker/components'
import { PerfTimings } from './perfUtils'

interface PerfTrackerProps {
  perf: PerfTimings
}

const perfColumns: ActionListColumns = [
  {
    canSort: true,
    id: 'id',
    primaryKey: true,
    title: 'Name',
    type: 'string',
    sortDirection: 'asc',
    // widthPercent: 20,
  },
  {
    canSort: true,
    id: 'duration',
    title: 'Duration',
    type: 'number',
    // widthPercent: 5,
  },
  {
    canSort: true,
    id: 'redirect',
    title: 'Redirect',
    type: 'number',
    // widthPercent: 5,
  },
  {
    canSort: true,
    id: 'domainLookup',
    title: 'Domain Lookup',
    type: 'number',
    // widthPercent: 5,
  },
  {
    canSort: true,
    id: 'connect',
    title: 'Connect',
    type: 'number',
    // widthPercent: 5,
  },
  {
    canSort: true,
    id: 'secureConnection',
    title: 'Secure Connection',
    type: 'number',
    // widthPercent: 5,
  },
  {
    canSort: true,
    id: 'responseTime',
    title: 'Response Time',
    type: 'number',
    // widthPercent: 5,
  },
]

export const PerfTracker: FC<PerfTrackerProps> = ({ perf }) => {
  const [data, setData] = useState(perf.entries())

  const [columns, setColumns] = useState(perfColumns)

  const onSort = (id: any, sortDirection: 'asc' | 'desc') => {
    const {
      columns: sortedColumns,
      data: sortedData,
    } = doDefaultActionListSort(data, columns, id, sortDirection)
    setData(sortedData)
    setColumns(sortedColumns)
  }

  // const [data] = useState(perf.entries())
  // const [columns] = useState(perfColumns)

  const items = data.map((item, index) => {
    const actions = (
      <>
        <ActionListItemAction onClick={() => alert(`${item.name} selected!`)}>
          Select Cheese
        </ActionListItemAction>
      </>
    )

    const id = `${item.name}.${index}`
    return (
      <ActionListItem
        id={id}
        key={id}
        onClick={() => alert(`${id}`)}
        actions={actions}
      >
        <ActionListItemColumn>{item.name}</ActionListItemColumn>
        <ActionListItemColumn>{item.duration}</ActionListItemColumn>
        <ActionListItemColumn>{item.redirect}</ActionListItemColumn>
        <ActionListItemColumn>{item.domainLookup}</ActionListItemColumn>
        <ActionListItemColumn>{item.connect}</ActionListItemColumn>
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
      <Heading>
        <Text>Resource Load Times</Text>
      </Heading>
      <>
        {!perf.supported && 'Not supported in this browser'}
        {items.length && (
          <ActionList onSort={onSort} columns={columns}>
            {items}
          </ActionList>
        )}
      </>
    </>
  )
}
