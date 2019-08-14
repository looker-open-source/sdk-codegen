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

import { ApiSettingsIniFile } from '../rtl/apiSettings'
import { UserSession } from '../rtl/userSession'
import { LookerSDK } from '../sdk/methods'
import { IUser, IQuery, IRequestrun_inline_query } from '../sdk/models'
import * as yaml from 'js-yaml'
import * as fs from 'fs'

const testData = yaml.safeLoad(fs.readFileSync('test/data.yml', 'utf-8'))
const localIni = testData['iniFile']
const users: Partial<IUser>[] = testData['users']
const queries: Partial<IQuery>[] = testData['queries']
const emailDomain = '@foo.com'
const debugTimeout = 36000000 // 1 hour

describe('LookerSDK', () => {
  const settings = new ApiSettingsIniFile(localIni, 'Looker')
  const userSession = new UserSession(settings)

  const createTestUsers = async () => {
    // Ensure all test users are populated and enabled
    let user: IUser
    const sdk = new LookerSDK(userSession)
    // create test users
    for (const u of users) {
      let searched = await sdk.ok(
        sdk.search_users({first_name: u.first_name, last_name: u.last_name})
      )
      if (searched.length === 0) {
        // Look for disabled user
        searched = await sdk.ok(
          sdk.search_users({first_name: u.first_name, last_name: u.last_name, is_disabled: true})
        )
        for (const user of searched) {
          // enable user if found
          await sdk.ok(sdk.update_user(user.id, {is_disabled: false}))
        }
      }
      if (searched.length === 0) {
        // create missing user record
        user = await sdk.ok(
          sdk.create_user({
            first_name: u.first_name,
            last_name: u.last_name,
            is_disabled: false,
            locale: 'en'
          })
        )
      } else {
        user = searched[0]
      }
      if (!user.credentials_email) {
        // Ensure email credentials are created
        const email = `${u.first_name}.${u.last_name}${emailDomain}`.toLocaleLowerCase()
        await sdk.ok(
          sdk.create_user_credentials_email(user.id, {email: email})
        )
        user = await sdk.ok(sdk.user(user.id))
      }
    }
    await sdk.userSession.logout()
  }

  const removeTestUsers = async () => {
    // Clean up any test users that may exist
    const sdk = new LookerSDK(userSession)
    for (const u of users) {
      let searched = await sdk.ok(
        sdk.search_users({first_name: u.first_name, last_name: u.last_name})
      )
      if (searched.length === 0) {
        searched = await sdk.ok(
          sdk.search_users({first_name: u.first_name, last_name: u.last_name, is_disabled: true})
        )
      }
      if (searched.length > 0) {
        for (const user of searched) {
          await sdk.ok(sdk.delete_user(user.id))
        }
      }
    }
    await sdk.userSession.logout()
  }

  afterAll(async () => {
    await removeTestUsers()
  })

  describe('automatic authentication for API calls', () => {
    it('me returns the correct result', async () => {
      const sdk = new LookerSDK(userSession)
      const actual = await sdk.ok(sdk.me())
      expect(actual).toBeDefined()
      expect(actual.credentials_api3).toBeDefined()
      expect(actual.credentials_api3!.length).toBeGreaterThan(0)
      await sdk.userSession.logout()
      expect(sdk.userSession.isAuthenticated()).toBeFalsy()
    })

    it('me fields filter', async () => {
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
    it('search_looks returns looks', async () => {
      const sdk = new LookerSDK(userSession)
      const actual = await sdk.ok(sdk.search_looks({}))
      expect(actual).toBeDefined()
      expect(actual.length).toBeGreaterThan(0)
      const look = actual[0]
      expect(look.title).toBeDefined()
      await sdk.userSession.logout()
      expect(sdk.userSession.isAuthenticated()).toBeFalsy()
    })

    it('search_looks fields filter', async () => {
      const sdk = new LookerSDK(userSession)
      const actual = await sdk.ok(
        sdk.search_looks({fields: 'id,title,description'})
      )
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

    it('search_looks fields filter', async () => {
      const sdk = new LookerSDK(userSession)
      const actual = await sdk.ok(
        sdk.search_looks({
          title: 'Order%',
          fields: 'id,title'
        })
      )
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

  describe('User CRUD-it checks', () => {
    beforeAll(async () => {
      await removeTestUsers()
    }, debugTimeout)

    it('create, update, and delete user', async () => {
      const sdk = new LookerSDK(userSession)
      for (const u of users) {
        let user = await sdk.ok(
          sdk.create_user({
            first_name: u.first_name,
            last_name: u.last_name,
            is_disabled: false,
            locale: 'fr'
          })
        )
        expect(user).toBeDefined()
        expect(user.first_name).toEqual(u.first_name)
        expect(user.last_name).toEqual(u.last_name)
        expect(user.is_disabled).toEqual(false)
        expect(user.locale).toEqual('fr')
        user = await sdk.ok(
          sdk.update_user(user.id, {
            is_disabled: true,
            locale: 'en'
          })
        )
        expect(user.is_disabled).toEqual(true)
        expect(user.locale).toEqual('en')
        user = await sdk.ok(
          sdk.update_user(user.id, {
            is_disabled: false,
            locale: 'en'
          })
        )
        expect(user.is_disabled).toEqual(false)
        const email = `${u.first_name}.${u.last_name}${emailDomain}`.toLocaleLowerCase()
        let creds = await sdk.ok(
          sdk.create_user_credentials_email(user.id, {email: email})
        )
        expect(creds.email).toEqual(email)
        const result = await sdk.ok(sdk.delete_user(user.id))
        expect(result).toEqual('')
      }
      await sdk.userSession.logout()
      expect(sdk.userSession.isAuthenticated()).toBeFalsy()
    })
  })

  describe('User searches', () => {

    beforeAll(async () => {
      await removeTestUsers()
      await createTestUsers()
    }, debugTimeout)

    it('bad search returns no results', async () => {
      const sdk = new LookerSDK(userSession)
      let actual = await sdk.ok(
        sdk.search_users({first_name: 'Bad', last_name: 'News'})
      )
      expect(actual.length).toEqual(0)
      await sdk.userSession.logout()
    })

    it('matches email domain', async () => {
      const sdk = new LookerSDK(userSession)
      let actual = await sdk.ok(
        sdk.search_users_names({
          pattern: `%${emailDomain}`
        })
      )
      expect(actual.length).toEqual(users.length)
      await sdk.userSession.logout()
    }, debugTimeout)

    it('matches email domain and returns sorted', async () => {
      const lastFirst = users.sort((a: Partial<IUser>, b: Partial<IUser>) =>
        (`${a.last_name} ${a.first_name}`.localeCompare(`${b.last_name} ${b.first_name}`)))
      const firstLast = users.sort((a: Partial<IUser>, b: Partial<IUser>) =>
        (`${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)))
      const sdk = new LookerSDK(userSession)
      let actual = await sdk.ok(
        sdk.search_users_names({
          pattern: `%${emailDomain}`,
          sorts: 'last_name,first_name'
        })
      )
      expect(actual.length).toEqual(users.length)
      for (let i = 0; i < users.length; i++) {
        expect(actual[i].first_name).toEqual(lastFirst[i].first_name)
        expect(actual[i].last_name).toEqual(lastFirst[i].last_name)
      }
      actual = await sdk.ok(
        sdk.search_users_names({
          pattern: `%${emailDomain}`,
          sorts: 'first_name,last_name'
        })
      )
      expect(actual.length).toEqual(users.length)
      for (let i = 0; i < users.length; i++) {
        expect(actual[i].first_name).toEqual(firstLast[i].first_name)
        expect(actual[i].last_name).toEqual(firstLast[i].last_name)
      }

      await sdk.userSession.logout()
    }, debugTimeout)
  })

  describe('Query calls', () => {
    it('create and run query', async () => {
      const sdk = new LookerSDK(userSession)
      for (const q of queries) {
        // default the result limit to 10
        const limit = q.limit ? parseInt(q.limit) : 10
        const query = await sdk.ok(
          sdk.create_query({
            model: q.model,
            view: q.view,
            fields: q.fields || undefined,
            pivots: q.pivots || undefined,
            fill_fields: q.fill_fields || [],
            filters: q.filters || [],
            filter_expression: q.filter_expression || undefined,
            sorts: q.sorts || [],
            limit: limit.toString(10),
            column_limit: q.column_limit || undefined,
            total: typeof q.total !== 'undefined' ? q.total : false,
            row_total: q.row_total || undefined,
            subtotals: q.subtotals || undefined,
            vis_config: q.vis_config || undefined,
            filter_config: q.filter_config || undefined,
            visible_ui_sections: q.visible_ui_sections || undefined,
            dynamic_fields: q.dynamic_fields || undefined,
            client_id: q.client_id || undefined,
            query_timezone: q.query_timezone || undefined
          })
        )
        const json = await sdk.ok(
          sdk.run_query({query_id: query.id, result_format: 'json'})
        )
        const csv = await sdk.ok(
          sdk.run_query({query_id: query.id, result_format: 'csv'})
        )
        expect(query).toBeDefined()
        expect(query.id).toBeDefined()
        expect(query.id).toBeGreaterThan(0)
        expect(json).toBeDefined()
        expect(json.length).toEqual(10)
        const row = json[0] as any
        if (query.fields) {
          query.fields.forEach(field => {
            expect(row.hasOwnProperty(field)).toBeTruthy()
          })
        }
        expect(csv).toBeDefined()
        expect((csv.match(/\n/g) || []).length).toEqual(limit + 1)
      }
      await sdk.userSession.logout()
      expect(sdk.userSession.isAuthenticated()).toBeFalsy()
    })

    it('run_inline_query', async () => {
      const sdk = new LookerSDK(userSession)
      for (const q of queries) {
        // default the result limit to 10
        const limit = q.limit ? parseInt(q.limit) : 10
        const request: IRequestrun_inline_query = {
          body: {
            model: q.model,
            view: q.view,
            limit: limit.toString(10),
            fields: q.fields || undefined,
            pivots: q.pivots || undefined,
            fill_fields: q.fill_fields || [],
            filters: q.filters || [],
            filter_expression: q.filter_expression || undefined,
            sorts: q.sorts || [],
            column_limit: q.column_limit || undefined,
            total: typeof q.total !== 'undefined' ? q.total : false,
            row_total: q.row_total || undefined,
            subtotals: q.subtotals || undefined,
            vis_config: q.vis_config || undefined,
            filter_config: q.filter_config || undefined,
            visible_ui_sections: q.visible_ui_sections || undefined,
            dynamic_fields: q.dynamic_fields || undefined,
            client_id: q.client_id || undefined,
            query_timezone: q.query_timezone || undefined
          },
          result_format: 'json'
        }
        const json = await sdk.ok(sdk.run_inline_query(request))
        request.result_format = 'csv'
        const csv = await sdk.ok(sdk.run_inline_query(request))
        expect(json).toBeDefined()
        expect(json.length).toEqual(10)
        const row = json[0] as any
        if (q.fields) {
          q.fields.forEach(field => {
            expect(row.hasOwnProperty(field)).toBeTruthy()
          })
        }
        expect(csv).toBeDefined()
        expect((csv.match(/\n/g) || []).length).toEqual(limit + 1)
      }
      await sdk.userSession.logout()
      expect(sdk.userSession.isAuthenticated()).toBeFalsy()
    })
  })
})
