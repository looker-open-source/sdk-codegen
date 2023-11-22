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

import type { ChattyHostConnection } from '@looker/chatty'
import type { Looker40SDK } from '@looker/sdk'
import { MountPoint, ExtensionNotificationType } from '../connect/types'
import { ExtensionHostApiImpl } from '../connect/extension_host_api'
import { LookerExtensionSDK } from './extension_sdk'
import { LookerExtensionSDK40 } from './extension_sdk_40'

describe('extension_sdk tests', () => {
  let chattyHost: ChattyHostConnection
  let sendAndReceiveSpy: jest.SpyInstance
  let sendSpy: jest.SpyInstance

  const getAllConnectionPayload = (
    agentTag = 'TS-SDK',
    apiVersion = '4.0'
  ) => ({
    payload: {
      body: null,
      httpMethod: 'GET',
      options: {
        agentTag,
        base_url: '',
        timeout: 120,
        verify_ssl: true,
      },
      params: {
        fields: undefined,
      },
      path: '/connections',
      authenticator: undefined,
      apiVersion,
    },
    type: 'INVOKE_CORE_SDK',
  })

  beforeEach(() => {
    chattyHost = {
      send: (_eventName: string, ..._payload: any[]) => {
        // noop
      },
      sendAndReceive: async (_eventName: string, ..._payload: any[]) =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve(['ss'])
          })
        }),
    } as ChattyHostConnection
    sendAndReceiveSpy = jest.spyOn(chattyHost, 'sendAndReceive')
    sendSpy = jest.spyOn(chattyHost, 'send')
  })

  afterEach(() => {
    sendAndReceiveSpy.mockReset()
    sendSpy.mockReset()
  })

  const createHostApi = () => {
    const initializedCallback = jest.fn()
    const hostApi = new ExtensionHostApiImpl({
      chattyHost,
      initializedCallback,
    })

    hostApi.handleNotification({
      type: ExtensionNotificationType.INITIALIZE,
      payload: {
        extensionDashboardTileEnabled: false,
        extensionId: 'a::b',
        route: '/sandbox',
        lookerVersion: '6.25.0',
        mountPoint: MountPoint.standalone,
      },
    })

    return hostApi
  }

  it('creates client', (done) => {
    const sdk: Looker40SDK = LookerExtensionSDK.createClient(createHostApi())
    expect(sdk).toBeDefined()
    sdk
      .all_connections()
      .then(() => {
        expect(sendAndReceiveSpy).toHaveBeenCalledWith(
          'EXTENSION_API_REQUEST',
          getAllConnectionPayload()
        )
        done()
      })
      .catch((error: any) => {
        console.error(error)
        done.fail()
      })
  })

  it('creates 40 client', (done) => {
    const sdk = LookerExtensionSDK.create40Client(createHostApi())
    expect(sdk).toBeDefined()
    sdk.all_connections().then(() => {
      expect(sendAndReceiveSpy).toHaveBeenCalledWith(
        'EXTENSION_API_REQUEST',
        getAllConnectionPayload('TS-SDK', '4.0')
      )
      done()
    })
  })

  it('creates exclusive 40 client', (done) => {
    const sdk = LookerExtensionSDK40.createClient(createHostApi())
    expect(sdk).toBeDefined()
    sdk.all_connections().then(() => {
      expect(sendAndReceiveSpy).toHaveBeenCalledWith(
        'EXTENSION_API_REQUEST',
        getAllConnectionPayload('TS-SDK', '4.0')
      )
      done()
    })
  })
})
