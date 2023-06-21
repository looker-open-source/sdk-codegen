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

import { validateUrl, getVersions } from '../utils'
import * as sagas from './sagas'
import type { OAuthFormState, SaveConfigPayload } from './slice'
import {
  OAuthFormActions,
  OAuthFormSlice,
  defaultOAuthFormState,
} from './slice'
import { registerTestEnvAdaptor } from '@looker/extension-utils'

jest.mock('../utils', () => ({
  __esModule: true,
  ...jest.requireActual('../utils'),
  getVersions: jest.fn(),
}))

const getReduxSagaTester = (overrides?: Partial<OAuthFormState>) => {
  return new ReduxSagaTester({
    initialState: {
      [OAuthFormSlice.name]: {
        ...defaultOAuthFormState,
        ...overrides,
      },
    },
    reducers: {
      [OAuthFormSlice.name]: OAuthFormSlice.reducer,
    },
  })
}

const validUrl = 'https://validUrl'

const mockedVersionRes = {
  looker_release_version: '23.4.30',
  current_version: {
    version: '4.0',
    full_version: '4.0.23.4',
    status: 'current',
    swagger_url: 'https://validUrl/api/4.0/swagger.json',
  },
  supported_versions: [
    {
      version: '3.0',
      full_version: '3.0.0',
      status: 'legacy',
      swagger_url: 'https://validUrl/api/3.0/swagger.json',
    },
    {
      version: '3.1',
      full_version: '3.1.0',
      status: 'legacy',
      swagger_url: 'https://validUrl/api/3.1/swagger.json',
    },
    {
      version: '4.0',
      full_version: '4.0.23.4',
      status: 'current',
      swagger_url: 'https://validUrl/api/4.0/swagger.json',
    },
  ],
  api_server_url: validUrl,
  web_server_url: validUrl,
}

describe('OAuth Form Sagas', () => {
  let sagaTester: ReduxSagaTester<any>
  registerTestEnvAdaptor()
  const configKey = 'configKey'

  sagaTester = getReduxSagaTester()
  sagaTester.start(sagas.saga)

  afterEach(() => {
    jest.resetAllMocks()
    sagaTester = getReduxSagaTester()
    localStorage.clear()
    sagaTester.start(sagas.saga)
  })

  describe('init Saga', () => {
    const { initAction, initSuccessAction } = OAuthFormActions

    test('sends initSuccess action with defaults on success if no savedConfig is found', async () => {
      const getLocalStorageSpy = jest.spyOn(window.localStorage, 'getItem')

      sagaTester.dispatch(initAction(configKey))
      await sagaTester.waitFor(`${OAuthFormSlice.name}/initSuccessAction`)
      const calledActions = sagaTester.getCalledActions()
      expect(getLocalStorageSpy).toHaveBeenCalledWith(configKey)

      expect(calledActions).toHaveLength(2)
      expect(calledActions[0]).toEqual(initAction(configKey))
      expect(calledActions[1]).toEqual(
        initSuccessAction({
          base_url: '',
          looker_url: '',
        })
      )
    })

    test('sends initSuccess action if savedConfig in localstorage', async () => {
      const savedConfig = {
        base_url: validUrl,
        looker_url: validUrl,
      }

      const getLocalStorageSpy = jest
        .spyOn(window.localStorage, 'getItem')
        .mockReturnValue(JSON.stringify(savedConfig))

      sagaTester.dispatch(initAction(configKey))
      await sagaTester.waitFor(`${OAuthFormSlice.name}/initSuccessAction`)
      const calledActions = sagaTester.getCalledActions()
      expect(getLocalStorageSpy).toHaveBeenCalledWith(configKey)

      expect(calledActions).toHaveLength(2)
      expect(calledActions[0]).toEqual(initAction(configKey))
      expect(calledActions[1]).toEqual(initSuccessAction(savedConfig))
    })
  })

  describe('setUrl Saga', () => {
    const { setUrlAction, setUrlActionSuccess, updateValidationMessages } =
      OAuthFormActions

    test('it does not add a validation error if valid url', async () => {
      const updateUrlPayload = {
        name: 'baseUrl',
        value: validUrl,
      }
      sagaTester.dispatch(setUrlAction(updateUrlPayload))

      await sagaTester.waitFor(`${OAuthFormSlice.name}/setUrlAction`)
      const calledActions = sagaTester.getCalledActions()

      expect(calledActions).toHaveLength(3)
      expect(calledActions[0]).toEqual(setUrlAction(updateUrlPayload))
      expect(calledActions[1]).toEqual(
        updateValidationMessages({
          elementName: updateUrlPayload.name,
          newMessage: null,
        })
      )
      const validatedUrl = validateUrl(updateUrlPayload.value)
      expect(calledActions[2]).toEqual(setUrlActionSuccess(validatedUrl))
    })

    test('it adds a validation error if non-valid url', async () => {
      const updateUrlPayload = {
        name: 'baseUrl',
        value: 'badUrl',
      }
      sagaTester.dispatch(setUrlAction(updateUrlPayload))

      await sagaTester.waitFor(`${OAuthFormSlice.name}/setUrlAction`)
      const calledActions = sagaTester.getCalledActions()

      expect(calledActions).toHaveLength(3)
      expect(calledActions[0]).toEqual(setUrlAction(updateUrlPayload))
      expect(calledActions[1]).toEqual(
        updateValidationMessages({
          elementName: updateUrlPayload.name,
          newMessage: {
            message: `${updateUrlPayload.value} is not a valid url`,
            type: 'error',
          },
        })
      )
      expect(calledActions[2]).toEqual(
        setUrlActionSuccess(updateUrlPayload.value)
      )
    })
  })

  describe('clearConfig Saga', () => {
    const setHasConfig = jest.fn()
    const removeItemSpy = jest.spyOn(window.localStorage, 'removeItem')

    const {
      clearConfigAction,
      clearConfigActionSuccess,
      updateMessageBarAction,
    } = OAuthFormActions

    test('clears config when not authenticated', async () => {
      const clearConfigActionPayload = {
        configKey,
        isAuthenticated: false,
      }
      sagaTester.dispatch(clearConfigAction(clearConfigActionPayload))

      await sagaTester.waitFor(`${OAuthFormSlice.name}/clearConfigAction`)
      const calledActions = sagaTester.getCalledActions()

      expect(calledActions).toHaveLength(2)
      expect(calledActions[0]).toEqual(
        clearConfigAction(clearConfigActionPayload)
      )
      expect(calledActions[1]).toEqual(clearConfigActionSuccess())

      expect(removeItemSpy).toHaveBeenCalledWith(configKey)
    })

    test('clears config and updates message bar if authenticated', async () => {
      const clearConfigActionPayload = {
        configKey,
        isAuthenticated: true,
      }
      sagaTester.dispatch(clearConfigAction(clearConfigActionPayload))

      await sagaTester.waitFor(`${OAuthFormSlice.name}/clearConfigAction`)
      const calledActions = sagaTester.getCalledActions()

      expect(calledActions).toHaveLength(3)
      expect(calledActions[0]).toEqual(
        clearConfigAction(clearConfigActionPayload)
      )
      expect(calledActions[1]).toEqual(
        updateMessageBarAction({
          text: 'Please reload the browser page to log out',
          intent: 'warn',
        })
      )
      expect(calledActions[2]).toEqual(clearConfigActionSuccess())

      expect(removeItemSpy).toHaveBeenCalledWith(configKey)
    })

    test('clears config, triggers setHasConfig callback if provided', async () => {
      const clearConfigActionPayload = {
        configKey,
        setHasConfig,
        isAuthenticated: false,
      }
      sagaTester.dispatch(clearConfigAction(clearConfigActionPayload))

      await sagaTester.waitFor(`${OAuthFormSlice.name}/clearConfigAction`)
      const calledActions = sagaTester.getCalledActions()

      expect(calledActions).toHaveLength(2)
      expect(calledActions[0]).toEqual(
        clearConfigAction(clearConfigActionPayload)
      )
      expect(calledActions[1]).toEqual(clearConfigActionSuccess())
      expect(setHasConfig).toHaveBeenCalledWith(false)
      expect(removeItemSpy).toHaveBeenCalledWith(configKey)
    })
  })

  describe('verify Saga', () => {
    const {
      verifyConfigAction,
      clearMessageBarAction,
      verifyConfigActionFailure,
      verifyConfigActionSuccess,
    } = OAuthFormActions

    test('returns success with valid url', async () => {
      ;(getVersions as jest.Mock).mockResolvedValueOnce(mockedVersionRes)

      sagaTester = getReduxSagaTester({
        apiServerUrl: validUrl,
      })
      sagaTester.start(sagas.saga)

      sagaTester.dispatch(verifyConfigAction())
      await sagaTester.waitFor(`${OAuthFormSlice.name}/verifyConfigAction`)
      const calledActions = sagaTester.getCalledActions()

      expect(calledActions).toHaveLength(3)
      expect(calledActions[0]).toEqual(verifyConfigAction())
      expect(calledActions[1]).toEqual(clearMessageBarAction())
      expect(calledActions[2]).toEqual(
        verifyConfigActionSuccess(mockedVersionRes.web_server_url)
      )
    })

    test('returns error message with invalid url', async () => {
      ;(getVersions as jest.Mock).mockRejectedValueOnce(new Error('Boom'))

      sagaTester = getReduxSagaTester({
        apiServerUrl: validUrl,
      })
      sagaTester.start(sagas.saga)

      sagaTester.dispatch(verifyConfigAction())
      await sagaTester.waitFor(`${OAuthFormSlice.name}/verifyConfigAction`)
      const calledActions = sagaTester.getCalledActions()

      expect(calledActions).toHaveLength(3)
      expect(calledActions[0]).toEqual(verifyConfigAction())
      expect(calledActions[1]).toEqual(clearMessageBarAction())
      expect(calledActions[2]).toEqual(verifyConfigActionFailure('Boom'))
    })
  })

  describe('saveConfig Saga', () => {
    const {
      saveConfigAction,
      saveConfigActionSuccess,
      clearMessageBarAction,
      verifyConfigActionFailure,
    } = OAuthFormActions
    const saveConfigPayload: SaveConfigPayload = {
      configKey,
      client_id: 'clientId',
      redirect_uri: 'redirectUri',
    }

    test('saves to local storage', async () => {
      const setLocalStorageSpy = jest.spyOn(window.localStorage, 'setItem')
      ;(getVersions as jest.Mock).mockResolvedValueOnce(mockedVersionRes)

      sagaTester.dispatch(saveConfigAction(saveConfigPayload))
      await sagaTester.waitFor(`${OAuthFormSlice.name}/saveConfigAction`)
      const calledActions = sagaTester.getCalledActions()

      expect(setLocalStorageSpy).toHaveBeenCalledWith(
        configKey,
        JSON.stringify({
          base_url: mockedVersionRes.api_server_url,
          looker_url: mockedVersionRes.web_server_url,
          client_id: saveConfigPayload.client_id,
          redirect_uri: saveConfigPayload.redirect_uri,
        })
      )

      expect(calledActions).toHaveLength(3)
      expect(calledActions[0]).toEqual(saveConfigAction(saveConfigPayload))
      expect(calledActions[1]).toEqual(clearMessageBarAction())
      expect(calledActions[2]).toEqual(
        saveConfigActionSuccess({
          base_url: mockedVersionRes.api_server_url,
          looker_url: mockedVersionRes.web_server_url,
        })
      )
    })

    test('returns error message if validate fails before save', async () => {
      ;(getVersions as jest.Mock).mockRejectedValueOnce(new Error('Boom'))

      sagaTester = getReduxSagaTester({
        apiServerUrl: validUrl,
      })
      sagaTester.start(sagas.saga)

      sagaTester.dispatch(saveConfigAction(saveConfigPayload))
      await sagaTester.waitFor(`${OAuthFormSlice.name}/saveConfigAction`)
      const calledActions = sagaTester.getCalledActions()

      expect(calledActions).toHaveLength(3)
      expect(calledActions[0]).toEqual(saveConfigAction(saveConfigPayload))
      expect(calledActions[1]).toEqual(clearMessageBarAction())
      expect(calledActions[2]).toEqual(verifyConfigActionFailure('Boom'))
    })
  })
})
