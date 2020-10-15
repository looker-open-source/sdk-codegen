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
  Tooltip,
  Icon,
} from '@looker/components'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { Project, Projects, sheetCell, sheetHeader } from '../../models'
import { getHackerState } from '../../data/hack_session/selectors'
import { deleteProjectRequest } from '../../data/projects/actions'

const projectListHeaders = [
  'locked',
  'contestant',
  'title',
  'description',
  'project_type',
  'technologies',
  '$team_count',
  '$judge_count',
]

interface ProjectListProps {
  projects: Projects
}

export const ProjectList: FC<ProjectListProps> = ({ projects }) => {
  const template = projects.rows.length > 0 ? projects.rows[0] : new Project()
  const [currentPage, setCurrentPage] = useState(1)
  // Select only the displayable columns
  const header = projectListHeaders // projects.displayHeader
  const columns = sheetHeader(header, template)
  const hacker = useSelector(getHackerState)
  const dispatch = useDispatch()
  const handleDelete = (project: Project) => {
    dispatch(deleteProjectRequest(projects, project))
  }
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
  columns[5].widthPercent = 15 // technologies
  columns[6].widthPercent = 5 // team count
  columns[7].widthPercent = 5 // judge count

  const history = useHistory()
  const handleEdit = (projectId: string) => {
    setTimeout(() => {
      history.push(`/projects/${projectId}`)
    })
  }

  const actions = (project: Project) => {
    const isLocked = project.locked

    return (
      <>
        {project.canUpdate(hacker) ? (
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
        {project.canDelete(hacker) && (
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
  const totalPages = Math.ceil(projects.rows.length / pageSize)

  const projectCell = (project: Project, columnName: string) => {
    if (columnName !== 'locked') return sheetCell(project[columnName])

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
  const rows = projects.rows
    .slice(startIdx, startIdx + pageSize)
    .map((project, idx) => (
      <ActionListItem
        key={idx}
        id={idx.toString()}
        actions={actions(project as Project)}
      >
        {header.map((columnName, _) => (
          <ActionListItemColumn key={`${idx}.${columnName}`}>
            {projectCell(project, columnName)}
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
    </>
  )
}
