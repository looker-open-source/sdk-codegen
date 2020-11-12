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
  DataTableItem,
  DataTableCell,
  DataTableAction,
  Pagination,
  DataTable,
} from '@looker/components'
import { useSelector } from 'react-redux'
import { getExtensionSDK } from '@looker/extension-sdk'
import { IHackerProps, sheetCell } from '../../../models'
import { getHackersHeadings } from '../../../data/hack_session/selectors'
import { PAGE_SIZE } from '../../../constants'

interface HackerListProps {
  hackers: IHackerProps[]
  pageNum: number
  updatePageNum: (pageNum: number) => void
}

export const HackerList: FC<HackerListProps> = ({
  hackers,
  pageNum,
  updatePageNum,
}) => {
  const columns = useSelector(getHackersHeadings)

  const hackHacker = (hacker: IHackerProps) => {
    getExtensionSDK().openBrowserWindow(`/admin/users/${hacker.id}/edit`)
  }

  const takeAction = (
    idx: number,
    columnName: string,
    hacker: IHackerProps
  ) => {
    const key = `${idx}.${columnName}`
    return (
      <DataTableCell key={key}>{sheetCell(hacker[columnName])}</DataTableCell>
    )
  }

  const totalPages = Math.ceil(hackers.length / PAGE_SIZE)
  const startIdx = (pageNum - 1) * PAGE_SIZE
  const rows = hackers
    .slice(startIdx, startIdx + PAGE_SIZE)
    .map((hacker, idx) => (
      <DataTableItem
        key={idx}
        id={idx.toString()}
        actions={
          <DataTableAction
            key={`${idx.toString() + '.click'}`}
            onClick={hackHacker.bind(null, hacker)}
            icon="Edit"
          >
            Manage {hacker.name}
          </DataTableAction>
        }
      >
        {columns.map((column) => takeAction(idx, column.id, hacker))}
      </DataTableItem>
    ))

  return (
    <>
      <DataTable columns={columns}>{rows}</DataTable>
      <Pagination
        current={pageNum}
        pages={totalPages}
        onChange={updatePageNum}
      />
    </>
  )
}
