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
import React, { BaseSyntheticEvent, FC, FormEvent, useState } from 'react'
import {
  Dialog,
  DialogContent,
  Form,
  Fieldset,
  FieldText,
  FieldTextArea,
  FieldToggleSwitch,
  Select,
  SelectMulti,
  Button,
  useToggle,
} from '@looker/components'
import { useDispatch, useSelector } from 'react-redux'
import { DelimArray } from '@looker/sdk-rtl/src/browser'
import { Project } from '../../models'
import { saveProjectRequest } from '../../data/projects/actions'
import { getTechnologies } from '../../data/hack_session/selectors'

interface ProjectDialogProps {
  project?: Project
}

export const ProjectDialog: FC<ProjectDialogProps> = ({ project }) => {
  const { value, setOff, setOn } = useToggle()
  const [state, setState] = useState<Project>(project || new Project())

  const dispatch = useDispatch()
  const technologies = useSelector(getTechnologies)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    dispatch(saveProjectRequest(state))
  }

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
    <>
      <Dialog isOpen={value} onClose={setOff}>
        <DialogContent>
          <Form onSubmit={handleSubmit}>
            <Fieldset legend="Enter your project details">
              <FieldText
                required
                name="title"
                label="Title"
                onChange={handleChange}
              />
              <FieldTextArea
                required
                label="Description"
                name="description"
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
                  value: row.id,
                  label: row.title,
                }))}
                isFilterable
                placeholder="Type values or select from the list"
                freeInput
                onChange={(values?: string[]) => {
                  setState((prevState) => {
                    prevState.technologies = new DelimArray(values)
                    return prevState
                  })
                }}
              />
            </Fieldset>
            <Button>Submit</Button>
          </Form>
        </DialogContent>
      </Dialog>
      <Button iconBefore="CircleAdd" onClick={setOn}>
        Add Project
      </Button>
    </>
  )
}
