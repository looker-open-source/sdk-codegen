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
import type { BaseSyntheticEvent, FC } from 'react'
import React from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import {
  Button,
  ButtonOutline,
  Space,
  Span,
  FieldTextArea,
  Form,
  FieldSlider,
  Tabs2,
  Tab2,
} from '@looker/components'
import {
  saveJudgingRequest,
  updateJudgingData,
} from '../../../data/judgings/actions'
import type { IJudgingProps } from '../../../models'
import { Routes } from '../../../routes'
import { ProjectView } from '../../ProjectsScene/components'

interface JudgingFormProps {
  judging: IJudgingProps
  readonly: boolean
}

export const JudgingForm: FC<JudgingFormProps> = ({ judging, readonly }) => {
  const dispatch = useDispatch()
  const history = useHistory()

  const onValueChange = (event: BaseSyntheticEvent) => {
    const newJudging = { ...judging }
    newJudging[event.target.name] =
      event.target.type === 'range'
        ? parseInt(event.target.value, 10)
        : event.target.value
    dispatch(updateJudgingData(newJudging))
  }

  const handleCancel = () => {
    history.push(Routes.JUDGING)
  }

  const handleSave = (event: BaseSyntheticEvent) => {
    // Prevent form POST request
    event.preventDefault()
    dispatch(saveJudgingRequest(judging))
  }

  const execution = judging.execution
  const scope = judging.scope
  const novelty = judging.novelty
  const impact = judging.impact

  return (
    <Tabs2 defaultTabId="form">
      <Tab2 id="form" label="Judging form">
        {readonly && <Span>You cannot judge this project</Span>}
        <Form width="70vh">
          <FieldSlider
            detail="How well does the project accomplish its goal?"
            description="Scale from 1 to 10 with 1 the lowest and 10 the highest"
            label="Execution"
            min={1}
            max={10}
            step={1}
            onChange={onValueChange}
            value={execution}
            disabled={readonly}
            name="execution"
          />
          <FieldSlider
            detail="How complex is the project's functionality?"
            description="Scale from 1 to 10 with 1 the lowest and 10 the highest"
            label="Scope"
            min={1}
            max={10}
            step={1}
            onChange={onValueChange}
            value={scope}
            disabled={readonly}
            name="scope"
          />
          <FieldSlider
            detail="How novel, unique, or interesting is the project?"
            description="Scale from 1 to 10 with 1 the lowest and 10 the highest"
            label="Novelty"
            min={1}
            max={10}
            step={1}
            onChange={onValueChange}
            value={novelty}
            disabled={readonly}
            name="novelty"
          />
          <FieldSlider
            detail="How useful could the project be to the developer population at large?"
            description="Scale from 1 to 10 with 1 the lowest and 10 the highest"
            label="Impact"
            min={1}
            max={10}
            step={1}
            onChange={onValueChange}
            value={impact}
            disabled={readonly}
            name="impact"
          />
          <strong>Total Score: {judging.score}</strong>
          <FieldTextArea
            name="notes"
            resize="vertical"
            label="Notes"
            placeholder="Additional comments about this project (supports markdown)"
            defaultValue={judging.notes}
            onChange={onValueChange}
            disabled={readonly}
          />
          <Space between>
            <Space>
              <ButtonOutline type="button" onClick={handleCancel}>
                Return to judgings
              </ButtonOutline>
              <Button type="submit" onClick={handleSave} disabled={readonly}>
                Save judging
              </Button>
            </Space>
          </Space>
        </Form>
      </Tab2>
      <Tab2 id="project" label="Project details">
        <ProjectView
          title={judging.$title}
          description={judging.$description}
          technologies={judging.$technologies}
          members={judging.$members}
          project_type={judging.$project_type}
          contestant={judging.$contestant}
        />
      </Tab2>
    </Tabs2>
  )
}
