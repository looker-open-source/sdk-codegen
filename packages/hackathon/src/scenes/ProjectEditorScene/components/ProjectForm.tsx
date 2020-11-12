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

/*
 * TODO - remove as much logic as possible that relies on 'new'.
 * At a minimum this means the save logic. Difference between new
 * and update should be in the saga.
 */

/*
 * TODO - remove need for hacker data - logic that needs it should be in
 * the saga.
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
  getIsProjectMemberState,
} from '../../../data/projects/selectors'
import {
  getHackerState,
  getHackerIdState,
  getHackerRegistrationIdState,
  getTechnologies,
} from '../../../data/hack_session/selectors'
import { allHackersRequest } from '../../../data/hackers/actions'
import { getJudgesState } from '../../../data/hackers/selectors'
import { canUpdateProject, canLockProject } from '../../../utils'
import { Routes } from '../../../routes/AppRouter'

interface ProjectFormProps {}

export const ProjectForm: FC<ProjectFormProps> = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const match = useRouteMatch<{ projectIdOrNew: string }>(
    '/projects/:projectIdOrNew'
  )
  const hacker = useSelector(getHackerState)
  const isLoading = useSelector(isLoadingState)
  const availableTechnologies = useSelector(getTechnologies)
  const availableJudges = useSelector(getJudgesState)
  const projectIdOrNew = match?.params?.projectIdOrNew
  const isProjectLoaded = useSelector(getProjectLoadedState)
  const project = useSelector(getProjectState)
  const isProjectMember = useSelector(getIsProjectMemberState)
  const validationMessages = useSelector(getValidationMessagesState)
  const hackerId = useSelector(getHackerIdState)
  const hackerRegistrationId = useSelector(getHackerRegistrationIdState)

  useEffect(() => {
    if (projectIdOrNew && !project) {
      dispatch(
        getProjectRequest(projectIdOrNew === 'new' ? undefined : projectIdOrNew)
      )
      dispatch(allHackersRequest())
    }
  }, [dispatch, projectIdOrNew, project])

  useEffect(() => {
    // TODO all of this logic should be in the saga!
    if (project) {
      if (!hackerRegistrationId) {
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
  }, [project, isProjectLoaded, hackerRegistrationId])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    // TODO this should be a single action - saveProject
    if (projectIdOrNew === 'new') {
      dispatch(createProject(hackerRegistrationId!, project!))
    } else {
      dispatch(updateProject(project!))
    }
  }

  const handleCancel = () => {
    history.push(Routes.PROJECTS)
  }

  const updateMembershipClick = () => {
    dispatch(changeMembership(project!._id, hackerId!, isProjectMember!))
  }

  const lockProjectClick = () => {
    dispatch(lockProject(!project!.locked, project!._id))
  }

  if (!project) return <></>

  // TODO move this to the sage and pull data out of rudux
  const canUpdate = canUpdateProject(hacker, project, projectIdOrNew === 'new')
  const canLock = canLockProject(hacker) && projectIdOrNew !== 'new'

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
        {(canLock || canUpdate) && project._id && (
          <ButtonOutline
            onClick={updateMembershipClick}
            disabled={isLoading || !!validationMessages}
          >
            {isProjectMember ? 'Leave project' : 'Join project'}
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
