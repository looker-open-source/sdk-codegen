/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2019 Looker Data Sciences, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import { IError } from '../sdk/models'
import {
  IRequestInit,
  ITransport,
  SDKResponse,
  sdkError,
  IAuthorizer,
} from './transport'
import { AuthToken } from './authToken'
import { NodeTransport } from './nodeTransport'
import { IApiSettingsIniFile } from './nodeSettings'
import { environmentPrefix } from './versions'

const strPost = 'POST'
const strDelete = 'DELETE'

const strLookerClientId = `${environmentPrefix}_CLIENT_ID`
const strLookerClientSecret = `${environmentPrefix}_CLIENT_SECRET`

/**
 * Same as the Looker API access token object
 */
interface IAccessToken {
  /**
   * Access Token used for API calls
   */
  access_token?: string;
  /**
   * Type of token
   */
  token_type?: string;

  /**
   * Number of seconds before the token expires
   */
  expires_in?: number;
}

export interface IAuthSession extends IAuthorizer {
  sudoId: string;

  // Authentication token
  getToken(): Promise<IAccessToken>;

  isSudo(): boolean;

  login(sudoId?: string | number): Promise<IAccessToken>;

  reset(): void;
}

export class NodeSession implements IAuthSession {
  _authToken: AuthToken = new AuthToken()
  _sudoToken: AuthToken = new AuthToken()
  sudoId: string = ''
  transport: ITransport

  constructor(public settings: IApiSettingsIniFile, transport?: ITransport) {
    this.settings = settings
    this.transport = transport || new NodeTransport(settings)
  }

  /**
   * Abstraction of AuthToken retrieval to support sudo mode
   */
  get activeToken() {
    if (this._sudoToken.access_token) {
      return this._sudoToken
    }
    return this._authToken
  }

  /**
   * Is there an active authentication token?
   */
  isAuthenticated() {
    const token = this.activeToken
    if (!(token && token.access_token)) return false
    return token.isActive()
  }

  /**
   * Add authentication data to the pending API request
   * @param init {IRequestInit} initialized API request properties
   *
   * @returns the updated request properties
   */
  async authenticate(init: IRequestInit) {
    const token = await this.getToken()
    if (token && token.access_token)
      init.headers.Authorization = `token ${token.access_token}`
    return init
  }

  isSudo() {
    return !!this.sudoId && this._sudoToken.isActive()
  }

  /**
   * retrieve the current authentication token. If there is no active token, performs default
   * login to retrieve the token
   */
  async getToken() {
    if (!this.isAuthenticated()) {
      await this.login()
    }
    return this.activeToken
  }

  /**
   * Reset the authentication session
   */
  reset() {
    this.sudoId = ''
    this._authToken.reset()
    this._sudoToken.reset()
  }

  /**
   * Activate the authentication token for the API3 or sudo user
   * @param sudoId {string | number}: optional. If provided, impersonates the user specified
   *
   */
  async login(sudoId?: string | number) {
    if (sudoId || sudoId !== this.sudoId || !this.isAuthenticated()) {
      if (sudoId) {
        await this._login(sudoId.toString())
      } else {
        await this._login()
      }
    }
    return this.activeToken
  }

  /**
   * Logout the active user. If the active user is impersonated, the session reverts to the API3 user
   */
  async logout() {
    let result = false
    if (this.isAuthenticated()) {
      result = await this._logout()
    }
    return result
  }

  private async ok<TSuccess, TError>(
    promise: Promise<SDKResponse<TSuccess, TError>>,
  ) {
    const result = await promise
    if (result.ok) {
      return result.value
    } else {
      throw sdkError(result as any)
    }
  }

  private async sudoLogout() {
    let result = false
    if (this.isSudo()) {
      result = await this.logout() // Logout the current sudo
      this._sudoToken.reset()
    }
    return result
  }

  // internal login method that manages default auth token and sudo workflow
  private async _login(newId?: string) {
    // for linty freshness, always logout sudo if set
    await this.sudoLogout()

    if (newId !== this.sudoId) {
      // Assign new requested sudo id
      this.sudoId = newId || ''
    }

    if (!this._authToken.isActive()) {
      this.reset()
      // only retain client API3 credentials for the lifetime of the login request
      const section = this.settings.readIni()
      const client_id = process.env[strLookerClientId] || section['client_id']
      const client_secret =
        process.env[strLookerClientSecret] || section['client_secret']
      // authenticate client
      const token = await this.ok(
        this.transport.request<IAccessToken, IError>(
          strPost,
          '/login',
          {
            client_id,
            client_secret,
          },
        ),
      )
      this._authToken.setToken(token)
    }

    if (this.sudoId) {
      // Use the API user auth to sudo
      let token = this.activeToken
      const promise = this.transport.request<IAccessToken, IError>(
        strPost,
        encodeURI(`/login/${newId}`),
        null,
        null,
        // ensure the auth token is included in the sudo request
        (init: IRequestInit) => {
          if (token.access_token) {
            init.headers.Authorization = `token ${token.access_token}`
          }
          return init
        },
        this.settings,
      )

      const accessToken = await this.ok(promise)

      this._sudoToken.setToken(accessToken)
    }

    return this.activeToken
  }

  private async _logout() {
    const token = this.activeToken
    const promise = this.transport.request<string, IError>(
      strDelete,
      '/logout',
      null,
      null,
      // ensure the auth token is included in the logout promise
      (init: IRequestInit) => {
        if (token.access_token) {
          init.headers.Authorization = `token ${token.access_token}`
        }
        return init
      },
      this.settings,
    )

    await this.ok(promise)

    // If no error was thrown, logout was successful
    if (this.sudoId) {
      // User was logged out, so set auth back to default
      this.sudoId = ''
      this._sudoToken.reset()
      if (!this._authToken.isActive()) {
        await this.login()
      }
    } else {
      // completely logged out
      this.reset()
    }
    return true
  }
}
