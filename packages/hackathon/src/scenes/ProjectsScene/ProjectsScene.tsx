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
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { Button, Space, Heading, Span } from '@looker/components'
import { Add } from '@styled-icons/material-outlined/Add'
import { Create } from '@styled-icons/material-outlined/Create'
import { Lock } from '@styled-icons/material-outlined/Lock'
import { lockProjects } from '../../data/projects/actions'
import { isLoadingState } from '../../data/common/selectors'
import { Loading } from '../../components'
import { Routes } from '../../routes'
import {
  getCurrentHackathonState,
  getHackerState,
} from '../../data/hack_session/selectors'
import { canLockProject } from '../../utils'
import { Era, eraColor, zonedLocaleDate } from '../HomeScene/components'
import { ProjectList } from './components'

interface ProjectSceneProps {}

export const ProjectsScene: FC<ProjectSceneProps> = () => {
  const dispatch = useDispatch()
  const hacker = useSelector(getHackerState)
  const hackathon = useSelector(getCurrentHackathonState)
  const isLoading = useSelector(isLoadingState)
  const history = useHistory()
  const [judgingStarted, setJudgingStarted] = useState<boolean>(true)
  const [judgingStarts, setJudgingStarts] = useState<string>('')

  const handleAdd = () => {
    history.push(Routes.CREATE_PROJECT)
  }

  const handleLock = () => {
    if (hackathon) dispatch(lockProjects(true, hackathon._id))
  }

  const handleUnlock = () => {
    if (hackathon) dispatch(lockProjects(false, hackathon._id))
  }

  useEffect(() => {
    if (hackathon && hacker) {
      const started = hackathon.judging_starts?.getTime() < new Date().getTime()
      setJudgingStarts(
        `Judging start${started ? 'ed' : 's'}: ${zonedLocaleDate(
          hackathon.judging_starts,
          hacker.timezone,
          hacker.locale
        )}`
      )
      setJudgingStarted(started)
    } else {
      setJudgingStarts('')
      setJudgingStarted(false)
    }
  }, [hackathon, hacker])

  return (
    <>
      <Space>
        <Heading as="h2" fontSize="xxxlarge" fontWeight="medium">
          Projects
        </Heading>
        {isLoading && <Loading message={'Processing projects...'} />}
      </Space>
      <ProjectList />
      <Space pt="xlarge">
        {!!judgingStarts && (
          <Span color={eraColor(judgingStarted ? Era.past : Era.future)}>
            {judgingStarts}
          </Span>
        )}
        <Button
          iconBefore={<Add />}
          onClick={handleAdd}
          disabled={(isLoading || judgingStarted) && !canLockProject(hacker)}
        >
          Add Project
        </Button>
        <>
          {hackathon && hacker && hacker.canAdmin && (
            <>
              <Button
                iconBefore={<Lock />}
                onClick={handleLock}
                disabled={isLoading}
              >
                Lock Projects
              </Button>
              <Button
                iconBefore={<Create />}
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
  )
}
