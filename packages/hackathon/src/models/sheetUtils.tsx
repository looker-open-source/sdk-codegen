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
import { IRowModel, SheetValues } from '@looker/wholly-sheet'
import { ActionListColumns, Icon, Text } from '@looker/components'
import React from 'react'

/**
 * Convert a word possibly like snake_case to Snake Case
 * @param value to convert
 */
export const asTitle = (value: string) => {
  if (!value) return ''
  value = value.replace(/(([-_ ]+)[a-z])|([-_ ]+)/gi, ($1) => {
    return $1.toLocaleUpperCase().replace(/([-_ ]+)/gi, ' ')
  })

  return value[0].toLocaleUpperCase() + value.substr(1)
}

export const sheetHeaderColumn = (
  row: IRowModel,
  key: string,
  value: any,
  colCount: number
) => {
  if (!key) throw new Error('Each header column needs a key')
  let colType = typeof value
  if (['string', 'number', 'boolean'].includes(colType)) colType = 'string'
  return {
    canSort: true,
    id: key,
    primaryKey: key === row.keyColumn,
    title: asTitle(key),
    type: colType,
    widthPercent: 100 / colCount,
  }
}

/**
 * Create the ActionListColumns for this sheet
 * @param header names of column headers
 * @param row data template to use for column typing
 */
export const sheetHeader = (header: string[], row: IRowModel) => {
  const result: SheetValues = []
  const colCount = header.length
  header.forEach((key) => {
    result.push(sheetHeaderColumn(row, key, row[key], colCount))
  })
  return result as ActionListColumns
}

/**
 * Create a react element representing the data of this cell
 * @param value to convert to displayable actionitem
 */
export const sheetCell = (value: any) => {
  if (typeof value === 'undefined') return <></>

  if (typeof value === 'boolean') {
    return <Icon size="small" name={value ? 'Check' : 'Close'} />
  }

  if (value instanceof Date) {
    return <Text>{value.toDateString()}</Text>
  }
  return <Text>{value.toString()}</Text>
}
