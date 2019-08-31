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

import { IApiSettings } from './apiSettings'
import { IRequestInit, ITransport, IAuthSession } from './transport'
import { BrowserTransport } from './browserTransport'
import { IAccessToken } from '../sdk/models'

export class BrowserSession implements IAuthSession {
  sudoId: string = ''
  transport: ITransport

  constructor(public settings: IApiSettings, transport?: ITransport) {
    this.settings = settings
    this.transport = transport || new BrowserTransport(settings)
  }

  get activeToken() {
    const meta = document.head.querySelector('[name=csrf-token]') as HTMLMetaElement
    return meta ? meta.content : ''
  }

  // Determines if the authentication token exists and has not expired
  isAuthenticated() {
    const token = this.activeToken
    if (!token) return false
    return true
  }

  async authenticate(init: IRequestInit) {
    const token = this.activeToken
    if (token) init.headers['X-CSRF-TOKEN'] = token
    return init
  }

  async getToken(): Promise<IAccessToken> {
    return new Promise<IAccessToken>(() => {
      return {} as IAccessToken
    })
  }

  isSudo(): boolean {
    return !!this.sudoId
  }

  async login(sudoId?: string | number): Promise<IAccessToken> {
    if (!!sudoId) {
      throw new Error('Sudo functionality is not currently supported in BrowserSession')
    }
    // TODO support sudo directly in the Browser session?
    return this.getToken()
  }

  async logout(): Promise<boolean> {
    return new Promise<boolean>(() => false)
  }

  reset(): void {
  }

}
