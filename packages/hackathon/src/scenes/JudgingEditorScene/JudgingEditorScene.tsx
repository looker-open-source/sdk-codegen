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
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import {
  Header,
  Slider,
  Button,
  Heading,
  ButtonOutline,
  Space,
  Text,
} from '@looker/components'
import { allJudgingsRequest } from '../../data/judgings/actions'
import { getHackerState } from '../../data/hack_session/selectors'
import { Judging, Judgings } from '../../models'
import { Routes } from '../../routes/AppRouter'

interface JudgingFormProps {
  judgings: Judgings
  judging: Judging
}

export const JudgingForm: FC<JudgingFormProps> = ({ judgings, judging }) => {
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(allJudgingsRequest())
  }, [dispatch])
  const history = useHistory()
  const hacker = useSelector(getHackerState)
  // const isLoading = useSelector(isLoadingState)
  const [execution, setExecution] = useState<number>(0)
  const [ambition, setAmbition] = useState<number>(0)
  const [coolness, setCoolness] = useState<number>(0)
  const [impact, setImpact] = useState<number>(0)

  const onExecutionChange = (event: BaseSyntheticEvent) => {
    setExecution(event.target.value)
  }
  const onAmbitionChange = (event: BaseSyntheticEvent) => {
    setAmbition(event.target.value)
  }

  const onCoolnessChange = (event: BaseSyntheticEvent) => {
    setCoolness(event.target.value)
  }
  const onImpactChange = (event: BaseSyntheticEvent) => {
    setImpact(event.target.value)
  }

  const handleCancel = () => {
    history.push(Routes.JUDGING)
  }

  setExecution(judging.execution)
  setAmbition(judging.ambition)
  setCoolness(judging.coolness)
  setImpact(judging.impact)

  const handleSave = () => {
    judging.execution = execution
    judging.ambition = ambition
    judging.coolness = coolness
    judging.impact = impact
    if (judgings) {
      console.log({ judging })
      // await judgings.save(judging)
    }
  }

  return (
    <>
      {judging && judging.user_id !== hacker.id && (
        <Text>You can't judge this</Text>
      )}
      {judging && (
        <>
          <Header>{judging.$project.title}</Header>
          <div>
            <Slider
              onChange={onExecutionChange}
              value={execution}
              min={1}
              max={10}
            />
            <Heading>
              <strong>Execution:</strong> {execution}
            </Heading>
          </div>
          <div>
            <Slider
              onChange={onAmbitionChange}
              value={ambition}
              min={1}
              max={10}
            />
            <Heading>
              <strong>Ambition:</strong> {ambition}
            </Heading>
          </div>
          <div>
            <Slider
              onChange={onCoolnessChange}
              value={coolness}
              min={1}
              max={10}
            />
            <Heading>
              <strong>Coolness:</strong> {coolness}
            </Heading>
          </div>
          <div>
            <Slider onChange={onImpactChange} value={impact} min={1} max={10} />
            <Heading>
              <strong>Impact:</strong> {impact}
            </Heading>
          </div>
          <Space between width="100%">
            <Space>
              <ButtonOutline type="button" onClick={handleCancel}>
                Cancel
              </ButtonOutline>
              <Button type="submit" onClick={handleSave}>
                Save
              </Button>
            </Space>
          </Space>
        </>
      )}
    </>
  )
}

interface JudgingEditorSceneProps {
  judgings?: Judgings
  judging?: Judging
}

export const JudgingEditorScene: FC<JudgingEditorSceneProps> = ({
  judgings,
  judging,
}) => {
  // TODO: add a not found error in case judging is not found
  return (
    <>
      {(!judgings || !judging) && <>No judging information</>}
      {judgings && judging && (
        <JudgingForm judgings={judgings} judging={judging} />
      )}
    </>
  )
}
