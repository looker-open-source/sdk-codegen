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
import React, { BaseSyntheticEvent, FC, useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import {
  Slider,
  Button,
  Heading,
  ButtonOutline,
  Space,
  Text,
  SpaceVertical,
  FieldTextArea,
} from '@looker/components'
import { saveJudgement } from '../../data/judgings/actions'
import { isLoadingState, getMessageState } from '../../data/common/selectors'
import { getHackerState } from '../../data/hack_session/selectors'
import { Judging, Judgings } from '../../models'
import { Routes } from '../../routes/AppRouter'

interface JudgingFormProps {
  judgings: Judgings
  judging: Judging
}

export const JudgingForm: FC<JudgingFormProps> = ({ judgings, judging }) => {
  const dispatch = useDispatch()
  const history = useHistory()
  const hacker = useSelector(getHackerState)
  const isLoading = useSelector(isLoadingState)
  const messageDetail = useSelector(getMessageState)
  const [isUpdating, setIsUpdating] = useState(false)
  const [execution, setExecution] = useState<number>(1)
  const [ambition, setAmbition] = useState<number>(1)
  const [coolness, setCoolness] = useState<number>(1)
  const [impact, setImpact] = useState<number>(1)
  const [notes, setNotes] = useState<string>('')
  const [score, setScore] = useState<number>(0)
  useEffect(() => {
    judging.load()
    setExecution(judging.execution || 1)
    setAmbition(judging.ambition || 1)
    setCoolness(judging.coolness || 1)
    setImpact(judging.impact || 1)
    setNotes(judging.notes || '')
  }, [judging])

  useEffect(() => {
    if (!isLoading && !messageDetail && isUpdating) {
      history.push(Routes.JUDGING)
    }
  }, [history, isLoading, messageDetail, isUpdating])

  useEffect(() => {
    setScore(judging.calculateScore(execution, ambition, coolness, impact))
  }, [judging, execution, ambition, coolness, impact])

  const onExecutionChange = (event: BaseSyntheticEvent) => {
    setExecution(event.target.valueAsNumber)
  }

  const onAmbitionChange = (event: BaseSyntheticEvent) => {
    setAmbition(event.target.valueAsNumber)
  }

  const onCoolnessChange = (event: BaseSyntheticEvent) => {
    setCoolness(event.target.valueAsNumber)
  }

  const onImpactChange = (event: BaseSyntheticEvent) => {
    setImpact(event.target.valueAsNumber)
  }

  const onNotesChange = (event: BaseSyntheticEvent) => {
    setNotes(event.target.value)
  }

  const handleCancel = () => {
    history.push(Routes.JUDGING)
  }

  const handleSave = () => {
    judging.execution = execution
    judging.ambition = ambition
    judging.coolness = coolness
    judging.impact = impact
    judging.notes = notes
    dispatch(saveJudgement(judgings, judging))
    setIsUpdating(true)
  }

  return (
    <>
      {!hacker.canAdmin() && judging.user_id !== hacker.id && (
        <Text>You can't judge this</Text>
      )}
      <SpaceVertical gap="xlarge" width="40vh">
        <Heading as="h1">{judging.$project.title}</Heading>
        <SpaceVertical gap="medium">
          <Slider
            onChange={onExecutionChange}
            value={execution}
            min={1}
            max={10}
            step={1}
          />
          <Heading>
            <strong>Execution:</strong> {execution}
          </Heading>
        </SpaceVertical>
        <SpaceVertical gap="medium">
          <Slider
            onChange={onAmbitionChange}
            value={ambition}
            min={1}
            max={10}
            step={1}
          />
          <Heading>
            <strong>Ambition:</strong> {ambition}
          </Heading>
        </SpaceVertical>
        <SpaceVertical gap="medium">
          <Slider
            onChange={onCoolnessChange}
            value={coolness}
            min={1}
            max={10}
            step={1}
          />
          <Heading>
            <strong>Coolness:</strong> {coolness}
          </Heading>
        </SpaceVertical>
        <SpaceVertical gap="medium">
          <Slider
            onChange={onImpactChange}
            value={impact}
            min={1}
            max={10}
            step={1}
          />
          <Heading>
            <strong>Impact:</strong> {impact}
          </Heading>
        </SpaceVertical>
        <Heading>
          <strong>Total Score: {score}</strong>
        </Heading>
        <SpaceVertical gap="medium">
          <FieldTextArea
            resize="vertical"
            label="Notes"
            placeholder="Additional comments about this project"
            defaultValue={notes}
            onChange={onNotesChange}
          />
        </SpaceVertical>
        <Space between>
          <Space>
            <ButtonOutline type="button" onClick={handleCancel}>
              Return
            </ButtonOutline>
            <Button type="submit" onClick={handleSave}>
              Save
            </Button>
          </Space>
        </Space>
      </SpaceVertical>
    </>
  )
}
