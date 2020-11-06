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

import React, { BaseSyntheticEvent, FC, FormEvent, useEffect } from 'react'
import {
  Form,
  Fieldset,
  FieldText,
  FieldTextArea,
  FieldToggleSwitch,
  FieldSelect,
  FieldSelectMulti,
  Button,
  ButtonOutline,
  Space,
} from '@looker/components'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { actionMessage } from '../../../data/common/actions'
import { isLoadingState } from '../../../data/common/selectors'
import {
  updateProject,
  createProject,
  changeMembership,
  getProjectRequest,
  updateProjectData,
  lockProject,
} from '../../../data/projects/actions'
import {
  getProjectLoadedState,
  getProjectState,
  getValidationMessagesState,
} from '../../../data/projects/selectors'
import {
  getCurrentHackathonState,
  getHackerState,
  getTechnologies,
} from '../../../data/hack_session/selectors'
import { allHackersRequest } from '../../../data/hackers/actions'
import { getJudgesState } from '../../../data/hackers/selectors'
import { canUpdateProject, canLockProject } from '../../../utils'
import { Routes } from '../../../routes/AppRouter'
import { IHackerProps, IProjectProps, IHackathonProps } from '../../../models'

interface ProjectFormProps {}

enum ChangeMemberShipType {
  leave = 'leave',
  join = 'join',
  nochange = 'nochange',
}

const getChangeMemberShipType = (
  hacker: IHackerProps,
  hackathon?: IHackathonProps,
  project?: IProjectProps
): ChangeMemberShipType => {
  if (project && !project.locked && hackathon) {
    if (
      !!project.$team.find(
        (teamMember) => teamMember.user_id === String(hacker.id)
      )
    ) {
      return ChangeMemberShipType.leave
    } else if (project.$team.length < hackathon.max_team_size) {
      return ChangeMemberShipType.join
    }
  }
  return ChangeMemberShipType.nochange
}

export const ProjectForm: FC<ProjectFormProps> = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const match = useRouteMatch<{ projectIdOrNew: string }>(
    '/projects/:projectIdOrNew'
  )
  const hackathon = useSelector(getCurrentHackathonState)
  const hacker = useSelector(getHackerState)
  const isLoading = useSelector(isLoadingState)
  const availableTechnologies = useSelector(getTechnologies)
  const availableJudges = useSelector(getJudgesState)
  const projectIdOrNew = match?.params?.projectIdOrNew
  const isProjectLoaded = useSelector(getProjectLoadedState)
  const project = useSelector(getProjectState)
  const validationMessages = useSelector(getValidationMessagesState)
  const isHackerRegistered =
    hacker && hacker.registration && hacker.registration._id

  useEffect(() => {
    if (projectIdOrNew && !project) {
      dispatch(
        getProjectRequest(projectIdOrNew === 'new' ? undefined : projectIdOrNew)
      )
      dispatch(allHackersRequest())
    }
  }, [dispatch, projectIdOrNew, project])

  useEffect(() => {
    if (project) {
      if (!isHackerRegistered) {
        dispatch(actionMessage('Hacker has not been registered', 'critical'))
      } else if (projectIdOrNew === 'new' && project._id) {
        history.push(`${Routes.PROJECTS}/${project._id}`)
      } else if (project.locked) {
        dispatch(actionMessage('This project is locked', 'warn'))
      }
    } else {
      if (isProjectLoaded) {
        dispatch(actionMessage('Invalid project', 'critical'))
      }
    }
  }, [project, isProjectLoaded, isHackerRegistered])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (projectIdOrNew === 'new') {
      dispatch(createProject(hacker.registration?._id, project!))
    } else {
      dispatch(updateProject(project!))
    }
  }

  const handleCancel = () => {
    history.push(Routes.PROJECTS)
  }

  const updateMembershipClick = () => {
    if (project) {
      dispatch(
        changeMembership(
          project._id,
          String(hacker.id),
          changeMemberShipType === ChangeMemberShipType.leave
        )
      )
    }
  }

  const lockProjectClick = () => {
    dispatch(lockProject(!project!.locked, project!._id))
  }

  if (!project) return <></>

  const canUpdate = canUpdateProject(hacker, project, projectIdOrNew === 'new')
  const canLock = canLockProject(hacker) && projectIdOrNew !== 'new'
  const changeMemberShipType = getChangeMemberShipType(
    hacker,
    hackathon,
    project
  )

  return (
    <Form
      onSubmit={handleSubmit}
      width="50vw"
      mt="large"
      validationMessages={validationMessages}
    >
      <Fieldset legend="Enter your project details">
        <FieldText
          disabled={!canUpdate}
          required
          name="title"
          label="Title"
          value={project.title}
          onChange={(e: BaseSyntheticEvent) => {
            dispatch(updateProjectData({ ...project, title: e.target.value }))
          }}
        />
        <FieldTextArea
          disabled={!canUpdate}
          required
          label="Description"
          name="description"
          value={project.description}
          onChange={(e: BaseSyntheticEvent) => {
            dispatch(
              updateProjectData({ ...project, description: e.target.value })
            )
          }}
        />
        <FieldSelect
          disabled={!canUpdate}
          id="project_type"
          label="Type"
          required
          value={project.project_type}
          options={[
            { value: 'Open' },
            { value: 'Closed' },
            { value: 'Invite Only' },
          ]}
          onChange={(value: string) => {
            dispatch(updateProjectData({ ...project, project_type: value }))
          }}
        />
        <FieldToggleSwitch
          disabled={!canUpdate}
          name="contestant"
          label="Contestant"
          onChange={(e: BaseSyntheticEvent) => {
            dispatch(
              updateProjectData({ ...project, contestant: e.target.checked })
            )
          }}
          on={project.contestant}
        />
        <FieldSelectMulti
          disabled={!canUpdate}
          name="technologies"
          label="Technologies"
          required
          options={availableTechnologies?.map((technology) => ({
            value: technology._id,
          }))}
          isFilterable
          placeholder="Type values or select from the list"
          values={project.technologies}
          onChange={(values: string[] = []) => {
            dispatch(updateProjectData({ ...project, technologies: values }))
          }}
        />
        <FieldText
          disabled={!canUpdate}
          name="more_info"
          label="More information"
          value={project.more_info}
          onChange={(e: BaseSyntheticEvent) => {
            dispatch(
              updateProjectData({ ...project, more_info: e.target.value })
            )
          }}
        />
        {projectIdOrNew !== 'new' && (
          <FieldSelectMulti
            disabled={true}
            id="members"
            label="Members"
            values={[...project.$members]}
          />
        )}
      </Fieldset>
      {projectIdOrNew !== 'new' && (
        <FieldSelectMulti
          disabled={!hacker.canAdmin}
          id="judges"
          label="Judges"
          options={availableJudges.map((judge) => ({
            value: judge.name,
          }))}
          isFilterable
          placeholder="Type values or select from the list"
          values={[...project.$judges]}
          onChange={(values: string[] = []) => {
            dispatch(
              updateProjectData({
                ...project,
                $judges: values,
              })
            )
          }}
        />
      )}
      <Space between width="100%">
        <Space>
          <ButtonOutline
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Return to projects
          </ButtonOutline>
          <Button type="submit" disabled={!canUpdate || isLoading}>
            Save project
          </Button>
        </Space>
        {changeMemberShipType !== ChangeMemberShipType.nochange &&
          projectIdOrNew !== 'new' && (
            <ButtonOutline
              onClick={updateMembershipClick}
              disabled={isLoading || !!validationMessages}
            >
              {changeMemberShipType === ChangeMemberShipType.leave
                ? 'Leave project'
                : 'Join project'}
            </ButtonOutline>
          )}
        {canLock && (
          <ButtonOutline
            onClick={lockProjectClick}
            disabled={isLoading || !!validationMessages}
            ml="small"
          >
            {project.locked ? 'Unlock project' : 'Lock project'}
          </ButtonOutline>
        )}
      </Space>
    </Form>
  )
}
