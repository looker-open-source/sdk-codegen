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
import intersects from 'semver/ranges/intersects'
import { FetchProxyImpl } from './fetch_proxy'
import type {
  ExtensionInitializationResponse,
  ExtensionHostApi,
  ExtensionHostApiConfiguration,
  ExtensionNotification,
  FetchCustomParameters,
  FetchResponseBodyType,
  LookerHostData,
  ApiVersion,
  RouteChangeData,
} from './types'
import {
  ExtensionEvent,
  ExtensionNotificationType,
  ExtensionRequestType,
} from './types'

export const EXTENSION_SDK_VERSION = '0.10.5'

export class ExtensionHostApiImpl implements ExtensionHostApi {
  private _configuration: ExtensionHostApiConfiguration
  private _lookerHostData?: Readonly<LookerHostData>
  private chattyHost: ChattyHostConnection
  private setInitialRoute?: (route: string, routeState?: any) => void
  private hostChangedRoute?: (route: string, routeState?: any) => void
  private contextData?: string

  constructor(configuration: ExtensionHostApiConfiguration) {
    this._configuration = configuration
    const { chattyHost, setInitialRoute, hostChangedRoute } =
      this._configuration
    this.chattyHost = chattyHost
    this.setInitialRoute = setInitialRoute
    this.hostChangedRoute = hostChangedRoute
  }

  get lookerHostData() {
    return this._lookerHostData
  }

  handleNotification(
    message?: ExtensionNotification
  ): ExtensionInitializationResponse | undefined {
    const { type, payload } = message || {}
    switch (type) {
      case ExtensionNotificationType.ROUTE_CHANGED:
        if (this.hostChangedRoute && payload) {
          const { route, routeState } = payload as RouteChangeData
          if (route) {
            this.hostChangedRoute(route, routeState)
          }
        }
        return undefined
      case ExtensionNotificationType.INITIALIZE: {
        this._lookerHostData = payload as LookerHostData
        if (this._lookerHostData) {
          this.contextData = this._lookerHostData.contextData
        }
        let errorMessage
        if (
          this._configuration.requiredLookerVersion &&
          this._lookerHostData &&
          this._lookerHostData.lookerVersion
        ) {
          errorMessage = this.verifyLookerVersion(
            this._configuration.requiredLookerVersion
          )
          if (errorMessage) {
            console.error(errorMessage)
          }
        }
        if (this.setInitialRoute && payload) {
          const { route, routeState } = payload as LookerHostData
          if (route) {
            this.setInitialRoute(route, routeState)
          }
        }
        return {
          extensionSdkVersion: EXTENSION_SDK_VERSION,
          errorMessage,
        }
      }
      default:
        console.error('Unrecognized extension notification', message)
        throw new Error(`Unrecognized extension notification type ${type}`)
    }
  }

  createSecretKeyTag(keyName: string): string {
    const errorMessage = this.verifyLookerVersion('>=7.11')
    if (errorMessage) {
      throw new Error(errorMessage)
    }
    if (!keyName.match(/^[A-Za-z0-9_.]+$/)) {
      throw new Error('Unsupported characters in key name')
    }
    return `{{${this._lookerHostData!.extensionId.replace(
      /::|-/g,
      '_'
    )}_${keyName}}}`
  }

  async verifyHostConnection() {
    return this.sendAndReceive(ExtensionRequestType.VERIFY_HOST)
  }

  async invokeCoreSdk(
    httpMethod: string,
    path: string,
    params?: any,
    body?: any,
    authenticator?: any,
    options?: any,
    apiVersion?: ApiVersion
  ): Promise<any> {
    return this.sendAndReceive(ExtensionRequestType.INVOKE_CORE_SDK, {
      httpMethod,
      path,
      params,
      body,
      authenticator,
      options,
      apiVersion,
    })
  }

  async invokeCoreSdkRaw(
    httpMethod: string,
    path: string,
    params?: any,
    body?: any,
    apiVersion?: ApiVersion
  ): Promise<any> {
    return this.sendAndReceive(ExtensionRequestType.RAW_INVOKE_CORE_SDK, {
      httpMethod,
      path,
      params,
      body,
      apiVersion,
    })
  }

  updateTitle(title: string) {
    this.send(ExtensionRequestType.UPDATE_TITLE, { title })
  }

  updateLocation(url: string, state?: any, target?: string) {
    this.send(ExtensionRequestType.UPDATE_LOCATION, { url, state, target })
  }

  spartanLogout() {
    this.send(ExtensionRequestType.SPARTAN_LOGOUT)
  }

  openBrowserWindow(url: string, target?: string) {
    this.send(ExtensionRequestType.UPDATE_LOCATION, {
      url,
      undefined,
      target: target || '_blank',
    })
  }

  closeHostPopovers() {
    this.send(ExtensionRequestType.CLOSE_HOST_POPOVERS)
  }

  clientRouteChanged(route: string, routeState?: any) {
    this.send(ExtensionRequestType.ROUTE_CHANGED, {
      route,
      routeState,
    })
  }

  async localStorageSetItem(name: string, value = ''): Promise<boolean> {
    if (this._lookerHostData && !this._lookerHostData.lookerVersion) {
      return Promise.reject(
        new Error(
          'localStorageSetItem not supported by the current Looker host'
        )
      )
    }
    return this.sendAndReceive(ExtensionRequestType.LOCAL_STORAGE, {
      type: 'set',
      name,
      value,
    })
  }

  async localStorageGetItem(name: string): Promise<string | null> {
    if (this._lookerHostData && !this._lookerHostData.lookerVersion) {
      return Promise.reject(
        new Error(
          'localStorageGetItem not supported by the current Looker host'
        )
      )
    }
    return this.sendAndReceive(ExtensionRequestType.LOCAL_STORAGE, {
      type: 'get',
      name,
    })
  }

  async localStorageRemoveItem(name: string): Promise<boolean> {
    if (this._lookerHostData && !this._lookerHostData.lookerVersion) {
      return Promise.reject(
        new Error(
          'localStorageRemoveItem not supported by the current Looker host'
        )
      )
    }
    return this.sendAndReceive(ExtensionRequestType.LOCAL_STORAGE, {
      type: 'remove',
      name,
    })
  }

  async clipboardWrite(value: string): Promise<void> {
    const errorMessage = this.verifyLookerVersion('>=21.7')
    if (errorMessage) {
      return Promise.reject(new Error(errorMessage))
    }
    return this.sendAndReceive(ExtensionRequestType.CLIPBOARD, {
      type: 'write',
      value,
    })
  }

  async userAttributeSetItem(name: string, value = ''): Promise<boolean> {
    // User attributes added in Looker version 7.13, updated in 7.15
    const errorMessage = this.verifyLookerVersion('>=7.15')
    if (errorMessage) {
      return Promise.reject(new Error(errorMessage))
    }
    return this.sendAndReceive(ExtensionRequestType.USER_ATTRIBUTE, {
      type: 'set',
      name,
      value,
    })
  }

  async userAttributeGetItem(name: string): Promise<string | null> {
    // User attributes added in Looker version 7.13, updated in 7.15
    const errorMessage = this.verifyLookerVersion('>=7.15')
    if (errorMessage) {
      return Promise.reject(new Error(errorMessage))
    }
    return this.sendAndReceive(ExtensionRequestType.USER_ATTRIBUTE, {
      type: 'get',
      name,
    })
  }

  async userAttributeResetItem(name: string): Promise<void> {
    // User attributes added in Looker version 7.13, updated in 7.15
    const errorMessage = this.verifyLookerVersion('>=7.15')
    if (errorMessage) {
      return Promise.reject(new Error(errorMessage))
    }
    return this.sendAndReceive(ExtensionRequestType.USER_ATTRIBUTE, {
      type: 'reset',
      name,
    })
  }

  getContextData() {
    const errorMessage = this.verifyLookerVersion('>=7.13')
    if (errorMessage) {
      throw new Error(errorMessage)
    }
    if (this.contextData) {
      return JSON.parse(this.contextData)
    } else {
      return undefined
    }
  }

  async saveContextData(context: any): Promise<any> {
    const errorMessage = this.verifyLookerVersion('>=7.13')
    if (errorMessage) {
      return Promise.reject(new Error(errorMessage))
    }
    let contextData: string | undefined
    if (context) {
      try {
        contextData = JSON.stringify(context)
      } catch (err) {
        return Promise.reject(new Error('context cannot be serialized'))
      }
    } else {
      contextData = undefined
    }
    await this.sendAndReceive(ExtensionRequestType.CONTEXT_DATA, {
      type: 'save',
      contextData,
    })
    return this.getContextData()
  }

  async refreshContextData(): Promise<any> {
    const errorMessage = this.verifyLookerVersion('>=7.13')
    if (errorMessage) {
      return Promise.reject(new Error(errorMessage))
    }
    this.contextData = await this.sendAndReceive(
      ExtensionRequestType.CONTEXT_DATA,
      {
        type: 'refresh',
      }
    )
    return this.getContextData()
  }

  track(name: string, trackAction: string, attributes?: Record<string, any>) {
    this.send(ExtensionRequestType.TRACK_ACTION, {
      name,
      trackAction,
      attributes,
    })
  }

  error(errorEvent: ErrorEvent) {
    if (this._lookerHostData) {
      const { message, filename, lineno, colno, error } = errorEvent || {}
      this.send(ExtensionRequestType.ERROR_EVENT, {
        message,
        filename,
        lineno,
        colno,
        error: error && error.toString ? error.toString() : error,
      })
    } else {
      console.error(
        'Unhandled error but Looker host connection not established',
        errorEvent
      )
    }
  }

  unloaded() {
    this.send(ExtensionRequestType.EXTENSION_UNLOADED, {})
  }

  createFetchProxy(
    baseUrl?: string,
    init?: FetchCustomParameters,
    responseBodyType?: FetchResponseBodyType
  ) {
    return new FetchProxyImpl(this, baseUrl, init, responseBodyType)
  }

  async fetchProxy(
    resource: string,
    init?: FetchCustomParameters,
    responseBodyType?: FetchResponseBodyType
  ) {
    // Fetch proxy support added to Looker 7.9
    const errorMessage = this.verifyLookerVersion('>=7.9')
    if (errorMessage) {
      return Promise.reject(new Error(errorMessage))
    }
    return this.sendAndReceive(ExtensionRequestType.INVOKE_EXTERNAL_API, {
      type: 'fetch',
      payload: {
        resource,
        init,
        responseBodyType,
      },
    })
  }

  async serverProxy(
    resource: string,
    init?: FetchCustomParameters,
    responseBodyType?: FetchResponseBodyType
  ) {
    // Server proxy support added to Looker 7.11
    const errorMessage = this.verifyLookerVersion('>=7.11')
    if (errorMessage) {
      return Promise.reject(new Error(errorMessage))
    }
    return this.sendAndReceive(ExtensionRequestType.INVOKE_EXTERNAL_API, {
      type: 'server-proxy',
      payload: {
        resource,
        init,
        responseBodyType,
      },
    })
  }

  async oauth2Authenticate(
    authEndpoint: string,
    authParameters: Record<string, string>,
    httpMethod = 'POST'
  ) {
    // oauth2Authenticate proxy support added to Looker 7.9
    let errorMessage = this.verifyLookerVersion('>=7.9')
    if (errorMessage) {
      return Promise.reject(new Error(errorMessage))
    }
    errorMessage = this.validateAuthParameters(authParameters)
    if (errorMessage) {
      return Promise.reject(new Error(errorMessage))
    }
    return this.sendAndReceive(
      ExtensionRequestType.INVOKE_EXTERNAL_API,
      {
        type: 'oauth2_authenticate',
        payload: {
          authEndpoint,
          authParameters,
          httpMethod,
        },
      },
      // Adding the signal disables the default timeout
      new AbortController().signal
    )
  }

  async oauth2ExchangeCodeForToken(
    authEndpoint: string,
    authParameters: Record<string, string>
  ) {
    const errorMessage = this.verifyLookerVersion('>=7.11')
    if (errorMessage) {
      return Promise.reject(new Error(errorMessage))
    }
    return this.sendAndReceive(ExtensionRequestType.INVOKE_EXTERNAL_API, {
      type: 'oauth2_exchange_code',
      payload: {
        authEndpoint,
        authParameters,
      },
    })
  }

  private async sendAndReceive(
    type: string,
    payload?: any,
    signal?: AbortSignal
  ): Promise<any> {
    if (!this._lookerHostData) {
      return Promise.reject(new Error('Looker host connection not established'))
    }
    const messagePayload = {
      type,
      payload,
    }
    const chattyPayload = signal
      ? [messagePayload, { signal }]
      : [messagePayload]
    return this.chattyHost
      .sendAndReceive(ExtensionEvent.EXTENSION_API_REQUEST, ...chattyPayload)
      .then((values) => values[0])
  }

  private send(type: string, payload?: any) {
    if (!this._lookerHostData) {
      throw new Error('Looker host connection not established')
    }
    this.chattyHost.send(ExtensionEvent.EXTENSION_API_REQUEST, {
      type,
      payload,
    })
  }

  private verifyLookerVersion(version: string): string | undefined {
    // Default version to 7.0 as that's the first Looker version that officially
    // supported extensions. Version 6.24 has some support for extensions but most
    // likely will fail before reaching this point
    const lookerVersion = this._lookerHostData
      ? this._lookerHostData.lookerVersion || '7.0'
      : '7.0'
    if (!this._lookerHostData || !intersects(version, lookerVersion, true)) {
      return `Extension requires Looker version ${version}, got ${lookerVersion}`
    }
    return undefined
  }

  private validateAuthParameters(authParameters: Record<string, string>) {
    if (!authParameters.client_id) {
      return 'client_id missing'
    }
    if (authParameters.redirect_uri) {
      return 'redirect_uri must NOT be included'
    }
    if (
      authParameters.response_type !== 'token' &&
      authParameters.response_type !== 'id_token' &&
      authParameters.response_type !== 'code'
    ) {
      return `invalid response_type, must be token, id_token or code, ${authParameters.response_type}`
    }
    return undefined
  }
}
