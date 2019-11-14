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

import { IAuthSession, IRequestProps, ITransport } from './transport'
import { IApiSettings } from './apiSettings'

export abstract class AuthSession implements IAuthSession {
  static TBD = "Method not implemented in AuthSession"
  settings: IApiSettings
  sudoId: string = ''
  transport: ITransport

  constructor(settings: IApiSettings, transport: ITransport) {
    this.settings = settings
    this.transport = transport
  }

  /**
   * Decorate request properties with the required authentication information
   *
   * Properties could be additional headers, cookies, or some other request property
   *
   * @param props Request properties to use and/or modify in authentication method
   */
  abstract authenticate(props: IRequestProps): Promise<IRequestProps>

  /**
   * Does the session have active authentication information?
   */
  abstract isAuthenticated() : boolean

  /**
   * Override this method to implement API session login
   *
   * @param sudoId ID of sudo user. A missing sudoId means the API credentials are used to login
   */
  // @ts-ignore sudoId is not used in this default implementation
  login(sudoId?: string | number): Promise<any> {
    return this.notImplementedAsync()
  }

  /**
   * Override this method to implement logout
   *
   * The base implementation doesn't throw a not implemented error. It just returns a false promise.
   */
  logout(): Promise<boolean> {
    return new Promise<boolean>(() => false)
  }

  /**
   * Override this method to implement a authentication retrieval from the server
   *
   * The base implementation will throw an error in the promise result saying the method isn't implemented
   *
   */
  getToken(): Promise<any> {
    return this.notImplementedAsync()
  }

  /**
   * Is a sudo user active for this session?
   */
  isSudo(): boolean {
    return (this.sudoId !== '') && (this.isAuthenticated())
  }

  /**
   * Resets all authentication status, but standard implementations do NOT log out an API session
   */
  reset(): void {
    this.sudoId = ''
  }

  /**
   * utility function not implemented error
   */
  private notImplemented() {
    throw new Error(AuthSession.TBD)
  }

  /**
   * utility function not implemented error promise
   */
  private notImplementedAsync() {
    // Use `ctrl` for instance closure in the method reference
    const ctrl = this
    // Return a promise that fails with a not implemented error
    return new Promise<any>(() => ctrl.notImplemented())
  }

}
