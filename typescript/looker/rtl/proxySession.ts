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

import { AuthSession } from './authSession'
import { BrowserTransport } from './browserTransport'
import { ITransport } from './transport'
import { IApiSettings } from './apiSettings'
import { AuthToken } from './authToken'

/**
 * An AuthSession class intended for use with proxied authentication
 *
 * Override the `authenticate()` method to implement a browser authentication hook
 *
 * Override `logout()` if you want to support session logout
 *
 */
export abstract class ProxySession extends AuthSession {
  activeToken = new AuthToken()

  constructor(public settings: IApiSettings, public proxyUrl: string, transport?: ITransport) {
    super(settings, transport || new BrowserTransport(settings))
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
   * The default implementation swaps the request's path with the proxy url, and puts the original
   * request path in the `X-Forwarded-For` header
   *
   * @param props the properties of the request
   * @returns the same properties with authentication added
   */
  async authenticate(props: any) {
    props['X-Forwarded-For'] = props['path']
    props['path'] = this.proxyUrl
    return props
  }

  /**
   * Logout does nothing for a proxy session by default.
   *
   * Override to support using the proxy to log out the session
   *
   * @returns a false Promise
   */
  async logout(): Promise<boolean> {
    return new Promise<boolean>(() => false)
  }

}

