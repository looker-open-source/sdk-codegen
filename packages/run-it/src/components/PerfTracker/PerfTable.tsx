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
import React, { useEffect, useState } from 'react';
import { DataTable, doDataTableSort } from '@looker/components';

import type { LoadTimes } from './perfUtils';
import { createTableRows, perfTableColumns } from './perfTableUtils';

interface PerfTableProps {
  /** An array of performance load times */
  data: LoadTimes[];
  /** A row select action handler */
  onSelect: (item: LoadTimes) => void;
  /** Show all columns, or just "important" ones */
  showAllColumns?: boolean;
}

/**
 * Creates a sortable table from an array of performance load times. Each row corresponds to a resource and clicking it
 * generates its performance chart.
 */
export const PerfTable: FC<PerfTableProps> = ({
  data,
  onSelect,
  showAllColumns = false,
}) => {
  const [columns, setColumns] = useState(perfTableColumns(showAllColumns));
  const [rows, setRows] = useState(
    createTableRows(data, onSelect, showAllColumns)
  );
  const handleSort = (id: string, sortDirection: 'asc' | 'desc') => {
    const { columns: sortedColumns, data: sortedData } = doDataTableSort(
      data,
      columns,
      id,
      sortDirection
    );
    setRows(
      createTableRows(sortedData as LoadTimes[], onSelect, showAllColumns)
    );
    setColumns(sortedColumns);
  };

  useEffect(() => {
    setColumns(perfTableColumns(showAllColumns));
  }, [showAllColumns]);
  useEffect(() => {
    setRows(createTableRows(data, onSelect, showAllColumns));
  }, [data, onSelect, showAllColumns]);
  return (
    <DataTable
      onSort={handleSort}
      columns={columns}
      caption="Performance load times"
    >
      {rows}
    </DataTable>
  );
};
