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

import type { IAccessToken, IError } from './authSession';
import { AuthSession } from './authSession';
import type { IRequestProps } from './transport';
import { agentPrefix, sdkError } from './transport';
import { AuthToken } from './authToken';
import type { ICryptoHash } from './cryptoHash';
import type { IPlatformServices } from './platformServices';

interface IAuthCodeGrantTypeParams {
  grant_type: 'authorization_code';
  code: string;
  code_verifier: string;
  client_id: string;
  redirect_uri: string;
}

interface IRefreshTokenGrantTypeParams {
  grant_type: 'refresh_token';
  refresh_token: string;
  client_id: string;
  redirect_uri: string;
}

export class OAuthSession extends AuthSession {
  activeToken = new AuthToken();
  crypto: ICryptoHash;
  reentry = false;
  private static readonly codeVerifierKey = 'looker_oauth_code_verifier';
  public static readonly returnUrlKey = 'looker_oauth_return_url';

  constructor(services: IPlatformServices) {
    super(services.settings, services.transport);

    this.crypto = services.crypto;

    const keys: string[] = [
      'client_id',
      'redirect_uri',
      'base_url',
      'looker_url',
    ];
    const config = { ...this.settings, ...this.settings.readConfig() };

    keys.forEach((key) => {
      const value = config[key];
      if (!value) {
        throw sdkError({
          message: `Missing required configuration setting: '${key}'`,
        });
      }
    });
  }

  /**
   * merge the dynamically defined configuration values with the initial settings
   */
  readConfig() {
    return { ...this.settings, ...this.settings.readConfig() };
  }

  /**
   * Apply current auth token credentials to an HTTP request
   * @param props request properties to update
   * @returns updated request properties with auth information added
   */
  async authenticate(props: IRequestProps): Promise<IRequestProps> {
    const token = await this.getToken();
    if (token.access_token) {
      props.headers.Authorization = `Bearer ${token.access_token}`;
    }
    return props;
  }

  /**
   * Gets session storage for OAuth code verification
   * @returns saved code verifier
   */
  get code_verifier() {
    return sessionStorage.getItem(OAuthSession.codeVerifierKey);
  }

  /**
   * Sets session storage for OAuth code verification
   */
  set code_verifier(value: string | null) {
    if (value === null) {
      // only clear code_verifier if it's `null`
      sessionStorage.removeItem(OAuthSession.codeVerifierKey);
    } else {
      sessionStorage.setItem(OAuthSession.codeVerifierKey, value);
    }
  }

  /**
   * URL to return to after login process completes
   * @returns the URL that started the OAuth login process
   */
  get returnUrl() {
    return sessionStorage.getItem(OAuthSession.returnUrlKey);
  }

  /**
   * Sets the return URL for successful OAuth login
   */
  set returnUrl(value: string | null) {
    if (!value) {
      sessionStorage.removeItem(OAuthSession.returnUrlKey);
    } else {
      sessionStorage.setItem(OAuthSession.returnUrlKey, value);
    }
  }

  /**
   * Clears all Looker SDK OAuth-related session storage
   */
  clearStorage() {
    sessionStorage.removeItem(OAuthSession.codeVerifierKey);
    sessionStorage.removeItem(OAuthSession.returnUrlKey);
  }

  async login(_sudoId?: string | number): Promise<any> {
    if (!this.isAuthenticated()) {
      if (this.reentry) {
        // do nothing
      } else if (!this.returnUrl) {
        // OAuth has not been initiated
        const authUrl = await this.createAuthCodeRequestUrl(
          'cors_api',
          agentPrefix
        );
        const returnTo = window.location.pathname + window.location.search;
        this.returnUrl = returnTo;
        // Save the current URL so redirected successful OAuth login can restore it
        window.location.href = authUrl;
      } else {
        this.reentry = true;
        // If return URL is stored, we must be coming back from an OAuth request
        // so release the stored return url at the start of the redemption
        this.returnUrl = null;
        if (!this.code_verifier) {
          return Promise.reject(
            new Error('OAuth failed: expected code_verifier to be stored')
          );
        }
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        if (!code) {
          return Promise.reject(
            new Error(
              `OAuth failed: no OAuth code parameter found in ${
                window.location.pathname + window.location.search
              }`
            )
          );
        }
        await this.redeemAuthCode(code);
      }
      return await this.getToken();
    }
    return this.activeToken;
  }

  private async requestToken(
    body: IAuthCodeGrantTypeParams | IRefreshTokenGrantTypeParams
  ) {
    const config = this.readConfig();
    const url = new URL(config.base_url);
    // replace the entire path of the base_url because this
    // auth endpoint is independent of API version
    url.pathname = '/api/token';
    const token = await this.ok(
      this.transport.request<IAccessToken, IError>(
        'POST',
        url.toString(),
        undefined,
        body
      )
    );

    return this.activeToken.setToken(token);
  }

  /*
   Generate an OAuth2 authCode request URL
   */
  async createAuthCodeRequestUrl(
    scope: string,
    state: string
  ): Promise<string> {
    // TODO: remove this comment when we remove hex backwards compatibility
    // in Looker API. For now it must not be 2^n so that Looker correctly
    // treats it as base64 encoded
    const verifier = this.crypto.secureRandom(33);
    this.code_verifier = verifier;
    const code_challenge = await this.crypto.sha256Hash(verifier);
    const config = this.readConfig();
    const params: Record<string, string> = {
      client_id: config.client_id,
      code_challenge: code_challenge,
      code_challenge_method: 'S256',
      redirect_uri: config.redirect_uri,
      response_type: 'code',
      scope: scope,
      state: state,
    };
    const url = new URL(config.looker_url);
    url.pathname = '/auth';
    url.search = new URLSearchParams(params).toString();
    return url.toString();
  }

  redeemAuthCodeBody(authCode: string, codeVerifier?: string) {
    const verifier = codeVerifier || this.code_verifier || '';
    const config = this.readConfig();
    return {
      client_id: config.client_id,
      code: authCode,
      code_verifier: verifier,
      grant_type: 'authorization_code',
      redirect_uri: config.redirect_uri,
    } as IAuthCodeGrantTypeParams;
  }

  /**
   * Convert an authCode received from server into an active auth token
   * The app is responsible for obtaining the authCode via interactive user login
   * via /auth front-end endpoint and URL redirect. When the authCode is received
   * by url redirect to an app route, pass the authCode into this function to
   * get an access_token and refresh_token.
   * @param {string} authCode
   * @param {string} codeVerifier
   * @returns {Promise<AuthToken>}
   */
  async redeemAuthCode(authCode: string, codeVerifier?: string) {
    return this.requestToken(this.redeemAuthCodeBody(authCode, codeVerifier));
  }

  async getToken() {
    if (!this.isAuthenticated()) {
      if (this.activeToken.refresh_token) {
        const config = this.readConfig();
        await this.requestToken({
          client_id: config.client_id,
          grant_type: 'refresh_token',
          redirect_uri: config.redirect_uri,
          refresh_token: this.activeToken.refresh_token,
        });
      }
    }
    return this.activeToken;
  }

  isAuthenticated(): boolean {
    return this.activeToken.isActive();
  }

  async logout() {
    if (this.activeToken.access_token) {
      await this.ok(
        this.transport.request<IAccessToken, IError>(
          'DELETE',
          `/api/logout`,
          undefined,
          undefined,
          (init: IRequestProps) => {
            init.headers.Authorization = `Bearer ${this.activeToken.access_token}`;
            return init;
          }
        )
      );

      // logout destroys the access_token AND the refresh_token
      this.activeToken = new AuthToken();
      this.clearStorage();
      return true;
    }
    return false;
  }
}
