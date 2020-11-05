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
  ValidationMessages,
} from '@looker/components'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { IHackerProps, IProjectProps, IHackathonProps } from '../../../models'
import { actionMessage } from '../../../data/common/actions'
import {
  updateProject,
  createProject,
  changeMembership,
  getProjectRequest,
  updateProjectData,
} from '../../../data/projects/actions'
import {
  getCurrentHackathonState,
  getHackerState,
  getTechnologies,
} from '../../../data/hack_session/selectors'
import {
  getProjectLoadedState,
  getProjectState,
  getProjectUpdatedState,
  getProjectJudgesState,
} from '../../../data/projects/selectors'
import { allHackersRequest } from '../../../data/hackers/actions'
import { getJudgesState } from '../../../data/hackers/selectors'
import { Routes } from '../../../routes/AppRouter'
import { isLoadingState } from '../../../data/common/selectors'
import { canUpdateProject, canLockProject } from '../../../utils'

interface ProjectFormProps {}

interface ModifiedJudges {
  addedJudges: IHackerProps[]
  deletedJudges: IHackerProps[]
}

enum ChangeMemberShipType {
  leave = 'leave',
  join = 'join',
  nochange = 'nochange',
}

const validateMoreInfo = (
  more_info?: string
): ValidationMessages | undefined => {
  if (
    // Go figure with this but its happening!
    !more_info ||
    more_info === '\0' ||
    more_info.trim() === '' ||
    more_info.startsWith('http://') ||
    more_info.startsWith('https://')
  ) {
    return undefined
  } else {
    return {
      moreInfo: { type: 'error', message: 'More info must be a URL' },
    }
  }
}

const validate = ({
  more_info,
}: IProjectProps): ValidationMessages | undefined => {
  const moreInfoResult = validateMoreInfo(more_info)
  if (moreInfoResult) {
    return { ...(moreInfoResult || {}) }
  } else {
    return undefined
  }
}

const canSubmit = ({ title, description, technologies }: IProjectProps) => {
  return title.length > 0 && description.length > 0 && technologies.length > 0
}

const changeMemberShip = (
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

const getModifiedJudges = (
  availableJudges: IHackerProps[],
  oldJudgeNames: string[],
  newJudgeNames: string[]
): ModifiedJudges => {
  const deletedJudgeNames = oldJudgeNames
    .filter((oldJudgeName) => !newJudgeNames.includes(oldJudgeName))
    .filter(
      (judgeName) =>
        !!availableJudges.find(
          (availableJudge) => availableJudge.user.display_name === judgeName
        )
    )
  const addedJudgeNames = newJudgeNames
    .filter((newJudgeName) => !oldJudgeNames.includes(newJudgeName))
    .filter(
      (judgeName) =>
        !!availableJudges.find(
          (availableJudge) => availableJudge.user.display_name === judgeName
        )
    )
  return {
    addedJudges: addedJudgeNames.map(
      (judgeName) =>
        availableJudges.find(
          (availableJudge) => availableJudge.user.display_name === judgeName
        )!
    ),
    deletedJudges: deletedJudgeNames.map(
      (judgeName) =>
        availableJudges.find(
          (availableJudge) => availableJudge.user.display_name === judgeName
        )!
    ),
  }
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
  const currentJudges = useSelector(getProjectJudgesState)
  const isProjectUpdated = useSelector(getProjectUpdatedState)
  const isHackerRegistered =
    hacker && hacker.registration && hacker.registration._id

  useEffect(() => {
    if (projectIdOrNew) {
      dispatch(
        getProjectRequest(projectIdOrNew === 'new' ? undefined : projectIdOrNew)
      )
      dispatch(allHackersRequest())
    }
  }, [dispatch, projectIdOrNew])

  useEffect(() => {
    if (project) {
      if (!isHackerRegistered) {
        dispatch(actionMessage('Hacker has not been registered', 'critical'))
      }
    } else {
      if (isProjectLoaded) {
        dispatch(actionMessage('Invalid project', 'critical'))
      }
    }
  }, [project, isProjectLoaded, isHackerRegistered])

  useEffect(() => {
    if (history && project && isProjectUpdated) {
      history.push(Routes.PROJECTS)
    }
  }, [isProjectUpdated, project, history])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (validate(project!)) {
      return
    }
    if (projectIdOrNew === 'new') {
      dispatch(createProject(hacker.registration?._id, project!))
    } else {
      const { addedJudges, deletedJudges } = getModifiedJudges(
        availableJudges,
        currentJudges!,
        project!.$judges
      )
      dispatch(updateProject(project!, addedJudges, deletedJudges))
    }
  }

  const handleCancel = () => {
    history.push(Routes.PROJECTS)
  }

  const updateMembershipClick = (e: FormEvent) => {
    e.preventDefault()
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
  if (!project) return <></>

  const canUpdate = canUpdateProject(hacker, project, projectIdOrNew === 'new')
  const canLock = canLockProject(hacker)
  const validationMessages = validate(project)
  const changeMemberShipType = changeMemberShip(hacker, hackathon, project)

  return (
    <Form
      onSubmit={handleSubmit}
      width="40vw"
      mt="large"
      validationMessages={validationMessages}
    >
      <Fieldset legend="Enter your project details">
        <FieldText
          disabled={!canUpdate}
          required
          name="title"
          label="Title"
          defaultValue={project.title}
          onChange={(e: BaseSyntheticEvent) => {
            dispatch(updateProjectData({ ...project, title: e.target.value }))
          }}
        />
        <FieldTextArea
          disabled={!canUpdate}
          required
          label="Description"
          name="description"
          defaultValue={project.description}
          onChange={(e: BaseSyntheticEvent) => {
            dispatch(
              updateProjectData({ ...project, description: e.target.value })
            )
          }}
        />
        <FieldSelect
          disabled={!canUpdate}
          id="projectType"
          label="Type"
          required
          defaultValue={project.project_type}
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
        <FieldToggleSwitch
          disabled={!canLock}
          name="locked"
          label="Lock"
          onChange={(e: BaseSyntheticEvent) => {
            dispatch(
              updateProjectData({ ...project, locked: e.target.checked })
            )
          }}
          on={project.locked}
        />
        <FieldSelectMulti
          disabled={!canUpdate}
          id="technologies"
          label="Technologies"
          required
          options={availableTechnologies?.map((technology) => ({
            value: technology._id,
          }))}
          isFilterable
          placeholder="Type values or select from the list"
          defaultValues={project.technologies}
          onChange={(values: string[] = []) => {
            dispatch(updateProjectData({ ...project, technologies: values }))
          }}
        />
        <FieldText
          disabled={!canUpdate}
          name="moreInfo"
          label="More information"
          defaultValue={project.more_info}
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
            defaultValues={project.$members}
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
          defaultValues={project.$judges}
          onChange={(values: string[] = []) => {
            dispatch(updateProjectData({ ...project, $judges: values }))
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
            Return
          </ButtonOutline>
          <Button
            type="submit"
            disabled={
              !canUpdate ||
              isLoading ||
              !canSubmit(project) ||
              !!validationMessages
            }
          >
            Save
          </Button>
        </Space>
        {changeMemberShipType !== ChangeMemberShipType.nochange &&
          projectIdOrNew !== 'new' && (
            <ButtonOutline onClick={updateMembershipClick} disabled={isLoading}>
              {changeMemberShipType === ChangeMemberShipType.leave
                ? 'Leave project'
                : 'Join project'}
            </ButtonOutline>
          )}
      </Space>
    </Form>
  )
}
