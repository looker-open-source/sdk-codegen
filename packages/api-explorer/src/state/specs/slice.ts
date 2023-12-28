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
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { ApiModel, SpecList } from '@looker/sdk-codegen';
import { createSliceHooks } from '@looker/redux';

import { saga } from './sagas';

export interface SpecState {
  specs: SpecList;
  currentSpecKey: string;
  error?: Error;
  working: boolean;
  description?: string;
}

export const defaultSpecsState: SpecState = {
  specs: {},
  currentSpecKey: '',
  working: true,
  description: undefined,
};

export interface InitSpecsAction {
  specKey: string | null;
}

export interface InitSpecsSuccessPayload {
  specs: SpecList;
  currentSpecKey: string;
}

export interface SetCurrentSpecAction {
  currentSpecKey: string;
}

interface SetCurrentSpecSuccessAction {
  api: ApiModel;
  currentSpecKey: string;
}

export const specsSlice = createSlice({
  name: 'specs',
  initialState: defaultSpecsState,
  reducers: {
    initSpecsAction(state, _action: PayloadAction<InitSpecsAction>) {
      state.working = true;
      state.description = 'Fetching specifications...';
    },
    initSpecsSuccessAction(
      state,
      action: PayloadAction<InitSpecsSuccessPayload>
    ) {
      state.specs = action.payload.specs;
      state.currentSpecKey = action.payload.currentSpecKey;
      state.working = false;
      state.description = undefined;
    },
    initSpecsFailureAction(state, action: PayloadAction<Error>) {
      state.working = false;
      state.error = action.payload;
    },
    setCurrentSpecAction(state, action: PayloadAction<SetCurrentSpecAction>) {
      state.working = true;
      state.description = `Fetching API ${action.payload.currentSpecKey} spec`;
    },
    setCurrentSpecSuccessAction(
      state,
      action: PayloadAction<SetCurrentSpecSuccessAction>
    ) {
      state.currentSpecKey = action.payload.currentSpecKey;
      state.specs[state.currentSpecKey].api = action.payload.api;
      state.description = undefined;
      state.working = false;
    },
    setCurrentSpecFailureAction(state, action: PayloadAction<Error>) {
      state.working = false;
      state.error = action.payload;
    },
  },
});

export const specActions = specsSlice.actions;
export const { useActions: useSpecActions, useStoreState: useSpecStoreState } =
  createSliceHooks(specsSlice, saga);
