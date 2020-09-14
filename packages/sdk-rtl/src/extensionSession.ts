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

import { IApiSettings } from './apiSettings'
import { ITransport, IRequestProps } from './transport'
import { IAuthSession } from './authSession'

export class ExtensionSession implements IAuthSession {
  sudoId = ''
  transport: ITransport

  constructor(public settings: IApiSettings, transport: ITransport) {
    this.settings = settings
    this.transport = transport
  }

  isAuthenticated() {
    // Assume if the extension exists then it is authenticated
    return true
  }

  async authenticate(init: IRequestProps) {
    return Promise.reject(
      Error(
        `Authenticate ${
          init ? 'request property overrides' : ''
        } not supported from ExtensionSession`
      )
    )
  }

  async getToken(): Promise<any> {
    return Promise.reject(
      Error('Access to token is not allowed from ExtensionSession')
    )
  }

  isSudo(): boolean {
    throw new Error('isSudo is not allowed from ExtensionSession')
  }

  async login(sudoId?: string | number): Promise<any> {
    return Promise.reject(
      Error(
        `Login ${sudoId ? 'for sudo' : ''} not supported from ExtensionSession`
      )
    )
  }

  async logout(): Promise<boolean> {
    return Promise.reject(Error('Logout not supported from ExtensionSession'))
  }

  reset(): void {
    // noop
  }
}
