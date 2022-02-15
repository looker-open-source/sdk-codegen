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
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import {
  Slider,
  Button,
  Heading,
  ButtonOutline,
  Space,
  Span,
  SpaceVertical,
  FieldTextArea,
  Tabs2,
  Tab2,
} from '@looker/components'
import {
  saveJudgingRequest,
  updateJudgingData,
} from '../../../data/judgings/actions'
import { getHackerState } from '../../../data/hack_session/selectors'
import type { IJudgingProps } from '../../../models'
import { Routes } from '../../../routes'
import { JudgingView } from './JudgingView'

interface JudgingFormProps {
  judging: IJudgingProps
  readonly: boolean
}

export const JudgingForm: FC<JudgingFormProps> = ({ judging, readonly }) => {
  const dispatch = useDispatch()
  const history = useHistory()
  const hacker = useSelector(getHackerState)

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

  const handleSave = () => {
    dispatch(saveJudgingRequest(judging))
  }

  const execution = judging.execution
  const ambition = judging.ambition
  const coolness = judging.coolness
  const impact = judging.impact

  return (
    <SpaceVertical>
      <Tabs2>
        <Tab2 id="form" label="Form">
          {!hacker.canAdmin && judging.user_id !== hacker.id && (
            <Span>You are not assigned to judge this project</Span>
          )}
          <SpaceVertical gap="xlarge" width="40vh">
            <Heading as="h1">{judging.$title}</Heading>
            <Span>{judging.$description}</Span>
            <SpaceVertical gap="medium">
              <Slider
                name="execution"
                onChange={onValueChange}
                value={execution}
                min={1}
                max={10}
                step={1}
                disabled={readonly}
              />
              <Heading>
                <strong>Execution:</strong> {execution}
              </Heading>
            </SpaceVertical>
            <SpaceVertical gap="medium">
              <Slider
                name="ambition"
                onChange={onValueChange}
                value={ambition}
                min={1}
                max={10}
                step={1}
                disabled={readonly}
              />
              <Heading>
                <strong>Ambition:</strong> {ambition}
              </Heading>
            </SpaceVertical>
            <SpaceVertical gap="medium">
              <Slider
                name="coolness"
                onChange={onValueChange}
                value={coolness}
                min={1}
                max={10}
                step={1}
                disabled={readonly}
              />
              <Heading>
                <strong>Coolness:</strong> {coolness}
              </Heading>
            </SpaceVertical>
            <SpaceVertical gap="medium">
              <Slider
                name="impact"
                onChange={onValueChange}
                value={impact}
                min={1}
                max={10}
                step={1}
                disabled={readonly}
              />
              <Heading>
                <strong>Impact:</strong> {impact}
              </Heading>
            </SpaceVertical>
            <Heading>
              <strong>Total Score: {judging.score}</strong>
            </Heading>
            <SpaceVertical gap="medium">
              <FieldTextArea
                name="notes"
                resize="vertical"
                label="Notes"
                placeholder="Additional comments about this project (supports markdown)"
                defaultValue={judging.notes}
                onChange={onValueChange}
                disabled={readonly}
              />
            </SpaceVertical>
            <Space between>
              <Space>
                <ButtonOutline type="button" onClick={handleCancel}>
                  Return to judging
                </ButtonOutline>
                <Button type="submit" onClick={handleSave} disabled={readonly}>
                  Save judging
                </Button>
              </Space>
            </Space>
          </SpaceVertical>
        </Tab2>
        <Tab2 id="preview" label="Preview">
          <JudgingView judging={judging} />
        </Tab2>
      </Tabs2>
    </SpaceVertical>
  )
}
