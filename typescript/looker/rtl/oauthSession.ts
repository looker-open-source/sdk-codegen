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

export class OAuthSession extends AuthSession {
  activeToken = new AuthToken();
  private authCode?: string;
  private code_verifier?: string;

  constructor(settings: IApiSettings, transport?: ITransport) {
    super(settings, transport || new BrowserTransport(settings))
  }

  setAuthCode(authCode: string, code_verifier: string) {
    this.authCode = authCode
    this.code_verifier = code_verifier
    // invalidate current token, if any
    this.activeToken = new AuthToken()
  }

  async authenticate(props: IRequestProps): Promise<IRequestProps> {
    const token = await this.getToken()
    if (token?.access_token) {
      props.headers.Authorization = `Bearer ${token.access_token}`
    }
    return props
  }

  async getToken() {
    if (!this.isAuthenticated()) {
      let body: any = {}
      if (this.authCode) {
        body.merge({
          grant_type: 'authorization_code',
          code: this.authCode,
          code_verifier: this.code_verifier,
          client_id: this.settings.client_id,
          redirect_uri: this.settings.redirect_uri,
        })
      }
      else if (this.activeToken.refresh_token) {
        body.merge({
          grant_type: 'refresh_token',
          refresh_token: this.activeToken.refresh_token,
          client_id: this.settings.client_id,
          redirect_uri: this.settings.redirect_uri,
        })
      }
      const token = await this.ok(this.transport.request<IAccessToken, IError>(
      'POST',
      `/api/token`,
      undefined,
       body,
      ))
      this.activeToken.setToken((token))
    }
    return this.activeToken
  }

  isAuthenticated(): boolean {
    return !this.authCode && this.activeToken.isActive();
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

      // logout destroys the access_token and the refresh_token
      this.activeToken = new AuthToken()
      return true
    }
    return false
  }
}