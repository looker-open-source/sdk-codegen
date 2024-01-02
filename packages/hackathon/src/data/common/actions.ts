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

import type { MessageDetail } from './reducer';

export enum Actions {
  ERROR = 'ERROR',
  MESSAGE = 'MESSAGE',
  MESSAGE_CLEAR = 'MESSAGE_CLEAR',
  BEGIN_LOADING = 'BEGIN_LOADING',
  END_LOADING = 'END_LOADING',
}

export interface ErrorAction {
  type: Actions.ERROR;
  payload: Error;
}

export interface ClearMessageAction {
  type: Actions.MESSAGE_CLEAR;
}

export interface MessageAction {
  type: Actions.MESSAGE;
  payload: MessageDetail;
}

export interface BeginLoadingAction {
  type: Actions.BEGIN_LOADING;
}

export interface EndLoadingAction {
  type: Actions.END_LOADING;
}

export type CommonAction =
  | ErrorAction
  | ClearMessageAction
  | MessageAction
  | BeginLoadingAction
  | EndLoadingAction;

export const actionError = (error: Error): ErrorAction => ({
  type: Actions.ERROR,
  payload: error,
});

export const actionMessage = (
  messageText: string,
  intent: 'critical' | 'inform' | 'positive' | 'warn'
): MessageAction => ({
  type: Actions.MESSAGE,
  payload: {
    messageText,
    intent,
  },
});

export const actionClearMessage = (): ClearMessageAction => ({
  type: Actions.MESSAGE_CLEAR,
});

export const beginLoading = (): BeginLoadingAction => ({
  type: Actions.BEGIN_LOADING,
});

export const endLoading = (): EndLoadingAction => ({
  type: Actions.END_LOADING,
});
