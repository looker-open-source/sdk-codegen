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
import type { IJudgingProps } from '../../models';
import type { JudgingAction } from './actions';
import { Actions } from './actions';

export interface JudgingsState {
  currentPageNum: number;
  judgings: IJudgingProps[];
  judgingsLoaded: boolean;
  currentJudging?: IJudgingProps;
  judgingUpdated?: boolean;
  judgingLoaded: boolean;
}

const defaultState: Readonly<JudgingsState> = Object.freeze({
  currentPageNum: 1,
  judgingsLoaded: false,
  judgings: [],
  judgingLoaded: false,
});

const calculateScore = (judging: IJudgingProps): number =>
  2 * judging.execution + judging.scope + judging.novelty + judging.impact;

const normalizeValue = (value: number) => {
  return value > 0 ? value : 1;
};

const normalizeJudgingData = (
  judging?: IJudgingProps
): IJudgingProps | undefined => {
  const newJudging = judging;
  if (newJudging) {
    newJudging.scope = normalizeValue(newJudging.scope);
    newJudging.novelty = normalizeValue(newJudging.novelty);
    newJudging.execution = normalizeValue(newJudging.execution);
    newJudging.impact = normalizeValue(newJudging.impact);
    newJudging.score = calculateScore(newJudging);
  }
  return newJudging;
};

export const judgingsReducer = (
  state: JudgingsState = defaultState,
  action: JudgingAction
): JudgingsState => {
  switch (action.type) {
    case Actions.GET_JUDGINGS_REQUEST:
      return {
        ...state,
        judgingsLoaded: false,
        currentJudging: undefined,
        judgingUpdated: undefined,
        judgingLoaded: false,
      };
    case Actions.GET_JUDGINGS_RESPONSE:
      return {
        ...state,
        judgings: action.payload,
        judgingsLoaded: true,
      };
    case Actions.GET_JUDGING_REQUEST:
      return {
        ...state,
        currentJudging: undefined,
        judgingUpdated: undefined,
        judgingLoaded: false,
      };
    case Actions.GET_JUDGING_RESPONSE:
      return {
        ...state,
        currentJudging: normalizeJudgingData(action.payload),
        judgingLoaded: true,
      };
    case Actions.UPDATE_JUDGING_DATA:
      return {
        ...state,
        currentJudging: normalizeJudgingData(action.payload),
      };
    case Actions.UPDATE_JUDGINGS_PAGE_NUM:
      return {
        ...state,
        currentPageNum: action.payload,
      };
    case Actions.SAVE_JUDGING_REQUEST:
      return {
        ...state,
        judgingUpdated: undefined,
      };
    case Actions.SAVE_JUDGING_RESPONSE:
      return {
        ...state,
        currentJudging: action.payload.judging,
        judgingUpdated: action.payload.judgingUpdated,
      };
    default:
      return state;
  }
};
