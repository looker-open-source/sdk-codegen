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

export interface UserToAdd {
  first: string;
  last: string;
  email: string;
}

export enum Actions {
  PARSE_CSV = 'PARSE_CSV',
  ADD_USERS = 'ADD_USERS',
  INCREMENT_USERS_ADDED = 'INCREMENT_USERS_ADDED',
  RESET_ADD_USERS = 'RESET_ADD_USERS',
}

export interface ParseCsvAction {
  type: Actions.PARSE_CSV;
  payload: File;
}

export interface AddUsersAction {
  type: Actions.ADD_USERS;
  payload: Array<UserToAdd>;
}

export interface IncrementUsersAddedAction {
  type: Actions.INCREMENT_USERS_ADDED;
}

export interface ResetAddUsersAction {
  type: Actions.RESET_ADD_USERS;
}

export type AddUserAction =
  | ParseCsvAction
  | AddUsersAction
  | IncrementUsersAddedAction
  | ResetAddUsersAction;

export const parseCsv = (csvFile: File): ParseCsvAction => ({
  type: Actions.PARSE_CSV,
  payload: csvFile,
});

export const addUsers = (usersToAdd: Array<UserToAdd>): AddUsersAction => ({
  type: Actions.ADD_USERS,
  payload: usersToAdd,
});

export const incrementUsersAdded = (): IncrementUsersAddedAction => ({
  type: Actions.INCREMENT_USERS_ADDED,
});

export const resetAddUsers = (): ResetAddUsersAction => ({
  type: Actions.RESET_ADD_USERS,
});
