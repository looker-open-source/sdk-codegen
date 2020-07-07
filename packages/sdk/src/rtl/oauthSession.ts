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

import { IAccessToken, IError } from '..'
import { AuthSession } from './authSession'
import { agentPrefix, IRequestProps, sdkError } from './transport'
import { AuthToken } from './authToken'
import { ICryptoHash } from './cryptoHash'
import { IPlatformServices } from './platformServices'

interface IAuthCodeGrantTypeParams {
  grant_type: 'authorization_code'
  code: string
  code_verifier: string
  client_id: string
  redirect_uri: string
}

interface IRefreshTokenGrantTypeParams {
  grant_type: 'refresh_token'
  refresh_token: string
  client_id: string
  redirect_uri: string
}

export class OAuthSession extends AuthSession {
  activeToken = new AuthToken()
  code_verifier?: string
  crypto: ICryptoHash

  constructor(services: IPlatformServices) {
    super(services.settings, services.transport)

    this.crypto = services.crypto

    const keys: string[] = [
      'client_id',
      'redirect_uri',
      'base_url',
      'looker_url',
    ]
    const creds = { ...this.settings, ...this.settings.readConfig() }

    keys.forEach((key) => {
      const value = creds[key]
      if (!value) {
        throw sdkError({
          message: `Missing required configuration setting: '${key}'`,
        })
      }
    })
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

  async login(_sudoId?: string | number): Promise<any> {
    if (!this.isAuthenticated()) {
      const authUrl = await this.createAuthCodeRequestUrl(
        'cors_api',
        agentPrefix
      )
      const response = await this.transport.rawRequest('POST', authUrl)
      if (!response.ok) {
        console.error({ response })
      }
      const params = new URLSearchParams(response.body.toString())
      const code = params.get('code')
      if (!code) {
        console.error({ params })
      }
      await this.redeemAuthCode(code!)
      return await this.getToken()
    }
    return this.activeToken
  }

  private async requestToken(
    body: IAuthCodeGrantTypeParams | IRefreshTokenGrantTypeParams
  ) {
    const url = new URL(this.settings.base_url)
    // replace the entire path of the base_url because this
    // auth endpoint is independent of API version
    url.pathname = '/api/token'
    const token = await this.ok(
      this.transport.request<IAccessToken, IError>(
        'POST',
        url.toString(),
        undefined,
        body
      )
    )

    return this.activeToken.setToken(token)
  }

  /*
   Generate an OAuth2 authCode request URL
   */
  async createAuthCodeRequestUrl(
    scope: string,
    state: string
  ): Promise<string> {
    this.code_verifier = this.crypto.secureRandom(32)
    const code_challenge = await this.crypto.sha256Hash(this.code_verifier)
    const config = this.settings.readConfig()
    const params: Record<string, string> = {
      client_id: config.client_id,
      code_challenge: code_challenge,
      code_challenge_method: 'S256',
      redirect_uri: config.redirect_uri,
      response_type: 'code',
      scope: scope,
      state: state,
    }
    const url = new URL(config.looker_url)
    url.pathname = '/auth'
    url.search = new URLSearchParams(params).toString()
    return url.toString()
  }

  redeemAuthCodeBody(authCode: string, codeVerifier?: string) {
    const verifier = codeVerifier || this.code_verifier || ''
    const config = this.settings.readConfig()
    return {
      client_id: config.client_id,
      code: authCode,
      code_verifier: verifier,
      grant_type: 'authorization_code',
      redirect_uri: config.redirect_uri,
    } as IAuthCodeGrantTypeParams
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
    return this.requestToken(this.redeemAuthCodeBody(authCode, codeVerifier))
  }

  async getToken() {
    if (!this.isAuthenticated()) {
      if (this.activeToken.refresh_token) {
        const config = this.settings.readConfig()
        await this.requestToken({
          client_id: config.client_id,
          grant_type: 'refresh_token',
          redirect_uri: config.redirect_uri,
          refresh_token: this.activeToken.refresh_token,
        })
      }
    }
    return this.activeToken
  }

  isAuthenticated(): boolean {
    return this.activeToken.isActive()
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
            init.headers.Authorization = `Bearer ${this.activeToken.access_token}`
            return init
          }
        )
      )

      // logout destroys the access_token AND the refresh_token
      this.activeToken = new AuthToken()
      return true
    }
    return false
  }
}
