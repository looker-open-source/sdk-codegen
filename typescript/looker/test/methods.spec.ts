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

import { ApiSettingsIniFile } from "../rtl/apiSettings"
import { UserSession } from "../rtl/userSession"
import { LookerSDK } from "../sdk/methods"

describe('LookerSDK', () => {
  // TODO get file test paths configured
  // const localIni = '../../../looker.ini'
  const localIni = '/Users/looker/sdk_codegen/looker.ini'
  const settings = new ApiSettingsIniFile(localIni, 'Looker')
  const userSession = new UserSession(settings)

  describe('automatic authentication for API calls', () => {
    it ('me returns the correct result', async () => {
      const sdk = new LookerSDK(userSession)
      const actual = await sdk.ok(sdk.me())
      expect(actual).toBeDefined()
      expect(actual.credentials_api3).toBeDefined()
      expect(actual.credentials_api3!.length).toBeGreaterThan(0)
      await sdk.userSession.logout()
      expect(sdk.userSession.isAuthenticated()).toBeFalsy()
    })

    it ('me fields filter', async () => {
      const sdk = new LookerSDK(userSession)
      const actual = await sdk.ok(sdk.me('id,first_name,last_name'))
      expect(actual).toBeDefined()
      expect(actual.id).toBeDefined()
      expect(actual.first_name).toBeDefined()
      expect(actual.last_name).toBeDefined()
      expect(actual.display_name).toBeUndefined()
      expect(actual.email).toBeUndefined()
      expect(actual.personal_space_id).toBeUndefined()
      await sdk.userSession.logout()
      expect(sdk.userSession.isAuthenticated()).toBeFalsy()
    })
  })

  describe('retrieves collections', () => {
    it ('search_looks returns looks', async () => {
      const sdk = new LookerSDK(userSession)
      const actual = await sdk.ok(sdk.search_looks({}))
      expect(actual).toBeDefined()
      expect(actual.length).toBeGreaterThan(0)
      const look = actual[0]
      expect(look.title).toBeDefined()
      await sdk.userSession.logout()
      expect(sdk.userSession.isAuthenticated()).toBeFalsy()
    })

    it ('search_looks fields filter', async () => {
      const sdk = new LookerSDK(userSession)
      const actual = await sdk.ok(sdk.search_looks({ fields: 'id,title,description'}))
      expect(actual).toBeDefined()
      expect(actual.length).toBeGreaterThan(0)
      const look = actual[0]
      expect(look.id).toBeDefined()
      expect(look.title).toBeDefined()
      expect(look.description).toBeDefined()
      expect(look.created_at).not.toBeDefined()
      await sdk.userSession.logout()
      expect(sdk.userSession.isAuthenticated()).toBeFalsy()
    })

    it ('search_looks fields filter', async () => {
      const sdk = new LookerSDK(userSession)
      const actual = await sdk.ok(sdk.search_looks(
        {
          title: 'Order%',
          fields: 'id,title'
        }))
      expect(actual).toBeDefined()
      expect(actual.length).toBeGreaterThan(1)
      const look = actual[0]
      expect(look.id).toBeDefined()
      expect(look.title).toBeDefined()
      expect(look.title).toContain('Order')
      expect(look.description).not.toBeDefined()
      await sdk.userSession.logout()
      expect(sdk.userSession.isAuthenticated()).toBeFalsy()
    })
  })

})
