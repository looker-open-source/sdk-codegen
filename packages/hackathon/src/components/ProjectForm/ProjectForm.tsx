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
  Select,
  SelectMulti,
  Button,
} from '@looker/components'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { Project, Projects } from '../../models'
import {
  beginEditProjectRequest,
  saveProjectRequest,
} from '../../data/projects/actions'
import {
  getHackerState,
  getTechnologies,
} from '../../data/hack_session/selectors'
import { Routes } from '../../routes/AppRouter'
import { isLoadingState } from '../../data/common/selectors'

interface ProjectDialogProps {
  isUpdate: boolean
  projects: Projects
  project: Project
}

export const ProjectForm: FC<ProjectDialogProps> = ({
  isUpdate,
  projects,
  project,
}) => {
  const [state, setState] = useState<Project>(project)
  const [isUpdating, setIsUpdating] = useState(false)
  const dispatch = useDispatch()
  const technologies = useSelector(getTechnologies)
  const hacker = useSelector(getHackerState)
  const isLoading = useSelector(isLoadingState)
  const history = useHistory()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (isUpdate) {
      dispatch(beginEditProjectRequest(projects, state))
    } else {
      dispatch(saveProjectRequest(hacker.id, projects, state))
    }
    setIsUpdating(true)
  }

  useEffect(() => {
    if (isUpdating && !isLoading) {
      history.push(Routes.PROJECTS)
    }
  }, [isLoading, isUpdating, history])

  const handleBoolChange = (e: BaseSyntheticEvent) => {
    setState((prevState) => {
      prevState[e.target.name] = e.target.checked
      return prevState
    })
  }

  const handleChange = (e: BaseSyntheticEvent) => {
    setState((prevState) => {
      prevState[e.target.name] = e.target.value
      return prevState
    })
  }

  return (
    <Form onSubmit={handleSubmit} width="80%">
      <Fieldset legend="Enter your project details">
        <FieldText
          required
          name="title"
          label="Title"
          defaultValue={state.title}
          onChange={handleChange}
        />
        <FieldTextArea
          required
          label="Description"
          name="description"
          defaultValue={state.description}
          onChange={handleChange}
        />
        <Select
          required
          label="Type"
          options={[
            { value: 'Open' },
            { value: 'Closed' },
            { value: 'Invite Only' },
          ]}
          defaultValue={state.project_type}
          onChange={(value: string) => {
            setState((prevState) => {
              prevState.project_type = value
              return prevState
            })
          }}
        />
        <FieldToggleSwitch
          name="contestant"
          label="Contestant"
          onChange={handleBoolChange}
          on={state.contestant}
        />
        <FieldToggleSwitch
          name="locked"
          label="Lock"
          onChange={handleBoolChange}
          on={state.locked}
        />
        <SelectMulti
          options={technologies?.rows.map((row) => ({
            value: row._id,
          }))}
          isFilterable
          placeholder="Type values or select from the list"
          freeInput
          defaultValues={state.technologies as string[]}
          onChange={(values?: string[]) => {
            setState((prevState) => {
              prevState.technologies = values || []
              return prevState
            })
          }}
        />
      </Fieldset>
      <Button type="submit">Save</Button>
    </Form>
  )
}
