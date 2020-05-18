/*

 MIT License

 Copyright (c) 2020 Looker Data Sciences, Inc.

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

import { AuthSession } from './authSession'
import { BrowserTransport } from './browserTransport'
import {
  ITransport,
  IRequestProps,
  LookerAppId,
  agentPrefix,
} from './transport'
import { IApiSettings } from './apiSettings'
import { AuthToken } from './authToken'

/**
 * An AuthSession class intended for use with CORS requests
 *
 * This session uses `authenticate()` to establish a token via the overridden `getToken()` before
 * decorating the requests with the authentication information to call the API endpoint.
 *
 * The Looker API `login` endpoint is not available via CORS calls, so `getToken()` needs to be
 * implemented in the descendant of this class that's instantiated for the browser run-time. This
 * can be a brokered "get token" operation from a proxy server, or some other method of getting
 * the token.
 *
 * Or, you can call activeToken.setToken to assign an auth token after construction. This disables
 * auto token management.
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
   * @returns `true` if the current token is authenticated
   */
  isAuthenticated() {
    return this.activeToken.isActive()
  }

  /**
   * This implementation calls the inheritor-implemented `getToken()` method to retrieve the authentication token for
   * the Looker API server because the `/login` endpoint is not available via CORS for the Looker API.
   *
   * @param props the properties of the request
   * @returns the same request properties with "authentication" data added
   *
   */
  async authenticate(props: IRequestProps) {
    if (!this.isAuthenticated()) {
      /**
       * This authentication call should be implemented in the inheritor
       * @type {any} retrieves the authorization token
       */
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
      delete props.credentials

      /**
       * replace the headers argument with required values
       * Note: using new Headers() to construct the headers breaks CORS for the Looker API. Don't know why yet
       */
      props.headers = {
        /** Provide the authentication information */
        Authorization: `Bearer ${this.activeToken.access_token}`,
        /** Identify the SDK */
        [LookerAppId]: agentPrefix,
      }
    }

    return props
  }
}
