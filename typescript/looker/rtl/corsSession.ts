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
import { ITransport, IRequestProps, agentTag } from './transport'
import { IApiSettings } from './apiSettings'
import { AuthToken } from './authToken'

/**
 * An AuthSession class intended for use with CORS requests
 *
 * This session uses `authenticate` to modify all requests to pass through a proxy server with
 * passing the request to the proxy server specified in the `proxyUrl` parameter, and sets
 * the original request path as an `X-Forwarded-For` header.
 *
 * The Looker API `login` endpoint is not available via CORS calls, so `getToken()` needs to be
 * implemented in the descendant of this class that's instantiated for the browser run-time. This
 * can be a brokered "get token" operation from a proxy server, or some other method of getting
 * the token.
 *
 */
export abstract class CorsSession extends AuthSession {
  activeToken = new AuthToken()

  constructor(public settings: IApiSettings, transport?: ITransport) {
    super(settings, transport || new BrowserTransport(settings))
  }

  /**
   * Is the session active and authenticated?
   *
   * For a proxy session, it is presumed that the proxy will handle all authentication so this returns
   * `true`
   * @returns `true` since the proxy handles all authentication
   */
  isAuthenticated() {
    return this.activeToken.isActive()
  }

  /**
   * This implementation calls the customized `getToken()` method to retrieve the authentication token for
   * the Looker API server because the `/login` endpoint is not available via CORS for the Looker API.
   *
   * @param props the properties of the request
   * @returns the same request properties with "authentication" data added
   *
   */
  async authenticate(props: IRequestProps) {
    if (!this.isAuthenticated()) {
      const token = await this.getToken()
      if (token) {
        /**
         * Assign the token, which will track its expiration time automatically
         */
        this.activeToken.setToken(token)
      }
    }
      if (this.isAuthenticated()) {
        /**
         * Session is authenticated
         * set CORS mode
         */
        props.mode = 'cors'

        /**
         * remove any credentials attribute that may have been set
         */
        delete props['credentials']

        /**
         * replace the headers argument with required values
         * Note: using new Headers() to construct the headers breaks CORS for the Looker API. Don't know why yet
         */
        props.headers = {
          /** Provide the authentication information */
          'Authorization': `Bearer ${this.activeToken.access_token}`,
          /** Identify the SDK */
          'x-looker-appid': agentTag
        }
      }

    return props
  }

}

