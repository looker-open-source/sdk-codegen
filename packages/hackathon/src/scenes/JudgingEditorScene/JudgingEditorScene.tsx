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
import React, { FC, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouteMatch } from 'react-router-dom'
import { getHackerState } from '../../data/hack_session/selectors'
import { allJudgingsRequest } from '../../data/judgings/actions'
import {
  getJudgingsState,
  getJudgingsListState,
  getJudgingsLoadedState,
} from '../../data/judgings/selectors'
import { Judging } from '../../models'
import { actionMessage } from '../../data/common/actions'
import { JudgingForm } from '../../components/JudgingForm'

export const JudgingEditorScene: FC = () => {
  const dispatch = useDispatch()
  const match = useRouteMatch<{ id: string }>('/judging/:id')
  const hacker = useSelector(getHackerState)
  const judgings = useSelector(getJudgingsState)
  const judgingsList = useSelector(getJudgingsListState)
  const judgingsLoaded = useSelector(getJudgingsLoadedState)
  const [judging, setJudging] = useState<Judging>()

  useEffect(() => {
    dispatch(allJudgingsRequest())
  }, [dispatch])

  useEffect(() => {
    if (match?.params?.id && judgingsList) {
      const judgement = judgingsList.find(
        (judging: Judging) => judging._id === match?.params?.id
      )
      if (judgement) {
        if (
          hacker.canAdmin ||
          (hacker.canJudge && judgement.user_id === hacker.id)
        ) {
          setJudging(judgement)
        } else {
          dispatch(actionMessage('Could not find judging details', 'critical'))
        }
      } else {
        if (judgingsLoaded) {
          dispatch(actionMessage('Could not find judging details', 'critical'))
        }
      }
    }
  }, [match, judgingsList, judgingsLoaded])

  return (
    <>
      {(!judgings || !judging) && <>No judging information</>}
      {judgings && judging && (
        <JudgingForm judging={judging} judgings={judgings} />
      )}
    </>
  )
}
