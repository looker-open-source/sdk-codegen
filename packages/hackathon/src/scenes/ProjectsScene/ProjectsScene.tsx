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
import React, { FC } from 'react'
import {
  Button,
  Dialog,
  DialogContent,
  useToggle,
  Form,
  Fieldset,
  FieldText,
  FieldTextArea,
  FieldToggleSwitch,
  SelectMulti,
} from '@looker/components'

import { Projects } from './models'

interface ProjectSceneProps {}

export const ProjectsScene: FC<ProjectSceneProps> = ({ projects }) => {
  const { value, setOn, setOff } = useToggle()

  return (
    <>
      <Dialog isOpen={value} onClose={setOff}>
        <DialogContent>
          <ProjectForm />
        </DialogContent>
      </Dialog>
      <Button iconBefore="CircleAdd" onClick={setOn}>
        Add Project
      </Button>
    </>
  )
}

// Use guid function for registration_id. There's a shakespearean guid (word-word-word). Check in Looker package.json

const ProjectForm = () => {
  return (
    <>
      <Form
        onSubmit={() => {
          console.log('submitted')
        }}
      >
        <Fieldset legend="Enter your project details">
          <FieldText required label="Title" />
          <FieldTextArea required label="Description" />
          <FieldText required label="Type" />
          <FieldToggleSwitch name="contestant" label="Contestant" />
          <FieldToggleSwitch name="locked" label="Lock" />
          <SelectMulti
            options={[
              { value: 'Typescript' },
              { value: 'React' },
              { value: 'CSS' },
              { value: 'C#' },
              { value: 'Go' },
              { value: 'Python' },
            ]}
            isFilterable
            placeholder="Type values or select from the list"
            freeInput
          />
        </Fieldset>
      </Form>
      <Button>Submit</Button>
    </>
  )
}
