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
import type { FC } from 'react';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouteMatch } from 'react-router-dom';
import { actionMessage } from '../../data/common/actions';
import { getHackerState } from '../../data/hack_session/selectors';
import { getJudgingRequest } from '../../data/judgings/actions';
import {
  getJudgingState,
  getJudgingLoadedState,
} from '../../data/judgings/selectors';
import { canJudge } from '../../utils';
import { JudgingForm } from './components';

export const JudgingEditorScene: FC = () => {
  const dispatch = useDispatch();
  const match = useRouteMatch<{ id: string }>('/judging/:id');
  const id = match?.params?.id;
  const hacker = useSelector(getHackerState);
  const judging = useSelector(getJudgingState);
  const judgingLoaded = useSelector(getJudgingLoadedState);

  useEffect(() => {
    if (id) {
      dispatch(getJudgingRequest(id));
    }
  }, [dispatch, id]);

  const readonly = !canJudge(hacker, judging);

  useEffect(() => {
    if (judgingLoaded && readonly) {
      dispatch(actionMessage('Viewing judgment', 'inform'));
    }
  }, [judgingLoaded, readonly]);

  return (
    <>
      {!judging && judgingLoaded && <>No judging information</>}
      {judging && <JudgingForm judging={judging} readonly={readonly} />}
    </>
  );
};
