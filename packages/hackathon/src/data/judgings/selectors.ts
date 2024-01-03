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

import type { RootState } from '../root_reducer';
import type { IJudgingProps } from '../../models';

export const getJudgingsState = (state: RootState): IJudgingProps[] =>
  state.judgingsState.judgings;

export const getJudgingsLoadedState = (state: RootState): boolean =>
  state.judgingsState.judgingsLoaded;

export const getJudgingState = (state: RootState): IJudgingProps | undefined =>
  state.judgingsState.currentJudging;

export const getJudgingUpdatedState = (state: RootState): boolean | undefined =>
  state.judgingsState.judgingUpdated;

export const getJudgingLoadedState = (state: RootState): boolean =>
  state.judgingsState.judgingLoaded;

export const getJudgingsPageNumState = (state: RootState): number =>
  state.judgingsState.currentPageNum;
