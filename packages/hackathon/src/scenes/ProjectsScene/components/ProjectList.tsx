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
import type { FC } from 'react'
import React, { useEffect, useState } from 'react'
import {
  DataTable,
  DataTableItem,
  DataTableAction,
  DataTableCell,
  Pagination,
  Tooltip,
  Icon,
} from '@looker/components'
import { TextSnippet } from '@styled-icons/material-outlined/TextSnippet'
import { Lock } from '@styled-icons/material-outlined/Lock'
import { Create } from '@styled-icons/material-outlined/Create'
import { Delete } from '@styled-icons/material-outlined/Delete'
import { FactCheck } from '@styled-icons/material-outlined/FactCheck'
import { Logout } from '@styled-icons/material-outlined/Logout'
import { Login } from '@styled-icons/material-outlined/Login'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import type { IHackerProps, IProjectProps } from '../../../models'
import { sheetCell } from '../../../models'
import {
  getHackerState,
  getProjectsHeadings,
} from '../../../data/hack_session/selectors'
import { canDoProjectAction, canJoinProject } from '../../../utils'
import { PAGE_SIZE } from '../../../constants'
import {
  deleteProject,
  currentProjectsRequest,
  updateProjectsPageNum,
  changeMembership,
} from '../../../data/projects/actions'
import {
  getCurrentProjectsState,
  getProjectsPageNumState,
} from '../../../data/projects/selectors'
import { ProjectViewDialog } from '../../../components/ProjectViewDialog'

interface ProjectListProps {}

export const ProjectList: FC<ProjectListProps> = () => {
  const dispatch = useDispatch()
  const currentPage = useSelector(getProjectsPageNumState)
  const hacker = useSelector(getHackerState)
  const columns = useSelector(getProjectsHeadings)
  useEffect(() => {
    dispatch(currentProjectsRequest())
  }, [dispatch])
  const projects = useSelector(getCurrentProjectsState)
  const [currentProject, setCurrentProject] = useState<
    IProjectProps | undefined
  >(undefined)

  const handleDelete = (project: IProjectProps) => {
    dispatch(deleteProject(project._id))
  }

  const isProjectMember = (hacker: IHackerProps, project: IProjectProps) => {
    return !!project.$team.find(
      (teamMember) => teamMember.user_id === String(hacker.id)
    )
  }

  const handleJoin = (project: IProjectProps, hacker: IHackerProps) => {
    const isMember = isProjectMember(hacker, project)
    dispatch(changeMembership(project!._id, hacker.id, isMember))
  }

  const lockCol = columns[0]
  lockCol.canSort = false
  lockCol.size = 'auto'
  lockCol.titleIcon = <Lock />
  columns[1].size = 'auto'
  columns[1].titleIcon = <FactCheck />
  columns[2].size = 'medium' // title
  columns[3].size = 'large' // description
  columns[4].size = 'auto' // project type
  // columns[4].title = 'Project Type'
  columns[5].size = 'medium' // technologies
  columns[6].size = 'auto' // team count
  // columns[6].title = 'Team Count'
  columns[7].size = 'auto' // judge count
  // columns[7].title = 'Judge Count'

  const history = useHistory()
  const handleEdit = (projectId: string) => {
    setTimeout(() => {
      history.push(`/projects/${projectId}`)
    })
  }

  const handleView = (project: IProjectProps) => {
    setCurrentProject(project)
  }

  const closeView = () => {
    setCurrentProject(undefined)
  }

  const actions = (project: IProjectProps) => {
    const isLocked = project.locked

    return (
      <>
        {canDoProjectAction(hacker, project, 'update') && (
          <DataTableAction
            onClick={handleEdit.bind(null, project._id)}
            icon={isLocked ? <Lock /> : <Create />}
            itemRole="link"
          >
            Update project
          </DataTableAction>
        )}

        <DataTableAction
          onClick={handleView.bind(null, project)}
          icon={<TextSnippet />}
          itemRole="link"
        >
          View project
        </DataTableAction>

        {canDoProjectAction(hacker, project, 'delete') && (
          <DataTableAction
            onClick={handleDelete.bind(null, project)}
            icon={<Delete />}
          >
            Delete project
          </DataTableAction>
        )}

        {canJoinProject(hacker, project) && (
          <DataTableAction
            onClick={handleJoin.bind(null, project, hacker)}
            icon={isProjectMember(hacker, project) ? <Logout /> : <Login />}
          >
            {isProjectMember(hacker, project)
              ? 'Leave project'
              : 'Join project'}
          </DataTableAction>
        )}
      </>
    )
  }

  const projectCell = (project: IProjectProps, columnName: string) => {
    switch (columnName) {
      case 'locked':
        return (
          project.locked && (
            <Tooltip content={<>This project is locked.</>}>
              <Icon size="small" icon={<Lock />} />
            </Tooltip>
          )
        )
      case '$team_count':
        return (
          <Tooltip content={project.$members.join(',')}>
            {sheetCell(project[columnName])}
          </Tooltip>
        )
      case '$judge_count':
        if (!hacker.canAdmin && !hacker.canStaff)
          return sheetCell(project[columnName])
        return (
          <Tooltip content={project.$judges.join(',')}>
            {sheetCell(project[columnName])}
          </Tooltip>
        )
      case '$techs':
        return sheetCell(project.$techs.join(','))
      default:
        return sheetCell(project[columnName])
    }
  }

  const totalPages = Math.ceil(projects.length / PAGE_SIZE)
  const startIdx = (currentPage - 1) * PAGE_SIZE
  const rows = projects
    .slice(startIdx, startIdx + PAGE_SIZE)
    .map((project, idx) => (
      <DataTableItem
        key={idx}
        id={idx.toString()}
        actions={actions(project)}
        onClick={handleView.bind(null, project)}
      >
        {columns.map((column) => (
          <DataTableCell key={`${idx}.${column.id}`}>
            {projectCell(project, column.id)}
          </DataTableCell>
        ))}
      </DataTableItem>
    ))

  return (
    <>
      <DataTable columns={columns} caption="List of hackathon projects">
        {rows}
      </DataTable>
      <Pagination
        current={currentPage}
        pages={totalPages}
        onChange={(pageNumber) => dispatch(updateProjectsPageNum(pageNumber))}
      />
      <ProjectViewDialog project={currentProject} onClose={closeView} />
    </>
  )
}
