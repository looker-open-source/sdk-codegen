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
  ActionList,
  ActionListItem,
  ActionListItemAction,
  ActionListItemColumn,
} from '@looker/components'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import {
  Project,
  Projects,
  sheetCell,
  sheetHeader,
} from '../../models'
import { getHackerState } from '../../data/hack_session/selectors'
import { deleteProjectRequest } from '../../data/projects/actions'

interface ProjectListProps {
  projects: Projects
}

export const ProjectList: FC<ProjectListProps> = ({ projects }) => {
  const template = projects.rows.length > 0 ? projects.rows[0] : new Project()
  // Select only the displayable columns
  const header = projects.displayHeader
  const columns = sheetHeader(header, template)
  const hacker = useSelector(getHackerState)
  const dispatch = useDispatch()
  const handleDelete = (project: Project) => {
    dispatch(deleteProjectRequest(projects, project))
  }
  const history = useHistory()
  const handleEdit = (projectId: string) => {
    history.push(`/projects/${projectId}/edit`)
  }

  const actions = (project: Project) => {
    const canModify = project.canUpdate(hacker) || project.canDelete(hacker)

    if (!canModify) return undefined

    return (
      <>
        {project.canUpdate(hacker) && (
          <ActionListItemAction
            onClick={handleEdit.bind(null, project._id)}
            icon="Edit"
            itemRole="link"
          >
            Edit
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
  const rows = projects.rows.map((project, idx) => (
    <ActionListItem key={idx} id={idx.toString()} actions={actions(project as Project)}>
      {header.map((columnName, _) => (
        <ActionListItemColumn key={`${idx}.${columnName}`}>
          {sheetCell(project[columnName])}
        </ActionListItemColumn>
      ))}
    </ActionListItem>
  ))

  return <ActionList columns={columns}>{rows}</ActionList>
}
