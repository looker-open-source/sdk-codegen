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

import { IApiSettings } from './apiSettings'
import { IAuthorizer, IRequestInit, ITransport } from './transport'
import { BrowserTransport } from './browserTransport'
import { AuthToken } from './authToken'

export class BrowserSession implements IAuthorizer {
  transport: ITransport

  constructor(public settings: IApiSettings, transport?: ITransport) {
    this.settings = settings
    this.transport = transport || new BrowserTransport(settings)
  }

  get activeToken() {
    const meta = document.head.querySelector(
      '[name=csrf-token]',
    ) as HTMLMetaElement
    return meta ? meta.content : ''
  }

  // Determines if the authentication token exists and has not expired
  isAuthenticated() {
    const token = this.activeToken
    if (!token) return false
    return true
  }

  async authenticate(init: IRequestInit) {
    const token = this.activeToken
    if (token) init.headers['X-CSRF-TOKEN'] = token
    return init
  }

  /**
   * Logout is not supported for a Browser Session
   * @returns {Promise<boolean>}
   */
  async logout(): Promise<boolean> {
    return new Promise<boolean>(() => false)
  }

  // tslint:disable-next-line:no-empty
  reset(): void {
  }
}

/**
 * An AuthSession class intended for use with proxied authentication
 *
 * Override the `authenticate()` method to implmenent a browser authentication hook
 *
 * Override `logout()` if you want to support session logout
 *
 */
export abstract class ProxySession implements IAuthorizer {
  activeToken = new AuthToken()
  transport: ITransport

  constructor(public settings: IApiSettings, transport?: ITransport) {
    this.settings = settings
    this.transport = transport || new BrowserTransport(settings)
  }

  /**
   * Is the session active and authenticated?
   * @returns `true` if the session is active
   */
  isAuthenticated() {
    return this.activeToken.isActive()
  }

  /**
   * Decorate the request properties with the required authentication information
   *
   * Override this class with the implementation for a specific proxied authentication workflow
   *
   * @param props the properties of the request
   * @returns the same properties with authentication added
   */
  abstract async authenticate(props: any): Promise<any>

  /**
   * Logout does nothing for a proxy session by default.
   *
   * Override to support telling the proxy to log out the session
   *
   * @returns a false Promise
   */
  async logout(): Promise<boolean> {
    return new Promise<boolean>(() => false)
  }

}

