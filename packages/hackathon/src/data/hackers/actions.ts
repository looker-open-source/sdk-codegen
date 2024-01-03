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

import type { IHackerProps } from '../../models';

export enum Actions {
  ALL_HACKERS_REQUEST = 'ALL_HACKERS_REQUEST',
  ALL_HACKERS_RESPONSE = 'ALL_HACKERS_RESPONSE',
  UPDATE_HACKERS_PAGE_NUM = 'UPDATE_HACKERS_PAGE_NUM',
}

export interface AllHackersRequestAction {
  type: Actions.ALL_HACKERS_REQUEST;
}

export interface AllHackersResponseAction {
  type: Actions.ALL_HACKERS_RESPONSE;
  payload: {
    hackers: IHackerProps[];
    judges: IHackerProps[];
    staff: IHackerProps[];
    admins: IHackerProps[];
  };
}

export interface UpdateHackersPageNumAction {
  type: Actions.UPDATE_HACKERS_PAGE_NUM;
  payload: number;
}

export type HackerAction =
  | AllHackersRequestAction
  | AllHackersResponseAction
  | UpdateHackersPageNumAction;

export const allHackersRequest = (): AllHackersRequestAction => ({
  type: Actions.ALL_HACKERS_REQUEST,
});

export const allHackersResponse = (
  hackers: IHackerProps[],
  judges: IHackerProps[],
  staff: IHackerProps[],
  admins: IHackerProps[]
): AllHackersResponseAction => ({
  type: Actions.ALL_HACKERS_RESPONSE,
  payload: { hackers, judges, staff, admins },
});

export const updateHackersPageNum = (
  pageNum: number
): UpdateHackersPageNumAction => ({
  type: Actions.UPDATE_HACKERS_PAGE_NUM,
  payload: pageNum,
});
