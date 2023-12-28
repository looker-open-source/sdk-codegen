/*

 MIT License

 Copyright (c) 2021 Looker Data Sciences, Inc.

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
import type { FC } from 'react';
import React from 'react';
import type { DataTableColumns } from '@looker/components';
import {
  DataTableCell,
  DataTableItem,
  Text,
  Tooltip,
} from '@looker/components';
import styled from 'styled-components';
import type { LoadTimes } from './perfUtils';
import { perfRound } from './perfUtils';

/**
 * An array of columns defining the PerfTable
 * @param all true to include all columns
 */
export const perfTableColumns = (all = false) => {
  const numericColumns = all ? 9 : 6;
  const urlWidth = all ? 13 : 20;
  const numWidth = (100 - urlWidth) / numericColumns + 1;
  const result = [
    {
      canSort: true,
      id: 'id',
      primaryKey: true,
      title: 'URL',
      type: 'string',
      widthPercent: urlWidth,
    },
  ];
  if (all) {
    result.push(
      {
        canSort: true,
        id: 'domainLookup',
        primaryKey: false,
        title: 'Domain',
        type: 'number',
        widthPercent: numWidth,
      },
      {
        canSort: true,
        id: 'connect',
        primaryKey: false,
        title: 'Connect',
        type: 'number',
        widthPercent: numWidth,
      },
      {
        canSort: true,
        id: 'secureConnection',
        primaryKey: false,
        title: 'Secure',
        type: 'number',
        widthPercent: numWidth,
      }
    );
  }
  result.push(
    {
      canSort: true,
      id: 'responseTime',
      primaryKey: false,
      title: 'Response',
      type: 'number',
      widthPercent: numWidth,
    },
    {
      canSort: true,
      id: 'fetchUntilResponseEnd',
      primaryKey: false,
      title: 'Fetch',
      type: 'number',
      widthPercent: numWidth,
    },
    {
      canSort: true,
      id: 'requestUntilResponseEnd',
      primaryKey: false,
      title: 'Request',
      type: 'number',
      widthPercent: numWidth,
    },
    {
      canSort: true,
      id: 'startUntilResponseEnd',
      primaryKey: false,
      title: 'Start',
      type: 'number',
      widthPercent: numWidth,
    },
    {
      canSort: true,
      id: 'processDuration',
      primaryKey: false,
      title: 'Processing',
      type: 'number',
      widthPercent: numWidth,
    },
    {
      canSort: true,
      id: 'duration',
      primaryKey: false,
      title: 'Duration',
      type: 'number',
      widthPercent: numWidth,
    }
  );
  return result as DataTableColumns;
};

interface MetricProps {
  value: number;
  description: string;
}

/**
 * Renders a metric with its description in a tooltip
 */
const Metric: FC<MetricProps> = ({ value, description }) => (
  <Tooltip placement="right" textAlign="left" content={<>{description}</>}>
    <span>{value}</span>
  </Tooltip>
);

/**
 * Helper function to create a metric data cell
 * @param value milliseconds of performance metric
 * @param description to explain the metric, with ms value appended
 */
const metric = (value: number, description: string) => (
  <>
    <Metric value={value} description={`${description} (${value} ms)`} />
  </>
);

/**
 * Styling override to align url paths to the right and truncate to the left
 */
export const UrlText = styled(Text)`
  display: inline-block;
  direction: rtl;
  width: 78px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

/**
 * Special url value display handling
 * @param value is the url to massage
 */
const urlColumn = (value: string) => {
  const url = new URL(value);
  const path = `${url.pathname}${url.search}`;
  return (
    <>
      <Tooltip content={value}>
        <UrlText mb="0" pt="0" fontSize="xsmall">
          {path}
        </UrlText>
      </Tooltip>
    </>
  );
};

/**
 * Creates the extra performance columns if showAllColumns is true
 * @param item to put into row data
 * @param showAllColumns toggle for showing or skipping these performance columns
 */
const extraPerfColumns = (item: LoadTimes, showAllColumns = false) => {
  if (!showAllColumns) return <></>;
  return (
    <>
      <DataTableCell>
        {metric(
          item.connect,
          'Immediately before the browser starts to establish the connection to the server to retrieve the resource until the connection is established.'
        )}
      </DataTableCell>
      <DataTableCell>
        {metric(
          item.secureConnection,
          'Immediately before the browser starts the handshake process to secure the current connection until the connection ends. 0 if not a secure connection.'
        )}
      </DataTableCell>
      <DataTableCell>
        {metric(
          item.responseTime,
          'Immediately after the browser receives the first byte of the response from the server until the response ends.'
        )}
      </DataTableCell>
    </>
  );
};

/**
 * Generates PerfTable rows from an array of resource load times
 * @param data A array of resource load times
 * @param onSelect A handler for performing an action when a row is clicked
 * @param showAllColumns should be true to show all columns
 */
export const createTableRows = (
  data: LoadTimes[],
  onSelect: (item: LoadTimes) => void,
  showAllColumns = false
) =>
  data.map((item, index) => {
    const id = `${item.name}.${index}`;
    return (
      <DataTableItem id={id} key={id} onClick={onSelect.bind(null, item)}>
        <DataTableCell>{urlColumn(item.name)}</DataTableCell>
        <DataTableCell>
          {metric(
            item.domainLookup,
            'Immediately before the browser starts the domain name lookup until it ends'
          )}
        </DataTableCell>
        {extraPerfColumns(item, showAllColumns)}
        <DataTableCell>
          {metric(
            item.fetchUntilResponseEnd,
            'Immediately before the browser starts to fetch the resource until the response ends'
          )}
        </DataTableCell>
        <DataTableCell>
          {metric(
            item.requestUntilResponseEnd,
            'Immediately after the browser receives the first byte of the response from the server until the response ends'
          )}
        </DataTableCell>
        <DataTableCell>
          {metric(
            item.startUntilResponseEnd,
            'Immediately before the browser starts requesting the resource from the server'
          )}
        </DataTableCell>
        <DataTableCell>
          {metric(
            perfRound(item.processDuration),
            'Total time to process the payload'
          )}
        </DataTableCell>
        <DataTableCell>
          {metric(
            perfRound(item.duration),
            'Total time of the request and response'
          )}
        </DataTableCell>
      </DataTableItem>
    );
  });
