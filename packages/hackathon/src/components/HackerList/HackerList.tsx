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
import React, { FC, useState } from 'react'
import {
  ActionList,
  ActionListItem,
  ActionListItemColumn,
  Pagination,
} from '@looker/components'
import { Hacker, Hackers, sheetCell, sheetHeader } from '../../models'

interface HackerListProps {
  hackers: Hackers
}

export const HackerList: FC<HackerListProps> = ({ hackers }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const template = hackers.rows.length === 0 ? new Hacker() : hackers.rows[0]
  const header = Object.keys(template)
  const columns = sheetHeader(header, template)

  const pageSize = 25
  const totalPages = Math.round(hackers.rows.length / pageSize)

  const rows = hackers.rows.map((hacker, idx) => (
    <>
      {Math.ceil((idx + 1) / pageSize) === currentPage && (
        <ActionListItem key={idx} id={idx.toString()}>
          {header.map((columnName, _) => (
            <ActionListItemColumn key={`${idx}.${columnName}`}>
              {sheetCell(hacker[columnName])}
            </ActionListItemColumn>
          ))}
        </ActionListItem>
      )}
    </>
  ))

  return (
    <>
      <ActionList columns={columns}>{rows}</ActionList>
      <Pagination
        current={currentPage}
        pages={totalPages}
        onChange={setCurrentPage}
      />
    </>
  )
}
