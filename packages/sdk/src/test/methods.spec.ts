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

import { NodeSession } from '../rtl/nodeSession'
import { Looker40SDK as LookerSDK } from '../sdk/4.0/methods'
import { IQuery, IRequestRunInlineQuery, IUser, IWriteQuery } from '../sdk/4.0/models'
import * as fs from 'fs'
import { ApiConfig, NodeSettings, NodeSettingsIniFile } from '../rtl/nodeSettings'
import { DelimArray } from '../rtl/delimArray'
import { Readable } from 'readable-stream'
import { boolDefault } from '../rtl/constants'
import {
  strLookerBaseUrl,
  strLookerClientId,
  strLookerClientSecret,
  strLookerTimeout,
  strLookerVerifySsl,
} from '../rtl/apiSettings'
import { defaultTimeout } from '../rtl/transport'
import { LookerNodeSDK } from '../rtl/nodeSdk'
import { TestConfig } from '../../../src/script/testUtils'
import { utf8Encoding } from '../../../scripts/src/nodeUtils'

const config = TestConfig()
const users: Partial<IUser>[] = config.testData['users']
const queries: Partial<IQuery>[] = config.testData['queries']
const dashboards: any[] = config.testData['dashboards']
const emailDomain = '@foo.com'
const testTimeout = 36000000 // 1 hour

// /**
//  * Converts a String to an ArrayBuffer.
//  *
//  * @param str - String to convert.
//  * @returns ArrayBuffer.
//  */
// const stringToArrayBuffer = (str: string): ArrayBuffer => {
//   const stringLength = str.length;
//   const buffer = new ArrayBuffer(stringLength)
//   const bufferView = new Uint8Array(buffer)
//   for (let i = 0; i < stringLength; i++) {
//     bufferView[i] = str.charCodeAt(i)
//   }
//   return buffer
// }

// const sleep = async (ms: number) => {
//   return new Promise(resolve  =>{
//     setTimeout(resolve, ms)
//   })
// }
//
// const downloadTile = async (sdk: LookerSDK, tile: IDashboardElement, format: string) => {
//   if (!tile.query_id) {
//     console.error(`Tile ${tile.title} does not have a query`)
//     return
//   }
//   const task = await sdk.ok(sdk.create_query_render_task(tile.query_id, format, 640, 480))
//
//   if (!task || !task.id) {
//     console.error(`Could not create a render task for ${tile.title}`)
//     return
//   }
//
//   // poll the render task until it completes
//   let elapsed = 0.0
//   const delay = 500 // wait .5 seconds
//   while (true) {
//     const poll = await sdk.ok(sdk.render_task(task.id!))
//     if (poll.status === 'failure') {
//       console.log({poll})
//       console.error(`Render failed for ${tile.title}`)
//       return
//     }
//     if (poll.status === 'success') {
//       break
//     }
//     await sleep(delay)
//     console.log(`${elapsed += (delay/1000)} seconds elapsed`)
//   }
//   // IMPORTANT: must set encoding to `null` for binary downloads
//   const result = await sdk.ok(sdk.render_task_results(task.id!, {encoding: null}))
//   const fileName = `${tile.title}.${format}`
//   let failed = false
//   fs.writeFile(fileName, result, 'binary',(err) => {
//       if (err) {
//         failed = true
//         console.error(err)}
//     }
//   )
//   return failed ? undefined : fileName
// }

describe('LookerNodeSDK', () => {
  const settings = new NodeSettingsIniFile(config.localIni, 'Looker')
  const session = new NodeSession(settings)

  const createQueryRequest = (q: any, limit: number) => {
    const result: Partial<IWriteQuery> = {
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
      query_timezone: q.query_timezone || undefined,
    }
    return result
  }

  const createTestUsers = async () => {
    const sdk = new LookerSDK(session)
    // Ensure all test users are populated and enabled
    let user: IUser
    // create test users
    for (const u of users) {
      let searched = await sdk.ok(
        sdk.search_users({first_name: u.first_name, last_name: u.last_name}),
      )
      if (searched.length === 0) {
        // Look for disabled user
        searched = await sdk.ok(
          sdk.search_users({
            first_name: u.first_name,
            last_name: u.last_name,
            is_disabled: true,
          }),
        )
        for (const user of searched) {
          // enable user if found
          await sdk.ok(sdk.update_user(user.id!, {is_disabled: false}))
        }
      }
      if (searched.length === 0) {
        // create missing user record
        user = await sdk.ok(
          sdk.create_user({
              first_name: u.first_name,
              last_name: u.last_name,
              is_disabled: false,
              locale: 'en',
            },
          ),
        )
      } else {
        user = searched[0]
      }
      if (!user.credentials_email) {
        // Ensure email credentials are created
        const email = `${u.first_name}.${u.last_name}${emailDomain}`.toLocaleLowerCase()
        await sdk.ok(
          sdk.create_user_credentials_email(user.id!, {email}),
        )
        user = await sdk.ok(sdk.user(user.id!))
      }
    }
    await sdk.authSession.logout()
  }

  const removeTestUsers = async () => {
    // Clean up any test users that may exist
    const sdk = new LookerSDK(session)
    for (const u of users) {
      let searched = await sdk.ok(
        sdk.search_users({first_name: u.first_name, last_name: u.last_name}),
      )
      if (searched.length === 0) {
        searched = await sdk.ok(
          sdk.search_users({
            first_name: u.first_name,
            last_name: u.last_name,
            is_disabled: true,
          }),
        )
      }
      if (searched.length > 0) {
        for (const user of searched) {
          await sdk.ok(sdk.delete_user(user.id!))
        }
      }
    }
    await sdk.authSession.logout()
  }

  const removeTestDashboards = async () => {
    // Clean up any test users that may exist
    const sdk = new LookerSDK(session)
    for (const d of dashboards) {
      let searched = await sdk.ok(sdk.search_dashboards({title: d.title}))
      if (searched.length > 0) {
        for (const dashboard of searched) {
          await sdk.ok(sdk.delete_dashboard(dashboard.id!))
        }
      }
    }
    await sdk.authSession.logout()
  }

  describe('automatic authentication for API calls', () => {
    it('me returns the correct result', async () => {
      const sdk = new LookerSDK(session)
      const actual = await sdk.ok(sdk.me())
      expect(actual).toBeDefined()
      expect(actual.credentials_api3).toBeDefined()
      expect(actual.credentials_api3!.length).toBeGreaterThan(0)
      await sdk.authSession.logout()
      expect(sdk.authSession.isAuthenticated()).toBeFalsy()
    })

    it('me fields filter', async () => {
      const sdk = new LookerSDK(session)
      const actual = await sdk.ok(sdk.me('id,first_name,last_name'))
      expect(actual).toBeDefined()
      expect(actual.id).toBeDefined()
      expect(actual.first_name).toBeDefined()
      expect(actual.last_name).toBeDefined()
      expect(actual.display_name).toBeUndefined()
      expect(actual.email).toBeUndefined()
      expect(actual.personal_folder_id).toBeUndefined()
      await sdk.authSession.logout()
      expect(sdk.authSession.isAuthenticated()).toBeFalsy()
    })
  })

  describe('sudo', () => {
    it(
      'login/logout',
      async () => {
        const sdk = new LookerSDK(session)
        let all = await sdk.ok(
          sdk.all_users({
            fields: 'id,is_disabled',
          }),
        )
        const apiUser = await sdk.ok(sdk.me())

        // find users who are not the API user
        const others = all
          .filter(u => u.id !== apiUser.id && !u.is_disabled)
          .slice(0, 2)
        expect(others.length).toEqual(2)
        if (others.length > 1) {
          // pick two other active users for `sudo` tests
          const [sudoA, sudoB] = others
          // get auth support for login()
          const auth = sdk.authSession

          // login as sudoA
          await auth.login(sudoA.id!.toString())
          let sudo = await sdk.ok(sdk.me()) // `me` returns `sudoA` user
          expect(sudo.id).toEqual(sudoA.id)

          // login as sudoB directly from sudoA
          await auth.login(sudoB.id)
          sudo = await sdk.ok(sdk.me()) // `me` returns `sudoB` user
          expect(sudo.id).toEqual(sudoB.id)

          // logging out sudo resets to API user
          await auth.logout()
          let user = await sdk.ok(sdk.me()) // `me` returns `apiUser` user
          expect(sdk.authSession.isAuthenticated()).toEqual(true)
          expect(user).toEqual(apiUser)

          // login as sudoA again to test plain `login()` later
          await auth.login(sudoA.id)
          sudo = await sdk.ok(sdk.me())
          expect(sudo.id).toEqual(sudoA.id)

          // login() without a sudo ID logs in the API user
          await auth.login()
          user = await sdk.ok(sdk.me()) // `me` returns `apiUser` user
          expect(sdk.authSession.isAuthenticated()).toEqual(true)
          expect(user.id).toEqual(apiUser.id)
        }
        await sdk.authSession.logout()
        expect(sdk.authSession.isAuthenticated()).toEqual(false)
      },
      testTimeout,
    )
  })

  describe('retrieves collections', () => {
    it('search_looks returns looks', async () => {
      const sdk = new LookerSDK(session)
      const actual = await sdk.ok(sdk.search_looks({}))
      expect(actual).toBeDefined()
      expect(actual.length).toBeGreaterThan(0)
      const look = actual[0]
      expect(look.title).toBeDefined()
      await sdk.authSession.logout()
      expect(sdk.authSession.isAuthenticated()).toBeFalsy()
    })

    it('search_looks fields filter', async () => {
      const sdk = new LookerSDK(session)
      const actual = await sdk.ok(
        sdk.search_looks({fields: 'id,title,description'}),
      )
      expect(actual).toBeDefined()
      expect(actual.length).toBeGreaterThan(0)
      const look = actual[0]
      expect(look.id).toBeDefined()
      expect(look.title).toBeDefined()
      expect(look.description).toBeDefined()
      expect(look.created_at).not.toBeDefined()
      await sdk.authSession.logout()
      expect(sdk.authSession.isAuthenticated()).toBeFalsy()
    })

    it('search_looks fields filter', async () => {
      const sdk = new LookerSDK(session)
      const actual = await sdk.ok(
        sdk.search_looks({
          title: 'Order%',
          fields: 'id,title',
        }),
      )
      expect(actual).toBeDefined()
      expect(actual.length).toBeGreaterThan(1)
      const look = actual[0]
      expect(look.id).toBeDefined()
      expect(look.title).toBeDefined()
      expect(look.title).toContain('Order')
      expect(look.description).not.toBeDefined()
      await sdk.authSession.logout()
      expect(sdk.authSession.isAuthenticated()).toBeFalsy()
    })
  })

  describe('User CRUD-it checks', () => {
    beforeAll(async () => {
      await removeTestUsers()
    }, testTimeout)

    afterAll(async () => {
      await removeTestUsers()
      // await removeTestQueries()
    })

    it(
      'create, update, and delete user',
      async () => {
        const sdk = new LookerSDK(session)
        for (const u of users) {
          let user = await sdk.ok(
            sdk.create_user({
              first_name: u.first_name,
              last_name: u.last_name,
              is_disabled: false,
              locale: 'fr',
            }),
          )
          expect(user).toBeDefined()
          expect(user.first_name).toEqual(u.first_name)
          expect(user.last_name).toEqual(u.last_name)
          expect(user.is_disabled).toEqual(false)
          expect(user.locale).toEqual('fr')
          let actual = await sdk.ok(
            sdk.update_user(user.id!, {
              is_disabled: true,
              locale: 'en',
            }),
          )
          expect(actual.is_disabled).toEqual(true)
          expect(actual.locale).toEqual('en')
          // Ensure update *only* updates what it's supposed to
          expect(actual.last_name).toEqual(user.last_name)
          expect(actual.first_name).toEqual(user.first_name)
          user = await sdk.ok(
            sdk.update_user(user.id!, {
              is_disabled: false,
              locale: 'en',
            }),
          )
          expect(user.is_disabled).toEqual(false)
          const email = `${u.first_name}.${u.last_name}${emailDomain}`.toLocaleLowerCase()
          let creds = await sdk.ok(
            sdk.create_user_credentials_email(user.id!, {email: email}),
          )
          expect(creds.email).toEqual(email)
          const result = await sdk.ok(sdk.delete_user(user.id!))
          expect(result).toEqual('')
        }
        await sdk.authSession.logout()
        expect(sdk.authSession.isAuthenticated()).toBeFalsy()
      },
      testTimeout,
    )
  })

  describe('User searches', () => {
    beforeAll(async () => {
      await removeTestUsers()
      await createTestUsers()
    }, testTimeout)

    it('bad search returns no results', async () => {
      const sdk = new LookerSDK(session)
      let actual = await sdk.ok(
        sdk.search_users({first_name: 'Bad', last_name: 'News'}),
      )
      expect(actual.length).toEqual(0)
      await sdk.authSession.logout()
    })

    it(
      'matches email domain',
      async () => {
        const sdk = new LookerSDK(session)
        let actual = await sdk.ok(
          sdk.search_users_names({
            pattern: `%${emailDomain}`,
          }),
        )
        expect(actual.length).toEqual(users.length)
        await sdk.authSession.logout()
      },
      testTimeout,
    )

    it(
      'csv user id list aka DelimArray',
      async () => {
        const sdk = new LookerSDK(session)
        const searched = await sdk.ok(
          sdk.search_users_names({
            pattern: `%${emailDomain}`,
          }),
        )
        expect(searched.length).toEqual(users.length)
        const ids: DelimArray<number> = new DelimArray<number>(searched.map(u => u.id!))
        const all = await sdk.ok(sdk.all_users({ids}))
        expect(all.length).toEqual(users.length)
        await sdk.authSession.logout()
      },
      testTimeout,
    )

    it(
      'matches email domain and returns sorted',
      async () => {
        const lastFirst = users.sort((a: Partial<IUser>, b: Partial<IUser>) =>
          `${a.last_name} ${a.first_name}`.localeCompare(
            `${b.last_name} ${b.first_name}`,
          ),
        )
        const firstLast = users.sort((a: Partial<IUser>, b: Partial<IUser>) =>
          `${a.first_name} ${a.last_name}`.localeCompare(
            `${b.first_name} ${b.last_name}`,
          ),
        )
        const sdk = new LookerSDK(session)
        let actual = await sdk.ok(
          sdk.search_users_names({
            pattern: `%${emailDomain}`,
            sorts: 'last_name,first_name',
          }),
        )
        expect(actual.length).toEqual(users.length)
        for (let i = 0; i < users.length; i++) {
          expect(actual[i].first_name).toEqual(lastFirst[i].first_name)
          expect(actual[i].last_name).toEqual(lastFirst[i].last_name)
        }
        actual = await sdk.ok(
          sdk.search_users_names({
            pattern: `%${emailDomain}`,
            sorts: 'first_name,last_name',
          }),
        )
        expect(actual.length).toEqual(users.length)
        for (let i = 0; i < users.length; i++) {
          expect(actual[i].first_name).toEqual(firstLast[i].first_name)
          expect(actual[i].last_name).toEqual(firstLast[i].last_name)
        }

        await sdk.authSession.logout()
      },
      testTimeout,
    )
  })

  describe('Datagroups', () => {
    it('gets all datagroups', async () => {
      const sdk = new LookerSDK(session)
      const datagroups = await sdk.ok(sdk.all_datagroups())
      expect(datagroups).toBeDefined()
      expect(datagroups.length).not.toEqual(0)
    }, testTimeout)
  })

  describe('Query calls', () => {
    it(
      'create and run query',
      async () => {
        const sdk = new LookerSDK(session)
        for (const q of queries) {
          // default the result limit to 10
          const limit = q.limit ? parseInt(q.limit, 10) : 10
          const request = createQueryRequest(q, limit)
          const query = await sdk.ok(sdk.create_query(request))
          const sql = await sdk.ok(
            sdk.run_query({query_id: query.id!, result_format: 'sql'}),
          )
          expect(sql).toContain('SELECT')
          if (query.fields) {
            query.fields.forEach(field => {
              expect(sql).toContain(field)
            })
          }

          const json = await sdk.ok(
            sdk.run_query({query_id: query.id!, result_format: 'json'}),
          )
          const csv = await sdk.ok(
            sdk.run_query({query_id: query.id!, result_format: 'csv'}),
          )
          expect(query).toBeDefined()
          expect(query.id).toBeDefined()
          expect(query.id).toBeGreaterThan(0)
          expect(json).toBeDefined()
          expect(json.length).toEqual(limit)
          const row = json[0] as any
          if (query.fields) {
            query.fields.forEach(field => {
              expect(row.hasOwnProperty(field)).toBeTruthy()
            })
          }
          expect(csv).toBeDefined()
          expect((csv.match(/\n/g) || []).length).toEqual(limit + 1)
        }
        await sdk.authSession.logout()
        expect(sdk.authSession.isAuthenticated()).toBeFalsy()
      },
      testTimeout,
    )

    it('run_inline_query',
      async () => {
        const sdk = new LookerSDK(session)
        let streamed = false
        for (const q of queries) {
          // default the result limit to 10
          const limit = q.limit ? parseInt(q.limit, 10) : 10
          const request: IRequestRunInlineQuery = {
            body: {
              model: q.model!,
              view: q.view!,
              limit: limit.toString(10),
              fields: q.fields || undefined,
              pivots: q.pivots || undefined,
              fill_fields: q.fill_fields || [],
              filters: q.filters,
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
              query_timezone: q.query_timezone || undefined,
            },
            result_format: 'json',
          }
          const json = await sdk.ok(sdk.run_inline_query(request))
          expect(json).toBeDefined()
          expect(json.length).toEqual(limit)
          const row = json[0] as any
          if (q.fields) {
            q.fields.forEach((field: string) => {
              expect(row.hasOwnProperty(field)).toBeTruthy()
            })
          }
          request.result_format = 'csv'
          const csv = await sdk.ok(sdk.run_inline_query(request))
          expect(csv).toBeDefined()
          // Check the number of rows returned from the CSV response
          expect((csv.match(/\n/g) || []).length).toEqual(limit + 1)
          if (!streamed) {
            // Only test the first query for streaming support to avoid redundant long processes
            streamed = true
            const csvFile = './query.csv'
            const writer = fs.createWriteStream(csvFile)
            try {
              await sdk.stream.run_inline_query(async (readable: Readable) => {
                return new Promise<any>((resolve, reject) => {
                  readable.pipe(writer)
                    .on('error', reject)
                    .on('finish', resolve)
                })
              }, request)
              expect(fs.existsSync(csvFile)).toEqual(true)
              const contents = fs.readFileSync(csvFile, utf8Encoding)
              fs.unlinkSync(csvFile)
              expect(fs.existsSync(csvFile)).toEqual(false)
              expect(contents).toEqual(csv)
            } catch (e) {
              throw e
            }
            // TODO test binary download
            // request.result_format = 'png'
            // const png = await sdk.ok(sdk.run_inline_query(request))
            // // expect(png instanceof).toEqual(Buffer)
            // const type = FileType(stringToArrayBuffer(png))
            // expect(type).toBeDefined()
            // if (type) {
            //   expect(type.ext).toEqual('png')
            //   expect(type.mime).toEqual('image/png')
            // }
          }
        }
        await sdk.authSession.logout()
        expect(sdk.authSession.isAuthenticated()).toBeFalsy()
      },
      testTimeout,
    )
  })

  describe('Dashboard endpoints', () => {
    const getQueryId = (
      qhash: { [id: string]: IQuery },
      id: any,
    ): number | undefined => {
      if (!id) return id
      if (id.startsWith('#')) id = id.substr(1)
      else return id ? parseInt(id, 10) : undefined
      const result = qhash[id]
      if (result) return result.id
      // default to first query. test data is bad
      return qhash[Object.keys(qhash)[0]].id
    }

    beforeAll(async () => {
      // test dashboards are removed here, but not in top-level tear-down because
      // we may want to view them after the test
      await removeTestDashboards()
    }, testTimeout)

    it('create and update dashboard',
      async () => {
        const sdk = new LookerSDK(session)
        const me = await sdk.ok(sdk.me())
        const qhash: { [id: string]: IQuery } = {}
        let qcount = 0
        // create query hash
        for (const q of queries) {
          qcount++
          const limit = q.limit ? parseInt(q.limit, 10) : 10
          const request = createQueryRequest(q, limit)
          qhash[q.id || qcount.toString()] = await sdk.ok(
            sdk.create_query(request),
          )
        }
        let dashboard
        for (const d of dashboards) {
          if (!d.title) continue
          [dashboard] = await sdk.ok(sdk.search_dashboards({title: d.title}))
          if (dashboard) continue
          dashboard = await sdk.ok(
            sdk.create_dashboard({
              description: d.description || undefined,
              hidden: typeof d.hidden === 'undefined' ? undefined : d.hidden,
              query_timezone: d.query_timezone || undefined,
              refresh_interval: d.refresh_interval || undefined,
              title: d.title || undefined,
              background_color: d.background_color || undefined,
              load_configuration: d.load_configuration || undefined,
              lookml_link_id: d.lookml_link_id || undefined,
              show_filters_bar:
                typeof d.show_filters_bar === 'undefined'
                  ? undefined
                  : d.show_filters_bar,
              show_title:
                typeof d.show_title === 'undefined' ? undefined : d.show_title,
              slug: d.slug || undefined,
              // assign the folder if it's not specified
              folder_id : d.folder_id || (d.folder ? undefined : me.home_folder_id),
              text_tile_text_color: d.text_tile_text_color || undefined,
              tile_background_color: d.tile_background_color || undefined,
              tile_text_color: d.tile_text_color || undefined,
              title_color: d.title_color || undefined,
            }),
          )
          expect(dashboard).toBeDefined()
          expect(dashboard.title).toEqual(d.title)
          if (d.background_color) {
            expect(dashboard.background_color).toEqual(d.background_color)
          }
          if (d.text_tile_text_color) {
            expect(dashboard.text_tile_text_color).toEqual(
              d.text_tile_text_color,
            )
          }
          if (d.tile_background_color) {
            expect(dashboard.tile_background_color).toEqual(
              d.tile_background_color,
            )
          }
          if (d.tile_text_color) {
            expect(dashboard.tile_text_color).toEqual(d.tile_text_color)
          }
          if (d.title_color) {
            expect(dashboard.title_color).toEqual(d.title_color)
          }
          let actual = await sdk.ok(
            sdk.update_dashboard(dashboard.id!, {
              deleted: true,
            }),
          )
          expect(actual.deleted).toEqual(true)
          // Ensure update *only* updates what it's supposed to
          expect(actual.title).toEqual(dashboard.title)
          dashboard = await sdk.ok(
            sdk.update_dashboard(dashboard.id!, {
              deleted: false,
            }),
          )
          expect(dashboard.deleted).toEqual(false)
          for (const f of d.filters) {
            const filter = await sdk.ok(
              sdk.create_dashboard_filter({
                dashboard_id: dashboard.id,
                name: f.name,
                title: f.title,
                row: f.row,
                type: f.type,
                model: f.model,
                explore: f.explore,
                dimension: f.dimension,
                allow_multiple_values: f.allow_multiple_values,
                default_value: f.default_value,
              }),
            )
            expect(filter).toBeDefined()
            expect(filter.name).toEqual(f.name)
            expect(filter.title).toEqual(f.title)
            expect(filter.row).toEqual(f.row)
            expect(filter.type).toEqual(f.type)
            expect(filter.model).toEqual(f.model)
            expect(filter.explore).toEqual(f.explore)
            expect(filter.dimension).toEqual(f.dimension)
            expect(filter.allow_multiple_values).toEqual(
              f.allow_multiple_values,
            )
            expect(filter.default_value).toEqual(f.default_value)
          }

          for (const t of d.tiles) {
            const tile = await sdk.ok(
              sdk.create_dashboard_element({
                body_text: t.body_text,
                dashboard_id: dashboard.id,
                look: t.look,
                look_id: t.look_id,
                merge_result_id: t.merge_result_id,
                note_display: t.note_display,
                note_state: t.note_state,
                note_text: t.note_text,
                query: t.query,
                query_id: getQueryId(qhash, t.query_id),
                refresh_interval: t.refresh_interval,
                // result_maker: {
                //    t.result_maker
                // },
                subtitle_text: t.subtitle_text,
                title: t.title,
                title_hidden: t.title_hidden,
                title_text: t.title_text,
                type: t.type,
              }),
            )
            expect(tile).toBeDefined()
            expect(tile.dashboard_id).toEqual(dashboard.id)
            expect(tile.title).toEqual(t.title)
            expect(tile.type).toEqual(t.type)
          }
          // TODO figure out configuration problems causing dashboard to fail render
          // refresh dashboard
          // dashboard = await sdk.ok(sdk.dashboard(dashboard.id!))
          // if (dashboard.dashboard_elements) {
          //   const [tile] = dashboard.dashboard_elements.filter( t => t.query_id && t.query_id > 0)
          //   expect(tile).toBeDefined()
          //   const file = await downloadTile(sdk, tile, 'png')
          //   expect(file).toBeDefined()
          // }

        }
        await sdk.authSession.logout()
        expect(sdk.authSession.isAuthenticated()).toBeFalsy()
      },
      testTimeout,
    )

  })

  describe('Node environment', () => {
    beforeAll(() => {
      const section = ApiConfig(fs.readFileSync(config.localIni, utf8Encoding))['Looker']
      // tslint:disable-next-line:variable-name
      const verify_ssl = boolDefault(section['verify_ssl'], false).toString()
      // populate environment variables
      process.env[strLookerTimeout] = section['timeout'] || defaultTimeout.toString()
      process.env[strLookerClientId] = section['client_id']
      process.env[strLookerClientSecret] = section['client_secret']
      process.env[strLookerBaseUrl] = section['base_url']
      process.env[strLookerVerifySsl] = verify_ssl.toString()
    })

    afterAll(() => {
      // reset environment variables
      delete process.env[strLookerTimeout]
      delete process.env[strLookerClientId]
      delete process.env[strLookerClientSecret]
      delete process.env[strLookerBaseUrl]
      delete process.env[strLookerVerifySsl]
    })

    it('no INI', async () => {
      const sdk = LookerNodeSDK.init31(new NodeSettings())
      const me = await sdk.ok(sdk.me())
      expect(me).not.toBeUndefined()
      expect(me.id).not.toBeUndefined()
      expect(sdk.authSession.isAuthenticated()).toBeTruthy()
      await sdk.authSession.logout()
      expect(sdk.authSession.isAuthenticated()).toBeFalsy()
    })
  })

  function mimeType(data: String) {

//        var sig = [UInt8](repeating: 0, count: 20)
//        data.copyBytes(to: &sig, count: 20)
//        print(sig)
    const b = data.charCodeAt(0)
    switch (b) {
      case 0xFF:
        return 'image/jpg'
      case 0x89:
        return 'image/png'
      case 0x47:
        return 'image/gif'
      case 0x4D:
      case 0x49:
        return 'image/tiff'
      case 0x25:
        return 'application/pdf'
      case 0xD0:
        return 'application/vnd'
      case 0x46:
        return 'text/plain'
      default:
        return 'application/octet-stream'
    }
  }

  function simpleQuery(): Partial<IWriteQuery> {
    return {
      model: 'system__activity',
      view: 'dashboard',
      fields: ['dashboard.id', 'dashboard.title', 'dashboard.count'],
      limit: '100',
    }
  }

  // TODO resurrect this when the API bug is fixed
  // describe('Binary download', () => {
  //   it('PNG and JPG download', async () => {
  //     const sdk = new LookerSDK(session)
  //     const query = await sdk.ok(sdk.create_query(simpleQuery()))
  //     const png = await sdk.ok(sdk.run_query({query_id: query.id!, result_format: 'png'}))
  //     const jpg = await sdk.ok(sdk.run_query({query_id: query.id!, result_format: 'jpg'}))
  //     expect(mimeType(png)).toEqual('image/png')
  //     expect(mimeType(jpg)).toEqual('image/jpeg') // Houston, we have a problem with jpg being a png
  //   }, testTimeout)
  //
  // })
})
