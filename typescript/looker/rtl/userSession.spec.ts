import { ApiSettingsIniFile } from "./apiSettings";
import { UserSession } from "./userSession";

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

import * as process from 'process'
import { NodeTransport } from "./nodeTransport"

// TODO figure out a way to ignore self-signed certs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

describe('User session', () => {
  // TODO get file test paths configured
  // const localIni = '../../../looker.ini'
  const localIni = '/Users/looker/sdk_codegen/looker.ini'
  const settings = new ApiSettingsIniFile(localIni, 'Looker')

  describe('expiration determination', () => {
    it ('sets expiration correctly', () => {
      const session = new UserSession(settings, new NodeTransport(settings))
      session.setToken({
        access_token: 'accesstoken',
        token_type: 'Bearer',
        expires_in: 3600
      })
      expect(session.isAuthenticated()).toEqual(true)
      session.setToken({
        access_token: '',
        token_type: 'Bearer',
        expires_in: 3600
      })
      expect(session.isAuthenticated()).toEqual(false)
    })
  })
  describe('integration tests', () => {
    it ('initializes', () => {
      const session = new UserSession(settings, new NodeTransport(settings))
      expect(session.settings).toEqual(settings)
      expect(session.isAuthenticated()).toEqual(false)
    })

    it ('logs in with good credentials', async () => {
      const session = new UserSession(settings, new NodeTransport(settings))
      expect(session.isAuthenticated()).toEqual(false)
      const token = session.login()
      expect(token).toBeDefined()
      expect(token.access_token).toBeDefined()
      expect(session.isAuthenticated()).toEqual(true)
    })

  })

})
