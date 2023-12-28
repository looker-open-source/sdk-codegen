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
import { createStore } from '@looker/redux';
import type { DevToolsEnhancerOptions, PayloadAction } from '@reduxjs/toolkit';
import type { Action } from 'redux';
import map from 'lodash/map';
import type { SpecList } from '@looker/sdk-codegen';

import type { SettingState } from './settings';
import { defaultSettingsState, settingsSlice } from './settings';
import type { LodesState } from './lodes';
import { lodesSlice, defaultLodesState } from './lodes';
import type { SpecState, InitSpecsSuccessPayload } from './specs';
import { defaultSpecsState, specsSlice } from './specs';

const isInitSuccessAction = (
  action: any
): action is PayloadAction<InitSpecsSuccessPayload> => !!action.payload?.specs;

const actionSanitizer = <A extends Partial<Action>>(
  action: A,
  _id: number
): A => {
  if (isInitSuccessAction(action)) {
    action = {
      ...action,
      payload: {
        ...action.payload,
        specs: sanitizeSpecs(action.payload.specs),
      },
    };
  }
  return action;
};

const stateSanitizer = <S extends Partial<RootState>>(
  state: S,
  _index: number
): S => {
  if (state.specs) {
    return {
      ...state,
      specs: {
        ...state.specs,
        specs: sanitizeSpecs(state.specs.specs),
      },
    };
  }
  return state;
};

const sanitizeSpecs = (specList: SpecList) =>
  map(specList, (spec) => ({
    ...spec,
    api: spec.api ? '<api>' : undefined,
    specContent: spec.specContent ? '<specContent>' : undefined,
  })) as unknown as SpecList;

const devTools =
  process.env.NODE_ENV !== 'production'
    ? ({ actionSanitizer, stateSanitizer } as DevToolsEnhancerOptions)
    : false;

export const store = createStore({
  devTools,
  preloadedState: {
    settings: defaultSettingsState,
    lodes: defaultLodesState,
    specs: defaultSpecsState,
  },
  reducer: {
    settings: settingsSlice.reducer,
    lodes: lodesSlice.reducer,
    specs: specsSlice.reducer,
  },
});

export interface RootState {
  settings: SettingState;
  lodes: LodesState;
  specs: SpecState;
}
