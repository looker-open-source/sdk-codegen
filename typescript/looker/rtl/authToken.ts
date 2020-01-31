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

import { IAccessToken } from '../sdk/4.0/models'

export class AuthToken implements IAccessToken {
  // tslint:disable-next-line: variable-name
  access_token: string = ''
  // tslint:disable-next-line: variable-name
  token_type: string = ''
  // tslint:disable-next-line: variable-name
  expires_in: number = 0
  // tslint:disable-next-line: variable-name
  expiresAt = new Date()

  constructor(token?: IAccessToken) {
    if (!token) token = {} as IAccessToken
    this.setToken(token)
  }

  // true if the authentication token is set and has not timed out
  isActive() {
    if (!this.access_token) return false
    if (!this.expiresAt) return false
    const now = new Date()
    return this.expiresAt > now
  }

  // Assign the token and set its expiration
  setToken(token: IAccessToken) {
    this.access_token = token.access_token || ''
    this.token_type = token.token_type || ''
    this.expires_in = token.expires_in || 0
    let exp = new Date()
    if (this.access_token && this.expires_in) {
      exp.setSeconds(exp.getSeconds() + this.expires_in)
    } else {
      exp.setSeconds(exp.getSeconds() - 10) // set to expire 10 seconds ago
    }
    this.expiresAt = exp
    return this
  }

  reset() {
    this.access_token = ''
    this.expires_in = 0
  }
}
