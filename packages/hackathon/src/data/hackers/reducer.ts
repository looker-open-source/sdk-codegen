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
import type { HackerAction } from './actions';
import { Actions } from './actions';

export interface HackersState {
  currentPageNum: number;
  hackers: IHackerProps[];
  judges: IHackerProps[];
  staff: IHackerProps[];
  admins: IHackerProps[];
}

const defaultState: Readonly<HackersState> = Object.freeze({
  currentPageNum: 1,
  hackers: [],
  judges: [],
  staff: [],
  admins: [],
});

export const hackersReducer = (
  state: HackersState = defaultState,
  action: HackerAction
): HackersState => {
  switch (action.type) {
    case Actions.ALL_HACKERS_RESPONSE: {
      const { hackers, staff, admins, judges } = action.payload;
      return {
        ...state,
        hackers,
        judges,
        staff,
        admins,
      };
    }
    case Actions.UPDATE_HACKERS_PAGE_NUM:
      return {
        ...state,
        currentPageNum: action.payload,
      };
    default:
      return state;
  }
};
