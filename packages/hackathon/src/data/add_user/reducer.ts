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

import type { AddUserAction, UserToAdd } from './actions';
import { Actions } from './actions';

export enum ADD_STAGES {
  INIT,
  USERS_ADDING,
  USERS_ADDED,
}

export interface AddUserState {
  usersToAdd: Array<UserToAdd>;
  usersAdded: number;
  stage: ADD_STAGES;
}

const defaultState: Readonly<AddUserState> = Object.freeze({
  usersToAdd: [],
  usersAdded: 0,
  stage: ADD_STAGES.INIT,
});

export const addUserReducer = (
  state: AddUserState = defaultState,
  action: AddUserAction
): AddUserState => {
  switch (action.type) {
    case Actions.PARSE_CSV:
      return {
        ...defaultState,
      };
    case Actions.ADD_USERS:
      return {
        ...defaultState,
        stage: ADD_STAGES.USERS_ADDING,
        usersToAdd: action.payload,
        usersAdded: 0,
      };
    case Actions.INCREMENT_USERS_ADDED:
      return {
        ...state,
        usersAdded: state.usersAdded + 1,
        stage:
          state.usersAdded + 1 < state.usersToAdd.length
            ? ADD_STAGES.USERS_ADDING
            : ADD_STAGES.INIT,
      };
    case Actions.RESET_ADD_USERS:
      return {
        ...defaultState,
      };
    default:
      return state;
  }
};
