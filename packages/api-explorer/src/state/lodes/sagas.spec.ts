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
import { examples, declarations } from '../../test-data';
import * as lodeUtils from '../../utils/lodeUtils';
import * as sagas from './sagas';
import { lodeActions, lodesSlice } from './slice';

describe('Lode sagas', () => {
  let sagaTester: ReduxSagaTester<any>;

  beforeEach(() => {
    jest.resetAllMocks();
    sagaTester = new ReduxSagaTester({
      initialState: { lodes: { examples, declarations } },
      reducers: {
        lodes: lodesSlice.reducer,
      },
    });
    sagaTester.start(sagas.saga);
  });

  describe('initSaga', () => {
    const { initLodesAction, initLodesSuccessAction, initLodesFailureAction } =
      lodeActions;
    const examplesLodeUrl = 'https://foo.com/examples.json';
    const declarationsLodeUrl = 'https://foo.com/declarations.json';

    test('sends initLodesSuccessAction with examples and declarations on success', async () => {
      jest
        .spyOn(lodeUtils, 'getLoded')
        .mockResolvedValueOnce({ examples, declarations });

      sagaTester.dispatch(
        initLodesAction({ examplesLodeUrl, declarationsLodeUrl })
      );

      await sagaTester.waitFor('lodes/initLodesSuccessAction');
      const calledActions = sagaTester.getCalledActions();
      expect(calledActions).toHaveLength(2);
      expect(calledActions[0]).toEqual(
        initLodesAction({ examplesLodeUrl, declarationsLodeUrl })
      );
      expect(calledActions[1]).toEqual(
        initLodesSuccessAction({
          examples,
          declarations,
        })
      );
    });

    test('sends initLodesFailureAction on error', async () => {
      const error = new Error('boom');
      jest.spyOn(lodeUtils, 'getLoded').mockRejectedValueOnce(error);

      sagaTester.dispatch(
        initLodesAction({ examplesLodeUrl, declarationsLodeUrl })
      );

      await sagaTester.waitFor('lodes/initLodesFailureAction');
      const calledActions = sagaTester.getCalledActions();
      expect(calledActions).toHaveLength(2);
      expect(calledActions[0]).toEqual(
        initLodesAction({ examplesLodeUrl, declarationsLodeUrl })
      );
      expect(calledActions[1]).toEqual(initLodesFailureAction(error));
    });
  });
});
