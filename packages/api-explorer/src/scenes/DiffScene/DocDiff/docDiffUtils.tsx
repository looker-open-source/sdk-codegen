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
import { ApiModel, DiffRow, PseudoGen } from '@looker/sdk-codegen'

export const docDiffHeaders = () => {
  const result = [
    {
      canSort: true,
      id: 'name',
      primaryKey: true,
      title: 'Method',
      type: 'string',
      widthPercent: 20,
    },
    {
      canSort: true,
      id: 'id',
      primaryKey: true,
      title: 'Operation',
      type: 'string',
      widthPercent: 40,
    },
    {
      canSort: true,
      id: 'lStatus',
      primaryKey: false,
      title: 'Left Status',
      type: 'string',
      widthPercent: 20,
    },
    {
      canSort: true,
      id: 'rStatus',
      primaryKey: false,
      title: 'Right Status',
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
      </DataTableItem>
    )
  })
}

export const diffText = (row: DiffRow, status: string, api: ApiModel) => {
  const gen = new PseudoGen(api)
  const method = api.methods[row.name]
  if (!method) return `${row.name} is missing`
  const indent = ''
  let result = status ? `Status: ${status}\n` : ''
  result += gen.methodSignature(indent, method)
  if (row.bodyDiff) {
    const args = method.bodyParams.map((p) =>
      gen.declareParameter(indent, method, p)
    )
    result += `\nBody:\n${args.join('\n')}`
  }
  if (row.typeDiff) {
    result += `\nMethod type:\n${gen.declareType(indent, method.type)}`
  }
  if (row.responseDiff) {
    const bump = gen.bumper(indent)
    const items = method.responses.map((r) => {
      return `${bump}Code: ${r.statusCode}
${bump}MIME: ${r.mediaType}
${bump}Type:${r.type.fullName}`
    })
    result += `\nResponses:\n${items.join('\n')}`
  }
  return result
}

export const differ = (
  row: DiffRow,
  leftSpec: ApiModel,
  rightSpec: ApiModel
) => {
  const lhs = diffText(
    row,
    row.lStatus !== row.rStatus ? row.lStatus : '',
    leftSpec
  )
  const rhs = diffText(
    row,
    row.lStatus !== row.rStatus ? row.rStatus : '',
    rightSpec
  )
  return { lhs, rhs }
}
