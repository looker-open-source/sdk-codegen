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

import type { ReactElement } from 'react';
import React from 'react';
import { Provider } from 'react-redux';
import type { Store } from 'redux';
import { renderWithTheme } from '@looker/components-test-utils';
import type { RenderOptions } from '@testing-library/react';
import { createStore } from '@looker/redux';
import { BrowserAdaptor, registerEnvAdaptor } from '@looker/extension-utils';
import { initRunItSdk } from '@looker/run-it';

import type { LodesState, RootState, SettingState, SpecState } from '../state';
import {
  settingsSlice,
  defaultLodesState,
  defaultSettingsState,
  lodesSlice,
  defaultSpecsState,
  specsSlice,
} from '../state';
import { specState } from '../test-data';
import { renderWithRouter } from './router';

export const withReduxProvider = (
  consumers: ReactElement<any>,
  store: Store<RootState> = createTestStore()
) => {
  registerEnvAdaptor(new BrowserAdaptor(initRunItSdk()));
  return <Provider store={store}>{consumers}</Provider>;
};

export const renderWithReduxProvider = (
  consumers: ReactElement<any>,
  store?: Store<RootState>,
  options?: Omit<RenderOptions<any>, 'queries'>
) => renderWithTheme(withReduxProvider(consumers, store), options);

export const renderWithRouterAndReduxProvider = (
  consumers: ReactElement<any>,
  initialEntries: string[] = ['/'],
  store?: Store<RootState>,
  options?: Omit<RenderOptions<any>, 'queries'>
) =>
  renderWithRouter(
    withReduxProvider(consumers, store),
    initialEntries,
    options
  );

export const preloadedState: RootState = {
  settings: defaultSettingsState,
  lodes: defaultLodesState,
  specs: defaultSpecsState,
};

type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export const createTestStore = (overrides?: DeepPartial<RootState>) =>
  createStore({
    preloadedState: {
      settings: {
        ...preloadedState.settings,
        ...overrides?.settings,
      } as SettingState,
      lodes: {
        ...defaultLodesState,
        ...overrides?.lodes,
      } as LodesState,
      specs: {
        ...specState,
        ...overrides?.specs,
      } as SpecState,
    },
    reducer: {
      settings: settingsSlice.reducer,
      lodes: lodesSlice.reducer,
      specs: specsSlice.reducer,
    },
  });
