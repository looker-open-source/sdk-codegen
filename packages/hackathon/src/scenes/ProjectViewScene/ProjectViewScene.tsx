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
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useRouteMatch } from 'react-router-dom'
import React, { useEffect } from 'react'
import { SpaceVertical, Space, Button } from '@looker/components'
import { isLoadingState } from '../../data/common/selectors'
import {
  getProjectLoadedState,
  getProjectState,
} from '../../data/projects/selectors'
import { getProjectRequest } from '../../data/projects/actions'
import { allHackersRequest } from '../../data/hackers/actions'
import { Routes } from '../../routes/AppRouter'
import { Loading } from '../../components'
import { actionMessage } from '../../data/common/actions'
import { ProjectView } from './components'

export const ProjectViewScene: FC = () => {
  // TODO: add a not found error in case project is not found
  const dispatch = useDispatch()
  const history = useHistory()
  const match = useRouteMatch<{ projectId: string }>('/projectview/:projectId')
  const isLoading = useSelector(isLoadingState)
  const projectId = match?.params?.projectId
  const isProjectLoaded = useSelector(getProjectLoadedState)
  const project = useSelector(getProjectState)

  useEffect(() => {
    if (project) {
      // TODO Not sure this is needed here
      if (projectId === 'new' && project._id) {
        history.push(`${Routes.PROJECTS}/${project._id}`)
      }
    } else {
      if (!isProjectLoaded) {
        dispatch(actionMessage('Invalid project', 'critical'))
      }
    }
  }, [dispatch, history, projectId, project, isProjectLoaded])

  const handleCancel = () => {
    history.push(Routes.PROJECTS)
  }

  useEffect(() => {
    if (projectId && !project) {
      dispatch(getProjectRequest(projectId === 'new' ? undefined : projectId))
      dispatch(allHackersRequest())
    }
  }, [dispatch, projectId, project])

  return (
    <SpaceVertical gap="u1">
      <Space>
        {project ? (
          <ProjectView project={project} />
        ) : (
          <Loading loading={!project} message="Loading project ..." />
        )}
      </Space>
      <Space between>
        <Button type="button" onClick={handleCancel} disabled={isLoading}>
          Return to projects
        </Button>
      </Space>
    </SpaceVertical>
  )
}
