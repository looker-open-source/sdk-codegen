/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2020 Looker Data Sciences, Inc.
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

import { AuthSession, IAuthSession } from './authSession'
import { BrowserTransport } from './browserTransport'
import {
  ITransport,
  IRequestProps,
  LookerAppId,
  agentPrefix,
  SDKResponse,
  sdkError,
  ITransportSettings
} from './transport'
import { AuthToken } from './authToken'
import { IAccessToken, IApiSettings, IError } from "..";

interface IAuthCodeGrantTypeParams {
  grant_type: 'authorization_code',
  code: string,
  code_verifier: string,
  client_id: string,
  redirect_uri: string,
}

interface IRefreshTokenGrantTypeParams {
  grant_type: 'refresh_token',
  refresh_token: string,
  client_id: string,
  redirect_uri: string,
}

export class OAuthSession extends AuthSession {
  activeToken = new AuthToken();

  constructor(settings: IApiSettings, transport?: ITransport) {
    super(settings, transport || new BrowserTransport(settings))
  }

  /*
    Apply current auth token credentials to an HTTP request
  */
  async authenticate(props: IRequestProps): Promise<IRequestProps> {
    const token = await this.getToken()
    if (token.access_token) {
      props.headers.Authorization = `Bearer ${token.access_token}`
    }
    return props
  }

  private async requestToken(body: IAuthCodeGrantTypeParams | IRefreshTokenGrantTypeParams) {

    const token = await this.ok(this.transport.request<IAccessToken, IError>(
    'POST',
    `/api/token`,
    undefined,
    body,
    ))

    return this.activeToken.setToken(token)
  }

  /*
    Convert an authCode received from server into an active auth token
    The app is responsible for obtaining the authCode via interactive user login
    via /auth front-end endpoint and URL redirect. When the authCode is received
    by url redirect to an app route, pass the authCode into this function to
    get an access_token and refresh_token.
   */
  async redeemAuthCode(authCode: string, code_verifier: string) {
    return this.requestToken({
      grant_type: 'authorization_code',
      code: authCode,
      code_verifier: code_verifier,
      client_id: this.settings.client_id,
      redirect_uri: this.settings.redirect_uri,
    })
  }

  async getToken() {
    if (!this.isAuthenticated()) {
      if (this.activeToken.refresh_token) {
        await this.requestToken({
          grant_type: 'refresh_token',
          refresh_token: this.activeToken.refresh_token,
          client_id: this.settings.client_id,
          redirect_uri: this.settings.redirect_uri,
        })
      }
    }
    return this.activeToken
  }

  isAuthenticated(): boolean {
    return this.activeToken.isActive();
  }

  async logout() {
    if (this.activeToken.access_token) {
      await this.ok(this.transport.request<IAccessToken, IError>(
      'DELETE',
      `/api/logout`,
      undefined,
      undefined,
      (init: IRequestProps) => {
        init.headers.Authorization = `Bearer ${this.activeToken.access_token}`
        return init
      }))

      // logout destroys the access_token AND the refresh_token
      this.activeToken = new AuthToken()
      return true
    }
    return false
  }
}