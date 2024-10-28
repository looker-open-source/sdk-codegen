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

export enum Actions {
  GET_JUDGINGS_REQUEST = 'GET_JUDGINGS_REQUEST',
  GET_JUDGINGS_RESPONSE = 'GET_JUDGINGS_RESPONSE',
  GET_JUDGING_REQUEST = 'GET_JUDGING_REQUEST',
  GET_JUDGING_RESPONSE = 'GET_JUDGING_RESPONSE',
  UPDATE_JUDGING_DATA = 'UPDATE_JUDGING_DATA',
  SAVE_JUDGING_REQUEST = 'SAVE_JUDGING_REQUEST',
  SAVE_JUDGING_RESPONSE = 'SAVE_JUDGING_RESPONSE',
  UPDATE_JUDGINGS_PAGE_NUM = 'UPDATE_JUDGINGS_PAGE_NUM',
}

export interface GetJudgingsRequestAction {
  type: Actions.GET_JUDGINGS_REQUEST;
}

export interface GetJudgingsResponseAction {
  type: Actions.GET_JUDGINGS_RESPONSE;
  payload: IJudgingProps[];
}

export interface GetJudgingRequestAction {
  type: Actions.GET_JUDGING_REQUEST;
  payload: string;
}

export interface GetJudgingResponseAction {
  type: Actions.GET_JUDGING_RESPONSE;
  payload?: IJudgingProps;
}

export interface SaveJudgingRequestAction {
  type: Actions.SAVE_JUDGING_REQUEST;
  payload: IJudgingProps;
}

export interface SaveJudgingResponseAction {
  type: Actions.SAVE_JUDGING_RESPONSE;
  payload: {
    judging: IJudgingProps;
    judgingUpdated: boolean;
  };
}

export interface UpdateJudgingsPageNumAction {
  type: Actions.UPDATE_JUDGINGS_PAGE_NUM;
  payload: number;
}

export interface UpdateJudgingData {
  type: Actions.UPDATE_JUDGING_DATA;
  payload: IJudgingProps;
}

export type JudgingAction =
  | GetJudgingsRequestAction
  | GetJudgingsResponseAction
  | GetJudgingRequestAction
  | GetJudgingResponseAction
  | SaveJudgingRequestAction
  | SaveJudgingResponseAction
  | UpdateJudgingsPageNumAction
  | UpdateJudgingData;

export const getJudgingsRequest = (): GetJudgingsRequestAction => ({
  type: Actions.GET_JUDGINGS_REQUEST,
});

export const getJudgingsResponse = (
  judgings: IJudgingProps[]
): GetJudgingsResponseAction => ({
  type: Actions.GET_JUDGINGS_RESPONSE,
  payload: judgings,
});

export const getJudgingRequest = (
  judgingId: string
): GetJudgingRequestAction => ({
  type: Actions.GET_JUDGING_REQUEST,
  payload: judgingId,
});

export const getJudgingResponse = (
  judging?: IJudgingProps
): GetJudgingResponseAction => ({
  type: Actions.GET_JUDGING_RESPONSE,
  payload: judging,
});

export const updateJudgingData = (
  judging: IJudgingProps
): UpdateJudgingData => ({
  type: Actions.UPDATE_JUDGING_DATA,
  payload: judging,
});

export const saveJudgingRequest = (
  judging: IJudgingProps
): SaveJudgingRequestAction => ({
  type: Actions.SAVE_JUDGING_REQUEST,
  payload: judging,
});

export const saveJudgingResponse = (
  judging: IJudgingProps,
  success: boolean
): SaveJudgingResponseAction => ({
  type: Actions.SAVE_JUDGING_RESPONSE,
  payload: { judging, judgingUpdated: success },
});

export const updateJudgingsPageNum = (
  pageNum: number
): UpdateJudgingsPageNumAction => ({
  type: Actions.UPDATE_JUDGINGS_PAGE_NUM,
  payload: pageNum,
});
