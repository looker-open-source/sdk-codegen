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
import ReduxSagaTester from 'redux-saga-tester'
import {
  createFactory,
  destroyFactory,
  registerThemeService,
  getThemeService,
} from '@looker/embed-services'
import { Looker40SDK as LookerSDK } from '@looker/sdk'
import type { ITheme } from '@looker/sdk'
import type { IAPIMethods } from '@looker/sdk-rtl'
import { session } from '../../test-utils'
import {
  defaultThemesState,
  themeActions,
  THEMES_SLICE_NAME,
  themesSlice,
} from './slice'
import * as sagas from './sagas'

describe('SelectTheme sagas', () => {
  let sagaTester: ReduxSagaTester<any>
  const sdk: IAPIMethods = new LookerSDK(session)

  beforeEach(() => {
    createFactory(sdk)
    sagaTester = new ReduxSagaTester({
      initialState: { [THEMES_SLICE_NAME]: defaultThemesState },
      reducers: {
        [THEMES_SLICE_NAME]: themesSlice.reducer,
      },
    })
    sagaTester.start(sagas.saga)
  })

  describe('initSaga', () => {
    const { initAction, initSuccessAction, setFailureAction } = themeActions

    it('registers theme service and sends initSuccessAction on success', async () => {
      expect(getThemeService).toThrow('Service ThemeService not found')

      sagaTester.dispatch(initAction())

      await sagaTester.waitFor('themes/initSuccessAction')
      expect(getThemeService).not.toThrow()
      const calledActions = sagaTester.getCalledActions()
      expect(calledActions).toHaveLength(2)
      expect(calledActions[0]).toEqual(initAction())
      expect(calledActions[1]).toEqual(initSuccessAction())
    })

    it('sends setFailureAction on error', async () => {
      // destroy the factory to cause initAction to fail
      destroyFactory()

      sagaTester.dispatch(initAction())

      await sagaTester.waitFor('themes/setFailureAction')
      const calledActions = sagaTester.getCalledActions()
      expect(calledActions).toHaveLength(2)
      expect(calledActions[0]).toEqual(initAction())
      expect(calledActions[1]).toEqual(
        setFailureAction({ error: 'Factory must be created with an SDK.' })
      )
    })
  })

  describe('loadThemeDataSaga', () => {
    const {
      loadThemeDataAction,
      loadThemeDataSuccessAction,
      setFailureAction,
    } = themeActions
    const lookerTheme = { id: '1', name: 'Looker' } as ITheme
    const defaultTheme = { id: '2', name: 'custom_theme' } as ITheme
    const anotherTheme = { id: '3', name: 'custom_theme_1' } as ITheme
    let loadSpy: jest.SpyInstance

    const { location } = window

    beforeEach(() => {
      delete (window as any).location
    })

    afterEach(() => {
      window.location = location
    })

    test.each`
      scenario                                 | href                                                        | selectedTheme
      ${`no theme override param is present`}  | ${`https://example.com/dashboards/42`}                      | ${defaultTheme}
      ${`theme override param is present`}     | ${`https://example.com/dashboards/42?theme=custom_theme_1`} | ${anotherTheme}
      ${`theme override param value is bogus`} | ${`https://example.com/dashboards/42?theme=bogus`}          | ${defaultTheme}
    `(
      'sends a loadThemeDataSuccessAction on success with correct selectedTheme when $scenario',
      async ({ href, selectedTheme }) => {
        registerThemeService()
        const service = getThemeService()
        service.items = [lookerTheme, defaultTheme, anotherTheme]
        service.defaultTheme = defaultTheme
        loadSpy = jest.spyOn(service, 'load').mockResolvedValueOnce(service)
        window.location = {
          href: href,
        } as Location

        sagaTester.dispatch(loadThemeDataAction())

        await sagaTester.waitFor('themes/loadThemeDataSuccessAction')
        const calledActions = sagaTester.getCalledActions()
        expect(calledActions).toHaveLength(2)
        expect(calledActions[0]).toEqual(loadThemeDataAction())
        expect(loadSpy).toHaveBeenCalledTimes(1)
        expect(calledActions[1]).toEqual(
          loadThemeDataSuccessAction({
            themes: service.items,
            defaultTheme: service.defaultTheme!,
            selectedTheme,
          })
        )
      }
    )

    it('sends setFailureAction on error', async () => {
      destroyFactory()

      sagaTester.dispatch(loadThemeDataAction())

      await sagaTester.waitFor('themes/setFailureAction')
      const calledActions = sagaTester.getCalledActions()
      expect(calledActions).toHaveLength(2)
      expect(calledActions[0]).toEqual(loadThemeDataAction())
      expect(calledActions[1]).toEqual(
        setFailureAction({ error: 'Factory must be created with an SDK.' })
      )
    })
  })

  describe('getThemesSaga', () => {
    const { getThemesAction, getThemesSuccessAction, setFailureAction } =
      themeActions

    it('sends getThemesSuccessAction on success', async () => {
      registerThemeService()
      const service = getThemeService()
      const getAllSpy = jest
        .spyOn(service, 'getAll')
        .mockResolvedValueOnce(service)

      sagaTester.dispatch(getThemesAction())

      await sagaTester.waitFor('themes/getThemesSuccessAction')
      const calledActions = sagaTester.getCalledActions()
      expect(calledActions).toHaveLength(2)
      expect(calledActions[0]).toEqual(getThemesAction())
      expect(getAllSpy).toHaveBeenCalledTimes(1)
      expect(calledActions[1]).toEqual(
        getThemesSuccessAction({ themes: service.items })
      )
    })

    it('sends setFailureAction on error', async () => {
      destroyFactory()

      sagaTester.dispatch(getThemesAction())

      await sagaTester.waitFor('themes/setFailureAction')
      const calledActions = sagaTester.getCalledActions()
      expect(calledActions).toHaveLength(2)
      expect(calledActions[0]).toEqual(getThemesAction())
      expect(calledActions[1]).toEqual(
        setFailureAction({ error: 'Factory must be created with an SDK.' })
      )
    })
  })

  describe('getDefaultThemeSaga', () => {
    const {
      getDefaultThemeAction,
      getDefaultThemeSuccessAction,
      setFailureAction,
    } = themeActions

    it('sends getDefaultThemeSuccessAction on success', async () => {
      registerThemeService()
      const service = getThemeService()
      const defaultTheme = { name: 'Looker', id: '1' } as ITheme
      const getDefaultThemeSpy = jest
        .spyOn(service, 'getDefaultTheme')
        .mockResolvedValueOnce(defaultTheme)

      sagaTester.dispatch(getDefaultThemeAction())

      await sagaTester.waitFor('themes/getDefaultThemeSuccessAction')
      const calledActions = sagaTester.getCalledActions()
      expect(calledActions).toHaveLength(2)
      expect(calledActions[0]).toEqual(getDefaultThemeAction())
      expect(getDefaultThemeSpy).toHaveBeenCalledTimes(1)
      expect(calledActions[1]).toEqual(
        getDefaultThemeSuccessAction({ defaultTheme })
      )
    })

    it('sends setFailureAction on error', async () => {
      destroyFactory()

      sagaTester.dispatch(getDefaultThemeAction())
      await sagaTester.waitFor('themes/setFailureAction')
      const calledActions = sagaTester.getCalledActions()
      expect(calledActions).toHaveLength(2)
      expect(calledActions[0]).toEqual(getDefaultThemeAction())
      expect(calledActions[1]).toEqual(
        setFailureAction({ error: 'Factory must be created with an SDK.' })
      )
    })
  })

  describe('selectThemeSaga', () => {
    const {
      refreshAction,
      refreshSuccessAction,
      selectThemeAction,
      selectThemeSuccessAction,
      setFailureAction,
    } = themeActions

    it('sends selectThemeSuccessAction on success', async () => {
      registerThemeService()
      const service = getThemeService()
      const selectedTheme = { name: 'Looker', id: '1' } as ITheme

      jest.spyOn(service, 'expired').mockReturnValue(false)
      const getSpy = jest
        .spyOn(service, 'get')
        .mockResolvedValueOnce(selectedTheme)
      jest.spyOn(service, 'getAll').mockResolvedValueOnce(service)
      jest
        .spyOn(service, 'getDefaultTheme')
        .mockResolvedValueOnce(selectedTheme)

      sagaTester.dispatch(selectThemeAction({ id: selectedTheme.id! }))

      await sagaTester.waitFor('themes/selectThemeSuccessAction')
      const calledActions = sagaTester.getCalledActions()
      expect(calledActions).toHaveLength(2)
      expect(calledActions[0]).toEqual(
        selectThemeAction({ id: selectedTheme.id! })
      )
      expect(getSpy).toHaveBeenCalledWith(selectedTheme.id)
      expect(calledActions[1]).toEqual(
        selectThemeSuccessAction({ selectedTheme })
      )
    })

    it('refreshes the store if cache has expired', async () => {
      registerThemeService()
      const service = getThemeService()
      const selectedTheme = { name: 'Looker', id: '1' } as ITheme

      jest.spyOn(service, 'expired').mockReturnValue(true)
      const getSpy = jest
        .spyOn(service, 'get')
        .mockResolvedValueOnce(selectedTheme)
      jest.spyOn(service, 'getAll').mockResolvedValueOnce(service)
      jest
        .spyOn(service, 'getDefaultTheme')
        .mockResolvedValueOnce(selectedTheme)

      sagaTester.dispatch(selectThemeAction({ id: selectedTheme.id! }))

      await sagaTester.waitFor('themes/selectThemeSuccessAction')
      const calledActions = sagaTester.getCalledActions()
      expect(calledActions).toHaveLength(4)
      expect(calledActions[0]).toEqual(
        selectThemeAction({ id: selectedTheme.id! })
      )
      expect(calledActions[1]).toEqual(refreshAction())
      expect(getSpy).toHaveBeenCalledWith(selectedTheme.id)
      expect(calledActions[2]).toEqual(
        selectThemeSuccessAction({ selectedTheme })
      )
      expect(calledActions[3]).toEqual(
        refreshSuccessAction({
          themes: service.items,
          defaultTheme: service.defaultTheme!,
        })
      )
    })

    it('sends setFailureAction on error', async () => {
      destroyFactory()

      sagaTester.dispatch(selectThemeAction({ id: 'foo' }))
      await sagaTester.waitFor('themes/setFailureAction')
      const calledActions = sagaTester.getCalledActions()
      expect(calledActions).toHaveLength(2)
      expect(calledActions[0]).toEqual(selectThemeAction({ id: 'foo' }))
      expect(calledActions[1]).toEqual(
        setFailureAction({ error: 'Factory must be created with an SDK.' })
      )
    })
  })
})
