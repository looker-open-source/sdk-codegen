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
import { Button } from '@looker/components'

import { allProjectsRequest } from '../../data/projects/actions'
import { getProjectsState } from '../../data/projects/selectors'
import { isLoadingState } from '../../data/common/selectors'
import { Loading, ProjectList } from '../../components'
import { Routes } from '../../routes/AppRouter'

interface ProjectSceneProps {}

export const ProjectsScene: FC<ProjectSceneProps> = () => {
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(allProjectsRequest())
  }, [dispatch])
  const projects = useSelector(getProjectsState)
  const isLoading = useSelector(isLoadingState)
  const history = useHistory()

  const handleClick = () => {
    history.push(Routes.CREATE_PROJECT)
  }

  return (
    <>
      <Loading loading={isLoading} message={'Fetching projects...'} />
      {!isLoading && projects && (
        <>
          <ProjectList projects={projects} />
          <Button iconBefore="CircleAdd" onClick={handleClick}>
            Add Project
          </Button>
        </>
      )}
    </>
  )
}
