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

import Papa from 'papaparse'
import {
  ActionListColumn,
  ActionListColumns,
  ActionListItem,
  ActionListItemColumn,
} from '@looker/components'
import React from 'react'

export const parseCsv = (content: string) => {
  return Papa.parse(content.trim())
}

export const parseJson = (content: any) => {
  const csv = Papa.unparse(content)
  return parseCsv(csv)
}

export const gridHeaders = (data: any[]) => {
  if (!data || data.length === 0) return []
  const headers = data[0]
  const values = data.length > 1 ? data[1] : undefined
  const width = 100 / headers.length
  const result: ActionListColumn[] = []
  headers.forEach((h: string, index: number) => {
    let type = 'string'
    if (values && index < values.length) {
      if (typeof values[index] === 'number') {
        type = 'number'
      }
    }

    const col: ActionListColumn = {
      id: h,
      title: h,
      primaryKey: false,
      type: type === 'string' ? 'string' : 'number',
      widthPercent: width,
    }
    result.push(col)
  })
  return result as ActionListColumns
}

/**
 * Generates PerfTable rows from an array of resource load times
 * @param data A array of resource load times
 * @param onSelect A handler for performing an action when a row is clicked
 */
export const gridRows = (data: any[]) => {
  //, onSelect: (item: any) => void) => {
  const result: JSX.Element[] = []
  const rows = data.slice(1) // Skip the header row
  rows.map((row, index) => {
    const id = `row.${index}`
    const cells: any = []
    row.map((item: any, index: number) => {
      const key = `${id}.${index}`
      const cell = <ActionListItemColumn key={key}>{item}</ActionListItemColumn>
      cells.push(cell)
    })
    result.push(
      // <ActionListItem id={id} key={id} onClick={onSelect.bind(null, cells)}>
      <ActionListItem id={id} key={id}>
        {cells}
      </ActionListItem>
    )
  })

  return result
}
