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
import ReduxSagaTester from 'redux-saga-tester'
import { registerTestEnvAdaptor } from '../../test-utils'

import { EnvAdaptorConstants, getEnvAdaptor } from '../../utils'
import * as sagas from './sagas'
import { actions, defaultSettingsState, slice } from './slice'

describe('Settings Sagas', () => {
  let sagaTester: ReduxSagaTester<any>
  registerTestEnvAdaptor()

  beforeEach(() => {
    jest.resetAllMocks()
    sagaTester = new ReduxSagaTester({
      initialState: { settings: { sdkLanguage: 'Go' } },
      reducers: {
        settings: slice.reducer,
      },
    })
    localStorage.clear()
    sagaTester.start(sagas.saga)
  })

  describe('setSdkLanguageSaga', () => {
    const setSdkLanguageAction = actions.setSdkLanguageAction

    test('persists value sdkLanguage in localstorage', async () => {
      sagaTester.dispatch(setSdkLanguageAction({ sdkLanguage: 'Kotlin' }))
      await sagaTester.waitFor('settings/setSdkLanguageAction')
      const calledActions = sagaTester.getCalledActions()
      expect(calledActions).toHaveLength(1)
      expect(calledActions[0]).toEqual(
        setSdkLanguageAction({
          sdkLanguage: 'Kotlin',
        })
      )
      expect(localStorage.setItem).toHaveBeenLastCalledWith(
        EnvAdaptorConstants.LOCALSTORAGE_SETTINGS_KEY,
        JSON.stringify({ sdkLanguage: 'Kotlin' })
      )
    })
  })

  describe('initSaga', () => {
    const { initAction, initSuccessAction, initFailureAction } = actions

    test('sends initSuccess action with default language on success if no persisted language is found', async () => {
      sagaTester.dispatch(initAction())
      await sagaTester.waitFor('settings/initSuccessAction')
      const calledActions = sagaTester.getCalledActions()
      expect(calledActions).toHaveLength(2)
      expect(calledActions[0]).toEqual(initAction())
      expect(calledActions[1]).toEqual(
        initSuccessAction({
          sdkLanguage: defaultSettingsState.sdkLanguage,
        })
      )
    })

    test('sends initSuccess action with persisted language on success', async () => {
      jest
        .spyOn(getEnvAdaptor(), 'localStorageGetItem')
        .mockResolvedValueOnce(JSON.stringify({ sdkLanguage: 'Go' }))

      sagaTester.dispatch(initAction())
      await sagaTester.waitFor('settings/initSuccessAction')
      const calledActions = sagaTester.getCalledActions()
      expect(calledActions).toHaveLength(2)
      expect(calledActions[0]).toEqual(initAction())
      expect(calledActions[1]).toEqual(
        initSuccessAction({
          sdkLanguage: 'Go',
        })
      )
    })

    test('sends initFailure action on error', async () => {
      const error = new Error('boom')
      jest
        .spyOn(getEnvAdaptor(), 'localStorageGetItem')
        .mockRejectedValueOnce(error)

      sagaTester.dispatch(initAction())
      await sagaTester.waitFor('settings/initFailureAction')
      const calledActions = sagaTester.getCalledActions()
      expect(calledActions).toHaveLength(2)
      expect(calledActions[0]).toEqual(initAction())
      expect(calledActions[1]).toEqual(initFailureAction(error))
    })
  })
})
