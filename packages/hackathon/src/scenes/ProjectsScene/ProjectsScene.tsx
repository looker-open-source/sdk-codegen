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

import React, { FC, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { useHistory } from 'react-router-dom'
import { Button, Space } from '@looker/components'

import {
  currentProjectsRequest,
  lockProjects,
} from '../../data/projects/actions'
import { getCurrentProjectsState } from '../../data/projects/selectors'
import { isLoadingState } from '../../data/common/selectors'
import { Loading, ProjectList } from '../../components'
import { Routes } from '../../routes/AppRouter'
import {
  getCurrentHackathonState,
  getHackerState,
} from '../../data/hack_session/selectors'

interface ProjectSceneProps {}

export const ProjectsScene: FC<ProjectSceneProps> = () => {
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(currentProjectsRequest())
  }, [dispatch])
  const hacker = useSelector(getHackerState)
  const hackathon = useSelector(getCurrentHackathonState)
  const projects = useSelector(getCurrentProjectsState)
  const isLoading = useSelector(isLoadingState)
  const history = useHistory()

  const handleAdd = () => {
    history.push(Routes.CREATE_PROJECT)
  }

  const handleLock = () => {
    if (hackathon) dispatch(lockProjects(true, hackathon._id))
  }

  const handleUnlock = () => {
    if (hackathon) dispatch(lockProjects(false, hackathon._id))
  }

  return (
    <>
      <Loading loading={isLoading} message={'Processing projects...'} />
      {projects && (
        <>
          {projects.length > 0 && <ProjectList projects={projects} />}
          <Space pt="xlarge">
            <Button
              iconBefore="CircleAdd"
              onClick={handleAdd}
              disabled={isLoading}
            >
              Add Project
            </Button>
            <>
              {hackathon && hacker && hacker.canAdmin && (
                <>
                  <Button
                    iconBefore="LockClosed"
                    onClick={handleLock}
                    disabled={isLoading}
                  >
                    Lock Projects
                  </Button>
                  <Button
                    iconBefore="Edit"
                    onClick={handleUnlock}
                    disabled={isLoading}
                  >
                    Unlock Projects
                  </Button>
                </>
              )}
            </>
          </Space>
        </>
      )}
    </>
  )
}
