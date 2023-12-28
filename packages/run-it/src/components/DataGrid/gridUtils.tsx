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

import Papa from 'papaparse';
import type { DataTableColumn, DataTableColumns } from '@looker/components';
import { DataTableCell, DataTableItem } from '@looker/components';
import React from 'react';

export const parseCsv = (content: string) => {
  return Papa.parse(content.trim());
};

export const json2Csv = (content: any) => {
  const csv = Papa.unparse(content);
  return parseCsv(csv);
};

export const gridHeaders = (data: any[]) => {
  if (!data || data.length === 0) return [];
  const headers = data[0];
  const values = data.length > 1 ? data[1] : undefined;
  const result: DataTableColumn[] = [];
  headers.forEach((h: string, index: number) => {
    let type = 'string';
    if (values && index < values.length) {
      if (typeof values[index] === 'number') {
        type = 'number';
      }
    }

    const col: DataTableColumn = {
      id: h,
      title: h,
      type: type === 'string' ? 'string' : 'number',
    };
    result.push(col);
  });
  return result as DataTableColumns;
};

export const gridRowId = (index: number) => `row.${index}`;
export const gridCellId = (rowId: string, index: number) => `${rowId}.${index}`;

/**
 * Generates ActionList rows from an array of data
 * @param data A array of data rows
 */
export const gridRows = (data: any[]) => {
  const result: JSX.Element[] = [];
  data.forEach((row, index) => {
    const id = gridRowId(index);
    const cells: any = [];
    row.forEach((item: any, index: number) => {
      const key = gridCellId(id, index);
      const cell = <DataTableCell key={key}>{item}</DataTableCell>;
      cells.push(cell);
    });
    result.push(
      <DataTableItem id={id} key={id}>
        {cells}
      </DataTableItem>
    );
  });

  return result;
};
