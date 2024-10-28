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
import ReduxSagaTester from 'redux-saga-tester';
import { registerTestEnvAdaptor } from '@looker/extension-utils';
import { initRunItSdk } from '@looker/run-it';
import cloneDeep from 'lodash/cloneDeep';
import { ApixAdaptor } from '../../utils';

import { getLoadedSpecs } from '../../test-data';
import { specActions, specsSlice } from './slice';
import * as sagas from './sagas';

describe('Specs Sagas', () => {
  let sagaTester: ReduxSagaTester<any>;
  const adaptor = new ApixAdaptor(initRunItSdk(), '');
  registerTestEnvAdaptor(adaptor);
  const specState = getLoadedSpecs();
  const mockError = new Error('boom');

  beforeEach(() => {
    jest.resetAllMocks();
    sagaTester = new ReduxSagaTester({
      initialState: { specs: { specs: specState } },
      reducers: {
        specs: specsSlice.reducer,
      },
    });
    sagaTester.start(sagas.saga);
  });

  describe('initSaga', () => {
    const { initSpecsAction, initSpecsFailureAction, initSpecsSuccessAction } =
      specActions;

    it('sends initSpecsFailureAction on error', async () => {
      jest.spyOn(adaptor, 'fetchSpecList').mockRejectedValueOnce(mockError);

      sagaTester.dispatch(initSpecsAction({ specKey: null }));
      await sagaTester.waitFor('specs/initSpecsFailureAction');
      const calledActions = sagaTester.getCalledActions();
      expect(calledActions).toHaveLength(2);
      expect(calledActions[0]).toEqual(initSpecsAction({ specKey: null }));
      expect(calledActions[1]).toEqual(initSpecsFailureAction(mockError));
    });

    it('sends initSpecsSuccessAction on success', async () => {
      // fetchSpecList returns the test specs
      jest
        .spyOn(adaptor, 'fetchSpecList')
        .mockResolvedValueOnce(cloneDeep(specState));

      const currentSpec = specState['3.1'];
      jest.spyOn(adaptor, 'fetchSpec').mockResolvedValueOnce(currentSpec!);

      // expected state is all the specs with the current spec containing the ApiModel
      const expected = cloneDeep(specState);
      expected[currentSpec.key] = currentSpec;

      sagaTester.dispatch(initSpecsAction({ specKey: null }));
      await sagaTester.waitFor('specs/initSpecsSuccessAction');
      const calledActions = sagaTester.getCalledActions();
      expect(calledActions).toHaveLength(2);
      expect(calledActions[0]).toEqual(initSpecsAction({ specKey: null }));
      expect(calledActions[1]).toEqual(
        initSpecsSuccessAction({
          specs: expected,
          currentSpecKey: currentSpec.key,
        })
      );
    });
  });

  describe('setCurrentSpecSaga', () => {
    const {
      setCurrentSpecAction,
      setCurrentSpecSuccessAction,
      setCurrentSpecFailureAction,
    } = specActions;
    const spec = specState['4.0'];

    it('sends setCurrentSpecSuccessAction on success', async () => {
      jest.spyOn(adaptor, 'fetchSpec').mockResolvedValueOnce(spec);

      sagaTester.dispatch(setCurrentSpecAction({ currentSpecKey: spec.key }));
      await sagaTester.waitFor('specs/setCurrentSpecAction');
      const calledActions = sagaTester.getCalledActions();
      expect(calledActions).toHaveLength(2);
      expect(calledActions[0]).toEqual(
        setCurrentSpecAction({ currentSpecKey: spec.key })
      );
      expect(calledActions[1]).toEqual(
        setCurrentSpecSuccessAction({
          api: spec.api!,
          currentSpecKey: spec.key,
        })
      );
    });

    it('sends setCurrentSpecFailureAction on failure', async () => {
      jest.spyOn(adaptor, 'fetchSpec').mockRejectedValueOnce(mockError);

      sagaTester.dispatch(setCurrentSpecAction({ currentSpecKey: spec.key }));
      await sagaTester.waitFor('specs/setCurrentSpecAction');
      const calledActions = sagaTester.getCalledActions();
      expect(calledActions).toHaveLength(2);
      expect(calledActions[0]).toEqual(
        setCurrentSpecAction({ currentSpecKey: spec.key })
      );
      expect(calledActions[1]).toEqual(setCurrentSpecFailureAction(mockError));
    });
  });
});
