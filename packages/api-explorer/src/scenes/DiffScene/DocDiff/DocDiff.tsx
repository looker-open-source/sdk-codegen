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
import { ApiModel, DiffRow } from '@looker/sdk-codegen'
import {
  DataTable,
  Heading,
  Pagination,
  Space,
  SpaceVertical,
  Text,
} from '@looker/components'
import React, { FC, useState } from 'react'
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer'
import { differ, docDiffHeaders, docDiffRows } from './docDiffUtils'

export interface DocDiffProps {
  /** Using delta because IntelliJ has bugs with 'diff' in a react app */
  delta: DiffRow[]
  /** Left side spec */
  leftSpec: ApiModel
  /** Right side spec */
  rightSpec: ApiModel
  /** Number of rows per page. Defaults to 15 */
  pageSize?: number
}

export const DocDiff: FC<DocDiffProps> = ({
  delta,
  leftSpec,
  rightSpec,
  pageSize = 10,
}) => {
  const [page, setPage] = useState(1)
  const [leftSide, setLeftSide] = useState<string>('')
  const [rightSide, setRightSide] = useState<string>('')

  if (delta.length === 0)
    return (
      <>
        <Text>{'No differences found'}</Text>
      </>
    )

  const handleSelect = (row: DiffRow) => {
    // TODO what should the click handler do? navigate to the method for lhs spec?
    const { lhs, rhs } = differ(row, leftSpec, rightSpec)
    setLeftSide(lhs)
    setRightSide(rhs)
  }

  const headers = docDiffHeaders()
  const pageCount = Math.round((delta.length - 1) / pageSize)
  // The +1 is to skip the header row
  const pageItemData = delta.slice(
    (page - 1) * pageSize + 1,
    page * pageSize + 1
  )
  const pageItems = docDiffRows(pageItemData, handleSelect)

  // TODO also handle sorting like PerfTable does?
  // TODO be less stupid about layout directives?

  return (
    <>
      <SpaceVertical>
        <Space>
          <Heading as="h2">{`${delta.length} differences found between ${leftSpec.version} and ${rightSpec.version}`}</Heading>
        </Space>
        <Space>
          <DataTable key="diff" columns={headers}>
            {pageItems}
          </DataTable>
        </Space>
        <Space>
          <Pagination
            current={page}
            pages={pageCount}
            onChange={(nextPage) => {
              setPage(nextPage)
            }}
          />
        </Space>
        <Space>
          <ReactDiffViewer
            oldValue={leftSide}
            newValue={rightSide}
            splitView={true}
            compareMethod={DiffMethod.LINES}
          />
        </Space>
      </SpaceVertical>
    </>
  )
}
