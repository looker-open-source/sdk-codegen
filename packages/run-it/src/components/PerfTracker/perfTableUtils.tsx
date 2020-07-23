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
import React from 'react'
import {
  ActionListColumns,
  ActionListItem,
  ActionListItemColumn,
  Heading,
} from '@looker/components'
import { LoadTimes } from './perfUtils'

/** An array of columns defining the header of PerfTable */
export const tableColumns: ActionListColumns = [
  {
    canSort: true,
    id: 'id',
    primaryKey: true,
    title: 'URL',
    type: 'string',
    widthPercent: 18,
  },
  {
    canSort: true,
    id: 'duration',
    title: 'Duration',
    type: 'number',
    widthPercent: 10,
  },
  {
    canSort: true,
    id: 'domainLookup',
    title: 'Domain',
    type: 'number',
    widthPercent: 10,
  },
  {
    canSort: true,
    id: 'connect',
    title: 'Connect',
    type: 'number',
    widthPercent: 10,
  },
  {
    canSort: true,
    id: 'secureConnection',
    title: 'Secure',
    type: 'number',
    widthPercent: 9.5,
  },
  {
    canSort: true,
    id: 'responseTime',
    title: 'Response',
    type: 'number',
    widthPercent: 10.5,
  },
  {
    canSort: true,
    id: 'fetchUntilResponseEnd',
    title: 'Fetch',
    type: 'number',
    widthPercent: 10,
  },
  {
    canSort: true,
    id: 'requestUntilResponseEnd',
    title: 'Request',
    type: 'number',
    widthPercent: 10,
  },
  {
    canSort: true,
    id: 'startUntilResponseEnd',
    title: 'Start',
    type: 'number',
    widthPercent: 8.8,
  },
]

/**
 * Rounds a number to 3 decimal places
 */
export const round = (num: number) =>
  Math.round((num + Number.EPSILON) * 10000) / 10000

/**
 * Generates PerfTable rows from an array of resource load times
 * @param data A array of resource load times
 * @param onSelect A handler for performing an action when a row is clicked
 */
export const createTableRows = (
  data: LoadTimes[],
  onSelect: (item: LoadTimes) => void
) =>
  data.map((item, index) => {
    const id = `${item.name}.${index}`
    return (
      <ActionListItem id={id} key={id} onClick={onSelect.bind(null, item)}>
        <ActionListItemColumn>
          <Heading as="h5" mb="0" pt="0" truncate>
            {item.name}
          </Heading>
        </ActionListItemColumn>
        <ActionListItemColumn>{round(item.duration)}</ActionListItemColumn>
        <ActionListItemColumn>{round(item.domainLookup)}</ActionListItemColumn>
        <ActionListItemColumn>{round(item.connect)}</ActionListItemColumn>
        <ActionListItemColumn>
          {round(item.secureConnection)}
        </ActionListItemColumn>
        <ActionListItemColumn>{round(item.responseTime)}</ActionListItemColumn>
        <ActionListItemColumn>
          {round(item.fetchUntilResponseEnd)}
        </ActionListItemColumn>
        <ActionListItemColumn>
          {round(item.requestUntilResponseEnd)}
        </ActionListItemColumn>
        <ActionListItemColumn>
          {round(item.startUntilResponseEnd)}
        </ActionListItemColumn>
      </ActionListItem>
    )
  })
