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

import type { IRequestProps, ITransport, SDKResponse } from './transport';
import { sdkError } from './transport';
import type { IApiSettings } from './apiSettings';

/**
 * Same as the Looker API access token object
 * Re-declared here to be independent of model generation
 */
export interface IAccessToken {
  /**
   * Access Token used for API calls (read-only)
   */
  access_token?: string;
  /**
   * Type of Token (read-only)
   */
  token_type?: string;
  /**
   * Number of seconds before the token expires (read-only)
   */
  expires_in?: number;
  /**
   * Refresh token which can be used to obtain a new access token (read-only)
   */
  refresh_token?: string;
}

/**
 * Same as the Looker API error object
 * Re-declared here to be independent of model generation
 */
export interface IError {
  /**
   * Error details (read-only)
   */
  message: string | null;
  /**
   * Documentation link (read-only)
   */
  documentation_url: string | null;
}

/**
 * Basic authorization session interface for most API authentication scenarios
 */
export interface IAuthSession {
  settings: IApiSettings;
  transport: ITransport;
  /**
   * ID of sudo user
   */
  sudoId: string;

  /**
   * is the current session authenticated?
   */
  isAuthenticated(): boolean;

  /**
   * Decorate the request with authentication information
   * @param props Properties of request to use or update in callback
   * @returns the request properties with authentication information added
   */
  authenticate(props: IRequestProps): Promise<IRequestProps>;

  /**
   * Log out the current user
   *
   * - if the current user is a sudo user, the API user becomes the active user
   * - if the current user is the API user, the API session is logged out
   *   - any subsequent SDK method calls will automatically log the API user back in for this scenario
   * @returns {Promise<boolean>} `true` if a logout happened, `false` otherwise
   */
  logout(): Promise<boolean>;

  /**
   * Typically returns an `IAccessToken` but could be any data used for auth.
   *
   * This method is not used in all session patterns, so it's not abstract in the base AuthSession
   *
   * @returns {Promise<any>} authentication information
   */
  getToken(): Promise<any>;

  /**
   *
   * @returns `true` if the auth session is in sudo mode
   */
  isSudo(): boolean;

  /**
   * Login to the auth session, optionally as a sudo user
   * @param {string | number} sudoId
   * @returns {Promise<any>} authentication data
   */
  login(sudoId?: string | number): Promise<any>;

  /**
   * Clears all authentication tracking. Does **not** log the API user out in default implementations.
   */
  reset(): void;
}

/**
 * Base implementation of automatically authenticated sessions for calling API endpoints
 *
 * All "auth session" components can descend from this class
 *
 */
export abstract class AuthSession implements IAuthSession {
  static TBD = 'Method not implemented in AuthSession';
  settings: IApiSettings;
  sudoId = '';
  transport: ITransport;

  protected constructor(settings: IApiSettings, transport: ITransport) {
    this.settings = settings;
    this.transport = transport;
  }

  /**
   * Decorate request properties with the required authentication information
   *
   * Properties could be additional headers, cookies, or some other request property
   *
   * @param props Request properties to use and/or modify in authentication method
   */
  abstract authenticate(props: IRequestProps): Promise<IRequestProps>;

  /**
   * Does the session have active authentication information?
   */
  abstract isAuthenticated(): boolean;

  /**
   * Override this method to implement a authentication retrieval from the server
   */
  abstract getToken(): Promise<any>;

  /**
   * Override this method to implement API session login
   *
   * @param sudoId ID of sudo user. A missing sudoId means the API credentials are used to login
   */
  login(_sudoId?: string | number): Promise<any> {
    return Promise.reject(AuthSession.TBD);
  }

  /**
   * Override this method to implement logout
   *
   * The base implementation just returns a false promise.
   */
  logout(): Promise<boolean> {
    return Promise.resolve(false);
  }

  /**
   * Is a sudo user active for this session?
   */
  isSudo(): boolean {
    return this.sudoId !== '' && this.isAuthenticated();
  }

  /**
   * Resets all authentication status, but standard implementations do NOT log out an API session
   */
  reset(): void {
    this.sudoId = '';
  }

  protected async ok<TSuccess, TError>(
    promise: Promise<SDKResponse<TSuccess, TError>>
  ) {
    const result = await promise;
    if (result.ok) {
      return result.value;
    } else {
      if (result instanceof Buffer) {
        throw sdkError({ message: result.toString('utf8') });
      } else {
        throw sdkError(result);
      }
    }
  }
}
