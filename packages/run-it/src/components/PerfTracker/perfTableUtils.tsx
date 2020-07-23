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
import {
  ActionListColumns,
  ActionListItem,
  ActionListItemColumn,
  Heading,
  Tooltip,
} from '@looker/components'
import { LoadTimes, perfRound } from './perfUtils'

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
  {
    canSort: true,
    id: 'duration',
    title: 'Duration',
    type: 'number',
    widthPercent: 10,
  },
]

interface MetricProps {
  value: number
  description: string
}

const Metric: FC<MetricProps> = ({ value, description }) => (
  <Tooltip placement="right" textAlign="left" content={<>{description}</>}>
    <span>{value}</span>
  </Tooltip>
)

const metric = (value: number, description: string) => (
  <>
    <Metric value={value} description={`${description} (${value} ms)`} />
  </>
)
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
          <Tooltip content={item.name} placement="right" textAlign="left">
            <Heading as="h5" mb="0" pt="0" truncate>
              {item.name}
            </Heading>
          </Tooltip>
        </ActionListItemColumn>
        <ActionListItemColumn>
          {metric(
            item.domainLookup,
            'Immediately before the browser starts the domain name lookup until it ends'
          )}
        </ActionListItemColumn>
        <ActionListItemColumn>
          {metric(
            item.connect,
            'Immediately before the browser starts to establish the connection to the server to retrieve the resource until the connection is established.'
          )}
        </ActionListItemColumn>
        <ActionListItemColumn>
          {metric(
            item.secureConnection,
            'Immediately before the browser starts the handshake process to secure the current connection until the connection ends. 0 if not a secure connection.'
          )}
        </ActionListItemColumn>
        <ActionListItemColumn>
          {metric(
            item.responseTime,
            'Immediately after the browser receives the first byte of the response from the server until the response ends.'
          )}
        </ActionListItemColumn>
        <ActionListItemColumn>
          {metric(
            item.fetchUntilResponseEnd,
            'Immediately before the browser starts to fetch the resource until the response ends'
          )}
        </ActionListItemColumn>
        <ActionListItemColumn>
          {metric(
            item.requestUntilResponseEnd,
            'Immediately after the browser receives the first byte of the response from the server until the response ends'
          )}
        </ActionListItemColumn>
        <ActionListItemColumn>
          {metric(
            item.startUntilResponseEnd,
            'Immediately before the browser starts requesting the resource from the server'
          )}
        </ActionListItemColumn>
        <ActionListItemColumn>
          {metric(
            perfRound(item.duration),
            'Total time of the request and response'
          )}
        </ActionListItemColumn>
      </ActionListItem>
    )
  })
