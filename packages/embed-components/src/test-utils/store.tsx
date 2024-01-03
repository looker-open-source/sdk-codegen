/*

 MIT License

 Copyright (c) 2023 Looker Data Sciences, Inc.

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
import { defaultFactoryState, factorySlice } from '../GlobalStore';
import type { FactoryState, RootState } from '../GlobalStore';
import { defaultThemesState, themesSlice } from '../Theme';
import type { ThemesState } from '../Theme';

type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export const createTestStore = (overrides?: DeepPartial<RootState>) =>
  createStore({
    preloadedState: {
      factory: {
        ...defaultFactoryState,
        ...overrides?.factory,
      } as FactoryState,
      themes: { ...defaultThemesState, ...overrides?.themes } as ThemesState,
    },
    reducer: {
      factory: factorySlice.reducer,
      themes: themesSlice.reducer,
    },
  });
