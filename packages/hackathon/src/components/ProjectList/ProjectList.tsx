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
  Icon,
  Span,
} from '@looker/components'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { sheetCell, IProjectProps } from '../../models'
import {
  getHackerState,
  getProjectsHeadings,
} from '../../data/hack_session/selectors'
import { deleteProject } from '../../data/projects/actions'
import { canDoProjectAction } from '../../utils'

interface ProjectListProps {
  projects: IProjectProps[]
}

export const ProjectList: FC<ProjectListProps> = ({ projects }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [moreInfoProject, setMoreInfoProject] = useState<IProjectProps>()
  // Select only the displayable columns
  const hacker = useSelector(getHackerState)
  const dispatch = useDispatch()
  const columns = useSelector(getProjectsHeadings)

  const handleDelete = (project: IProjectProps) => {
    dispatch(deleteProject(project._id))
  }

  const openMoreInfo = (project: IProjectProps) => {
    setMoreInfoProject(project)
  }

  const closeMoreInfo = () => {
    setMoreInfoProject(undefined)
  }
  columns[0].canSort = false
  columns[0].widthPercent = 3
  columns[0].title = (
    <Tooltip content={'Is this project locked?'}>
      <Icon name="LockClosed" />
    </Tooltip>
  )
  columns[1].widthPercent = 3
  columns[1].title = (
    <Tooltip content={'Eligible for prizing?'}>
      <Icon name="FactCheck" />
    </Tooltip>
  )
  columns[2].widthPercent = 25 // title
  columns[3].widthPercent = 40 // description
  columns[4].widthPercent = 5 // project type
  columns[4].title = (
    <Tooltip content="Open: anyone can join. Closed: no more members. Invite only: ask to join">
      <SpaceVertical gap="xxsmall">
        <Span>Project</Span>
        <Span>Type</Span>
      </SpaceVertical>
    </Tooltip>
  )
  columns[5].widthPercent = 15 // technologies
  columns[6].widthPercent = 5 // team count
  columns[6].title = (
    <Tooltip content="member count/maximum allowed">
      <SpaceVertical gap="xxsmall">
        <Span>Team</Span>
        <Span>Count</Span>
      </SpaceVertical>
    </Tooltip>
  )
  columns[7].widthPercent = 5 // judge count
  columns[7].title = (
    <Tooltip content="Number of judges assigned">
      <SpaceVertical gap="xxsmall">
        <Span>Judge</Span>
        <Span>Count</Span>
      </SpaceVertical>
    </Tooltip>
  )

  const history = useHistory()
  const handleEdit = (projectId: string) => {
    setTimeout(() => {
      history.push(`/projects/${projectId}`)
    })
  }

  const actions = (project: IProjectProps) => {
    const isLocked = project.locked

    return (
      <>
        {project.more_info && project.more_info !== '\0' && (
          <ActionListItemAction
            onClick={openMoreInfo.bind(null, project)}
            icon="CircleInfo"
          >
            More Information
          </ActionListItemAction>
        )}
        {canDoProjectAction(hacker, project, 'update') ? (
          <ActionListItemAction
            onClick={handleEdit.bind(null, project._id)}
            icon={isLocked ? 'LockClosed' : 'Edit'}
            itemRole="link"
          >
            Edit
          </ActionListItemAction>
        ) : (
          <ActionListItemAction
            onClick={handleEdit.bind(null, project._id)}
            icon={isLocked ? 'LockClosed' : 'ModelFile'}
            itemRole="link"
          >
            View
          </ActionListItemAction>
        )}
        {canDoProjectAction(hacker, project, 'delete') && (
          <ActionListItemAction
            onClick={handleDelete.bind(null, project)}
            icon="Trash"
          >
            Delete
          </ActionListItemAction>
        )}
      </>
    )
  }

  const pageSize = 25
  const totalPages = Math.ceil(projects.length / pageSize)

  const projectCell = (project: IProjectProps, columnName: string) => {
    if (
      columnName !== 'locked' &&
      columnName !== '$team_count' &&
      columnName !== '$judge_count'
    )
      return sheetCell(project[columnName])

    if (columnName === '$team_count') {
      return (
        <Tooltip content={project.$members.join(',')}>
          {sheetCell(project[columnName])}
        </Tooltip>
      )
    }
    if (columnName === '$judge_count') {
      if (!hacker.canAdmin && !hacker.canStaff)
        return sheetCell(project[columnName])
      return (
        <Tooltip content={project.$judges.join(',')}>
          {sheetCell(project[columnName])}
        </Tooltip>
      )
    }
    if (project.locked) {
      return (
        <Tooltip content={<>This project is locked.</>}>
          <Icon size="small" name="LockClosed" />
        </Tooltip>
      )
    }

    return ''
  }
  const startIdx = (currentPage - 1) * pageSize
  const rows = projects
    .slice(startIdx, startIdx + pageSize)
    .map((project, idx) => (
      <ActionListItem key={idx} id={idx.toString()} actions={actions(project)}>
        {columns.map((column) => (
          <ActionListItemColumn key={`${idx}.${column.id}`}>
            {projectCell(project, column.id)}
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
      <Dialog isOpen={!!moreInfoProject} onClose={closeMoreInfo}>
        <DialogHeader>{moreInfoProject?.title}</DialogHeader>
        <DialogContent>
          <SpaceVertical>
            <Paragraph>
              Copy the link below and paste into a new browser window to see
              additional information about the project
            </Paragraph>
            <TextArea
              readOnly={true}
              value={moreInfoProject?.more_info}
            ></TextArea>
          </SpaceVertical>
        </DialogContent>
      </Dialog>
    </>
  )
}
