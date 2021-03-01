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

import React from 'react'
import {
  DataTableCell,
  DataTableColumns,
  DataTableItem,
} from '@looker/components'
import { DiffRow } from '@looker/sdk-codegen'

export const docDiffHeaders = () => {
  const result = [
    {
      canSort: true,
      id: 'name',
      primaryKey: true,
      title: 'Method',
      type: 'string',
      widthPercent: 8,
    },
    {
      canSort: true,
      id: 'id',
      primaryKey: true,
      title: 'Op + URI',
      type: 'string',
      widthPercent: 10,
    },
    {
      canSort: true,
      id: 'lStatus',
      primaryKey: false,
      title: 'Left Status',
      type: 'string',
      widthPercent: 5,
    },
    {
      canSort: true,
      id: 'rStatus',
      primaryKey: false,
      title: 'Right Status',
      type: 'string',
      widthPercent: 5,
    },
    {
      canSort: false,
      id: 'typeDiff',
      primaryKey: false,
      title: 'Type diff',
      type: 'string',
      widthPercent: 20,
    },
    {
      canSort: false,
      id: 'paramsDiff',
      primaryKey: false,
      title: 'params Diff',
      type: 'string',
      widthPercent: 20,
    },
    {
      canSort: false,
      id: 'bodyDiff',
      primaryKey: false,
      title: 'body Diff',
      type: 'string',
      widthPercent: 20,
    },
    {
      canSort: false,
      id: 'responseDiff',
      primaryKey: false,
      title: 'response Diff',
      type: 'string',
      widthPercent: 20,
    },
  ]
  return result as DataTableColumns
}

export const docDiffRows = (
  data: DiffRow[],
  onSelect: (item: DiffRow) => void
) => {
  return data.map((item) => {
    const id = item.id
    return (
      <DataTableItem id={id} key={id} onClick={onSelect.bind(null, item)}>
        <DataTableCell>{item.name}</DataTableCell>
        <DataTableCell>{item.id}</DataTableCell>
        <DataTableCell>{item.lStatus}</DataTableCell>
        <DataTableCell>{item.rStatus}</DataTableCell>
        <DataTableCell>{item.typeDiff}</DataTableCell>
        <DataTableCell>{item.paramsDiff}</DataTableCell>
        <DataTableCell>{item.bodyDiff}</DataTableCell>
        <DataTableCell>{item.responseDiff}</DataTableCell>
      </DataTableItem>
    )
  })
}
