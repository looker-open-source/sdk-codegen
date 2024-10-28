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
import type { SheetValues } from '@looker/wholly-sheet';
import type { DataTableColumn, DataTableColumns } from '@looker/components';
import { Icon, Span } from '@looker/components';
import { Done } from '@styled-icons/material/Done';
import React from 'react';

/**
 * Convert a word possibly like snake_case to Snake Case
 * @param value to convert
 */
export const asTitle = (value: string) => {
  if (!value) return '';
  value = value.replace('$', '');
  value = value.replace(/(([-_ ]+)[a-z])|([-_ ]+)/gi, $1 => {
    return $1.toLocaleUpperCase().replace(/([-_ ]+)/gi, ' ');
  });

  return value[0].toLocaleUpperCase() + value.substr(1);
};

export const sheetHeaderColumn = (
  key: string,
  value: any
  // colCount: number,
  // boolCount: number
): DataTableColumn => {
  if (!key) throw new Error('Each header column needs a key');
  let colType = typeof value;
  // const all = 100 + 100 * (boolCount / colCount / 2)
  // const width = colType === 'boolean' ? 50 / colCount : all / colCount
  // const size = colType === 'boolean' ? 'small' : 'auto'
  if (['string', 'boolean'].includes(colType)) colType = 'string';
  else if (['bigint'].includes(colType)) colType = 'number';
  else colType = 'string';
  return {
    canSort: true,
    id: key,
    title: asTitle(key),
    type: colType,
    size: 'auto',
  };
};

/**
 * Create the ActionListColumns for this sheet
 * @param header names of column headers
 * @param row data template to use for column typing
 */
export const sheetHeader = (header: string[], row: any) => {
  const result: SheetValues = [];
  // const colCount = header.length
  // const boolCount = header.filter((h) => typeof row[h] === 'boolean').length
  header.forEach(key => {
    result.push(sheetHeaderColumn(key, row[key])); // , colCount, boolCount))
  });
  return result as DataTableColumns;
};

/**
 * Create a react element representing the data of this cell
 * @param value to convert to displayable actionitem
 */
export const sheetCell = (value: any) => {
  if (typeof value === 'undefined') return <Span></Span>;

  if (typeof value === 'boolean') {
    return value ? <Icon size="small" icon={<Done />} /> : <Span></Span>;
  }

  if (value instanceof Set) {
    const values: string[] = [];
    // Value iteration is a bit clumsy. Probably could create a helper method
    for (const v of value.values()) {
      values.push(v.toString());
    }
    return <Span>{values.join(', ')}</Span>;
  }
  if (value instanceof Date) {
    return <Span>{value.toDateString()}</Span>;
  }
  return <Span>{value.toString()}</Span>;
};
