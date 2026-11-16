/*

 Copyright 2022-2026 Google LLC

 Use of this source code is governed by an MIT-style
 license that can be found in the LICENSE file or at
 https://opensource.org/licenses/MIT

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

  constructor(public settings: IApiSettings, transport?: ITransport) {
    super(settings, transport || new NodeTransport(settings));
  }

  /**
   * Abstraction of AuthToken retrieval to support sudo mode
   */
  get activeToken() {
    if (this.sudoId) {
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
      await this.login(this.sudoId || undefined);
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
    if (this.sudoId) {
      if (this.isSudo()) {
        result = await this._logout();
      } else {
        this.sudoId = '';
        this._sudoToken.reset();
      }
    } else if (this.isAuthenticated()) {
      result = await this._logout();
    }
    return result;
  }

  private async sudoLogout() {
    let result = false;
    if (this.isSudo()) {
      result = await this.logout(); // Logout the current sudo
      this._sudoToken.reset();
    } else {
      this._sudoToken.reset();
    }
    return result;
  }

  // internal login method that manages default auth token and sudo workflow
  private async _login(newId?: string) {
    // for linty freshness, always logout sudo if set
    await this.sudoLogout();

    const targetSudoId = newId || '';
    if (targetSudoId !== this.sudoId) {
      // Assign new requested sudo id
      this.sudoId = targetSudoId;
    }

    if (!this._authToken.isActive()) {
      this._authToken.reset();
      this._sudoToken.reset();
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
      const headers = { 'content-type': 'application/x-www-form-urlencoded' };
      // authenticate client
      const token = await this.ok(
        this.transport.request<IAccessToken, IError>(
          strPost,
          `${this.apiPath}/login`,
          undefined,
          body,
          undefined,
          { headers }
        )
      );
      this._authToken.setToken(token);
    }

    if (this.sudoId) {
      // Use the API user auth to sudo
      const token = this._authToken;
      const promise = this.transport.request<IAccessToken, IError>(
        strPost,
        encodeURI(`${this.apiPath}/login/${this.sudoId}`),
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
