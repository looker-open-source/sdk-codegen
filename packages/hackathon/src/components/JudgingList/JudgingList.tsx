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
  ActionListItemAction,
  ActionListItemColumn,
  Pagination,
  Dialog,
  DialogHeader,
  DialogContent,
  Paragraph,
  SpaceVertical,
  TextArea,
  Tooltip,
} from '@looker/components'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { IJudgingProps, sheetCell } from '../../models'
import {
  getHackerState,
  getJudgingsHeadings,
} from '../../data/hack_session/selectors'
import { canDoJudgingAction } from '../../utils'

interface JudgingListProps {
  judgings: IJudgingProps[]
}

export const JudgingList: FC<JudgingListProps> = ({ judgings }) => {
  const history = useHistory()
  const [currentPage, setCurrentPage] = useState(1)
  const [moreInfo, setMoreInfo] = useState<string>()
  const [title, setTitle] = useState<string>()
  const columns = useSelector(getJudgingsHeadings)
  const hacker = useSelector(getHackerState)

  const openMoreInfo = (judging: IJudgingProps) => {
    setMoreInfo(judging.$more_info)
    setTitle(judging.$title)
  }

  const closeMoreInfo = () => {
    setMoreInfo(undefined)
    setTitle(undefined)
  }

  columns[0].title = (
    <Tooltip content={'The judge assigned to this project'}>Judge</Tooltip>
  )

  const showJudging = (judgingId: string) => {
    setTimeout(() => {
      history.push(`/judging/${judgingId}`)
    })
  }

  const actions = (judging: IJudgingProps) => {
    return (
      <>
        {judging.$more_info && judging.$more_info !== '\0' && (
          <ActionListItemAction
            onClick={openMoreInfo.bind(null, judging)}
            icon="CircleInfo"
          >
            More Information
          </ActionListItemAction>
        )}
        <ActionListItemAction
          onClick={showJudging.bind(null, judging._id)}
          icon="Edit"
          itemRole="link"
        >
          {canDoJudgingAction(hacker, judging) ? 'Edit' : 'View'}
        </ActionListItemAction>
      </>
    )
  }

  const pageSize = 25
  const totalPages = Math.ceil(judgings.length / pageSize)

  const startIdx = (currentPage - 1) * pageSize
  const rows = judgings
    .slice(startIdx, startIdx + pageSize)
    .map((judging, idx) => (
      <ActionListItem key={idx} id={idx.toString()} actions={actions(judging)}>
        {columns.map((column) => (
          <ActionListItemColumn key={`${idx}.${column.id}`}>
            {sheetCell(judging[column.id])}
          </ActionListItemColumn>
        ))}
      </ActionListItem>
    ))

  return (
    <>
      <ActionList columns={columns}>{rows}</ActionList>
      <Pagination
        current={currentPage}
        pages={totalPages}
        onChange={setCurrentPage}
      />
      <Dialog isOpen={!!moreInfo} onClose={closeMoreInfo}>
        <DialogHeader>{title}</DialogHeader>
        <DialogContent>
          <SpaceVertical>
            <Paragraph>
              Copy the link below and paste into a new browser window to see
              additional information about the project
            </Paragraph>
            <TextArea readOnly={true} value={moreInfo}></TextArea>
          </SpaceVertical>
        </DialogContent>
      </Dialog>
    </>
  )
}
