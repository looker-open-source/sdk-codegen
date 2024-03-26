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
import { createSliceHooks } from '@looker/redux';
import type { IDeclarationMine, IExampleMine } from '@looker/sdk-codegen';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import { saga } from './sagas';

export interface LodesState {
  examples?: IExampleMine;
  declarations?: IDeclarationMine;
  error?: Error;
}

export const defaultLodesState: LodesState = {
  examples: undefined,
  declarations: undefined,
};

export interface InitPayload {
  examplesLodeUrl?: string;
  declarationsLodeUrl?: string;
}

type InitSuccessAction = LodesState;

export const lodesSlice = createSlice({
  name: 'lodes',
  initialState: defaultLodesState,
  reducers: {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    initLodesAction(_state, _action: PayloadAction<InitPayload>) {},
    initLodesSuccessAction(state, action: PayloadAction<InitSuccessAction>) {
      state.examples = action.payload.examples;
      state.declarations = action.payload.declarations;
    },
    initLodesFailureAction(state, action: PayloadAction<Error>) {
      state.error = action.payload;
    },
  },
});

export const lodeActions = lodesSlice.actions;
export const { useActions: useLodeActions, useStoreState: useLodesStoreState } =
  createSliceHooks(lodesSlice, saga);
