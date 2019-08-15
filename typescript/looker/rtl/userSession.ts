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

import { IAccessToken, IError } from '../sdk/models'
import { IApiSettings } from './apiSettings'
import { IRequestInit, ITransport, SDKResponse, sdkError } from './transport'
import { AuthToken } from './authToken'
import { NodeTransport } from './nodeTransport'

// TODO support impersonation and reporting user id of logged in user?
export interface IUserSession {
  // Authentication token
  getToken(): Promise<IAccessToken>

  userId: string

  isImpersonating(): boolean

  isAuthenticated(): boolean

  authenticate(init: IRequestInit): Promise<IRequestInit>

  login(userId?: string): Promise<IAccessToken>

  logout(): Promise<boolean>

  settings: IApiSettings
  transport: ITransport
}


export class UserSession implements IUserSession {
  // TODO track both default auth token and user auth token, extract out token expiration logic to new class
  _token: AuthToken = new AuthToken()
  userId: string = ''
  transport: ITransport

  constructor(public settings: IApiSettings, transport?: ITransport) {
    this.settings = settings
    this.transport = transport || new NodeTransport(settings)
  }

  // Determines if the authentication token exists and has not expired
  isAuthenticated() {
    if (!(this._token && this._token.access_token)) return false
    return this._token.isActive()
  }

  isImpersonating() {
    return !!(this.userId && this.isAuthenticated())
  }

  async authenticate(init: IRequestInit) {
    const token = await this.getToken()
    if (token && token.access_token) init.headers.Authorization = `token ${token.access_token}`
    return init
  }

  async getToken() {
    if (!this.isAuthenticated()) {
      await this.login()
    }
    return this._token
  }

  // Reset the user session
  private reset() {
    this._token = new AuthToken()
  }

  private async ok<TSuccess, TError>(promise: Promise<SDKResponse<TSuccess, TError>>) {
    const result = await promise
    if (result.ok) {
      return result.value
    } else {
      throw sdkError(result as any)
    }
  }

  // internal login method
  private async _login(userId?: string) {
    if (userId && this.userId && this.userId !== userId) {
      // We're switching user ids
      await this.logout() // Logout the current user

    }
    this.reset()
    // authenticate client
    const result = await this.ok(this.transport.request<IAccessToken, IError>('POST', '/login',
      {client_id: this.settings.client_id, client_secret: this.settings.client_secret}))
    return result
  }

  async login(userId?: string) {
    if (!this.isAuthenticated()) {
      const token = await this._login(userId)
      this._token = new AuthToken(token)
      return token
    }
    return this._token
  }

  private async _logout() {
    // TODO verify this closure variable is required with a local block
    const token = this._token
    const promise = this.transport.request<string, IError>(
      'DELETE',
      '/logout',
      null,
      null,
      // ensure the auth token is included in the logout promise
      (init: IRequestInit) => {
        if (token.access_token) {
          init.headers.Authorization = `token ${token.access_token}`
        }
        return init
      }
    )

    await this.ok(promise)

    // If no error was thrown, logout was successful
    if (this.userId) {
      // User was logged out, so set auth back to default
      this.userId = ''
      await this.login()
    } else {
      // completely logged out
      this.reset()
    }
    return true
  }

  async logout() {
    let result = false
    if (this.isAuthenticated()) {
      result = await this._logout()
    }
    return result
  }

}
