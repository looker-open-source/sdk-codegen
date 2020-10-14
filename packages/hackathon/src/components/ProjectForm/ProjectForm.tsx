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
import React, {
  BaseSyntheticEvent,
  FC,
  FormEvent,
  useEffect,
  useState,
} from 'react'
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
import { Project } from '../../models'
import { actionMessage } from '../../data/common/actions'
import {
  allProjectsRequest,
  beginEditProjectRequest,
  saveProjectRequest,
} from '../../data/projects/actions'
import {
  getHackerState,
  getTechnologies,
} from '../../data/hack_session/selectors'
import {
  getProjectsState,
  getProjectsLoadedState,
} from '../../data/projects/selectors'
import { Routes } from '../../routes/AppRouter'
import { isLoadingState, getMessageState } from '../../data/common/selectors'

interface ProjectDialogProps {}

export const ProjectForm: FC<ProjectDialogProps> = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const match = useRouteMatch<{ func: string }>('/projects/:func')
  const hacker = useSelector(getHackerState)
  const projects = useSelector(getProjectsState)
  const projectsLoaded = useSelector(getProjectsLoadedState)
  const isLoading = useSelector(isLoadingState)
  const messageDetail = useSelector(getMessageState)
  const availableTechnologies = useSelector(getTechnologies)

  const [project, setProject] = useState<Project>()
  const [title, setTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [projectType, setProjectType] = useState<string>('Open')
  const [contestant, setContestant] = useState<boolean>(false)
  const [locked, setLocked] = useState<boolean>(false)
  const [technologies, setTechnologies] = useState<string[]>([])
  const [isUpdating, setIsUpdating] = useState(false)

  const func = match?.params?.func

  useEffect(() => {
    dispatch(allProjectsRequest())
  }, [dispatch])

  useEffect(() => {
    if (func) {
      let project
      if (hacker && hacker.registration && hacker.registration._id) {
        if (func === 'new') {
          project = new Project()
          project._registration_id = hacker.registration?._id
        } else if (projects.rows) {
          project = projects.rows.find((project) => project._id === func)
        }
        if (project) {
          if (!project._registration_id) {
            // Self correct missing registration for now
            project._registration_id = hacker.registration?._id
          }
          setTitle(project.title)
          setDescription(project.description)
          setProjectType(project.project_type)
          setContestant(project.contestant)
          setLocked(project.locked)
          setTechnologies(project.technologies)
          setProject(project)
        } else {
          if (projectsLoaded) {
            dispatch(actionMessage('Invalid project', 'critical'))
          }
        }
      } else {
        dispatch(actionMessage('Hacker has not been registered', 'critical'))
      }
    }
  }, [func, hacker, dispatch, projects, projectsLoaded])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (project) {
      project.title = title
      project.description = description
      project.project_type = projectType
      project.contestant = contestant
      project.locked = locked
      project.technologies = technologies
      if (func === 'new') {
        dispatch(saveProjectRequest(hacker.id, projects, project))
      } else {
        dispatch(beginEditProjectRequest(projects, project))
      }
      setIsUpdating(true)
    }
  }

  const handleCancel = () => {
    history.push(Routes.PROJECTS)
  }

  useEffect(() => {
    if (isUpdating && !isLoading && !messageDetail) {
      history.push(Routes.PROJECTS)
    }
  }, [isLoading, isUpdating, history])

  return (
    <>
      {project && (
        <Form onSubmit={handleSubmit} width="40vw" mt="large">
          <Fieldset legend="Enter your project details">
            <FieldText
              required
              name="title"
              label="Title"
              defaultValue={title}
              onChange={(e: BaseSyntheticEvent) => setTitle(e.target.value)}
            />
            <FieldTextArea
              required
              label="Description"
              name="description"
              defaultValue={description}
              onChange={(e: BaseSyntheticEvent) =>
                setDescription(e.target.value)
              }
            />
            <FieldSelect
              id="projectType"
              label="Type"
              required
              options={[
                { value: 'Open' },
                { value: 'Closed' },
                { value: 'Invite Only' },
              ]}
              onChange={(value: string) => {
                setProjectType(value)
              }}
            />
            <FieldToggleSwitch
              name="contestant"
              label="Contestant"
              onChange={(e: BaseSyntheticEvent) => {
                setContestant(e.target.checked)
              }}
              on={contestant}
            />
            <FieldToggleSwitch
              name="locked"
              label="Lock"
              onChange={(e: BaseSyntheticEvent) => {
                setLocked(e.target.checked)
              }}
              on={locked}
            />
            <FieldSelectMulti
              id="technologies"
              label="Technologies"
              required
              options={availableTechnologies?.rows.map((row) => ({
                value: row._id,
              }))}
              isFilterable
              placeholder="Type values or select from the list"
              defaultValues={technologies}
              onChange={(values: string[] = []) => {
                setTechnologies(values)
              }}
            />
          </Fieldset>
          <Space>
            <ButtonOutline
              type="button"
              onClick={handleCancel}
              color="critical"
            >
              Cancel
            </ButtonOutline>
            <Button type="submit">Save</Button>
          </Space>
        </Form>
      )}
    </>
  )
}
