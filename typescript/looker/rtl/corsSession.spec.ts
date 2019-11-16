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

import { CorsSession } from './corsSession'
import { IApiSettings } from './apiSettings'
import { agentTag, IRequestProps, ITransport, LookerAppId } from './transport'
import { IAccessToken } from '../sdk/models'
import { AuthSession } from './authSession'

const mockToken : IAccessToken = {
  access_token: 'mocked',
  token_type: 'Bearer',
  expires_in: 3600
}

/**
 * Mocking class for CorsSession getToken() tests
 */
class CorsMock extends CorsSession {
  constructor(public settings: IApiSettings, transport?: ITransport) {
    super(settings, transport)
  }

  async getToken() {
    return Promise.resolve(mockToken)
  }
}

describe("CORS session", () => {
  it("initialization", async () => {
    const mock = new CorsMock({} as IApiSettings)
    await expect(mock.login()).rejects.toEqual(AuthSession.TBD)
    expect(mock.isAuthenticated()).toEqual(false)
    expect(mock.isSudo()).toEqual(false)
    const logout = await mock.logout()
    expect(logout).toEqual(false)
  })

  it("getToken is mocked", async () => {
    const mock = new CorsMock({} as IApiSettings)
    const token = await mock.getToken()
    expect(token).toEqual(mockToken)
  })

  it("authenticate causes authentication", async () => {
    const mock = new CorsMock({} as IApiSettings)
    expect(mock.isAuthenticated()).toEqual(false)
    const props = await mock.authenticate({} as IRequestProps)
    expect(mock.isAuthenticated()).toEqual(true)
    expect(props.mode).toEqual('cors')
    expect(props.headers.Authorization).toEqual('Bearer mocked')
    expect(props.headers[LookerAppId]).toEqual(agentTag)
  })

})
