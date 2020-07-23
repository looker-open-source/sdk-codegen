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
import { ActionList, ActionListColumns } from '@looker/components'

import { LoadTimes } from './perfUtils'
import { createTableRows } from './perfTableUtils'

interface PerfTableProps {
  /** An array defining the table header */
  columns: ActionListColumns
  /** An array of performance load times */
  data: LoadTimes[]
  /** A handler for sorting data by a column */
  onSort: (id: string, sortDirection: 'asc' | 'desc') => void
  /** A row select action handler */
  onSelect: (item: LoadTimes) => void
}

/**
 * Creates a sortable table from an array of performance load times. Each row corresponds to a resource and clicking it
 * generates its performance chart.
 */
export const PerfTable: FC<PerfTableProps> = ({
  columns,
  data,
  onSort,
  onSelect,
}) => (
  <ActionList onSort={onSort} columns={columns}>
    {createTableRows(data, onSelect)}
  </ActionList>
)
