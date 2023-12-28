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

import type {
  HttpMethod,
  IAccessToken,
  IApiSettings,
  IError,
  IRequestProps,
  ITransport,
} from '@looker/sdk-rtl';
import {
  AuthSession,
  AuthToken,
  encodeParams,
  sdkError,
} from '@looker/sdk-rtl';
import { NodeTransport } from './nodeTransport';

const strPost: HttpMethod = 'POST';
const strDelete: HttpMethod = 'DELETE';

export class NodeSession extends AuthSession {
  private readonly apiPath: string = '/api/4.0';
  _authToken: AuthToken = new AuthToken();
  _sudoToken: AuthToken = new AuthToken();

  constructor(
    public settings: IApiSettings,
    transport?: ITransport
  ) {
    super(settings, transport || new NodeTransport(settings));
  }

  /**
   * Abstraction of AuthToken retrieval to support sudo mode
   */
  get activeToken() {
    if (this._sudoToken.access_token) {
      return this._sudoToken;
    }
    return this._authToken;
  }

  /**
   * Is there an active authentication token?
   */
  isAuthenticated() {
    // TODO I think this can be simplified
    const token = this.activeToken;
    if (!(token && token.access_token)) return false;
    return token.isActive();
  }

  /**
   * Add authentication data to the pending API request
   * @param props initialized API request properties
   *
   * @returns the updated request properties
   */
  async authenticate(props: IRequestProps) {
    const token = await this.getToken();
    if (token && token.access_token) {
      props.headers.Authorization = `Bearer ${token.access_token}`;
    }
    return props;
  }

  isSudo() {
    return !!this.sudoId && this._sudoToken.isActive();
  }

  /**
   * retrieve the current authentication token. If there is no active token, performs default
   * login to retrieve the token
   */
  async getToken() {
    if (!this.isAuthenticated()) {
      await this.login();
    }
    return this.activeToken;
  }

  /**
   * Reset the authentication session
   */
  reset() {
    this.sudoId = '';
    this._authToken.reset();
    this._sudoToken.reset();
  }

  /**
   * Activate the authentication token for the API3 or sudo user
   * @param sudoId {string | number}: optional. If provided, impersonates the user specified
   *
   */
  async login(sudoId?: string | number) {
    if (sudoId || sudoId !== this.sudoId || !this.isAuthenticated()) {
      if (sudoId) {
        await this._login(sudoId.toString());
      } else {
        await this._login();
      }
    }
    return this.activeToken;
  }

  /**
   * Logout the active user. If the active user is sudo, the session reverts to the API3 user
   */
  async logout() {
    let result = false;
    if (this.isAuthenticated()) {
      result = await this._logout();
    }
    return result;
  }

  private async sudoLogout() {
    let result = false;
    if (this.isSudo()) {
      result = await this.logout(); // Logout the current sudo
      this._sudoToken.reset();
    }
    return result;
  }

  // internal login method that manages default auth token and sudo workflow
  private async _login(newId?: string) {
    // for linty freshness, always logout sudo if set
    await this.sudoLogout();

    if (newId !== this.sudoId) {
      // Assign new requested sudo id
      this.sudoId = newId || '';
    }

    if (!this._authToken.isActive()) {
      this.reset();
      // only retain client API3 credentials for the lifetime of the login request
      const section = this.settings.readConfig();
      const clientId = section.client_id;
      const clientSecret = section.client_secret;
      if (!clientId || !clientSecret) {
        throw sdkError({
          message: 'API credentials client_id and/or client_secret are not set',
        });
      }
      const body = encodeParams({
        client_id: clientId,
        client_secret: clientSecret,
      });
      // authenticate client
      const token = await this.ok(
        this.transport.request<IAccessToken, IError>(
          strPost,
          `${this.apiPath}/login`,
          undefined,
          body
        )
      );
      this._authToken.setToken(token);
    }

    if (this.sudoId) {
      // Use the API user auth to sudo
      const token = this.activeToken;
      const promise = this.transport.request<IAccessToken, IError>(
        strPost,
        encodeURI(`${this.apiPath}/login/${newId}`),
        null,
        null,
        // ensure the auth token is included in the sudo request
        (init: IRequestProps) => {
          if (token.access_token) {
            init.headers.Authorization = `Bearer ${token.access_token}`;
          }
          return init;
        },
        this.settings // TODO this may not be needed here
      );

      const accessToken = await this.ok(promise);

      this._sudoToken.setToken(accessToken);
    }

    return this.activeToken;
  }

  private async _logout() {
    const token = this.activeToken;
    const promise = this.transport.request<string, IError>(
      strDelete,
      `${this.apiPath}/logout`,
      null,
      null,
      // ensure the auth token is included in the logout promise
      (init: IRequestProps) => {
        if (token.access_token) {
          init.headers.Authorization = `Bearer ${token.access_token}`;
        }
        return init;
      },
      this.settings
    );

    await this.ok(promise);

    // If no error was thrown, logout was successful
    if (this.sudoId) {
      // User was logged out, so set auth back to default
      this.sudoId = '';
      this._sudoToken.reset();
      if (!this._authToken.isActive()) {
        await this.login();
      }
    } else {
      // completely logged out
      this.reset();
    }
    return true;
  }
}
