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
import ReduxSagaTester from 'redux-saga-tester';
import { createFactory, getFactory } from '@looker/embed-services';
import type { IAPIMethods } from '@looker/sdk-rtl';
import {
  FACTORY_SLICE_NAME,
  defaultFactoryState,
  factoryActions,
  factorySlice,
} from './slice';
import * as sagas from './sagas';

jest.mock('@looker/embed-services', () => ({
  ...jest.requireActual('@looker/embed-services'),
  createFactory: jest.fn(),
}));

describe('Factory sagas', () => {
  let sagaTester: ReduxSagaTester<any>;
  const mockSdk = {} as IAPIMethods;
  const { initFactoryAction, initFactorySuccessAction, setFailureAction } =
    factoryActions;

  beforeEach(() => {
    sagaTester = new ReduxSagaTester({
      initialState: { [FACTORY_SLICE_NAME]: defaultFactoryState },
      reducers: {
        [FACTORY_SLICE_NAME]: factorySlice.reducer,
      },
    });
    sagaTester.start(sagas.saga);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initSaga', () => {
    it('sends initFactorySuccessAction on success', async () => {
      expect(getFactory).toThrow('Factory must be created with an SDK.');

      sagaTester.dispatch(initFactoryAction({ sdk: mockSdk }));

      await sagaTester.waitFor('factory/initFactorySuccessAction');

      const calledActions = sagaTester.getCalledActions();
      expect(calledActions).toHaveLength(2);
      expect(calledActions[0]).toEqual(initFactoryAction({ sdk: mockSdk }));
      expect(calledActions[1]).toEqual(initFactorySuccessAction());
    });

    it('sends setFailureAction on error', async () => {
      const expectedError = 'Failed to create factory';
      (createFactory as jest.Mock).mockImplementationOnce(() => {
        throw new Error(expectedError);
      });
      sagaTester.dispatch(initFactoryAction({ sdk: mockSdk }));

      await sagaTester.waitFor('factory/setFailureAction');
      const calledActions = sagaTester.getCalledActions();
      expect(calledActions).toHaveLength(2);
      expect(calledActions[0]).toEqual(initFactoryAction({ sdk: mockSdk }));
      expect(calledActions[1]).toEqual(
        setFailureAction({ error: expectedError })
      );
    });
  });
});
