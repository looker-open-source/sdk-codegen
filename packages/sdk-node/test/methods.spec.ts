/*

 MIT License

 Copyright (c) 2021 Looker Data Sciences, Inc.

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

import * as fs from 'fs';
import type {
  ICreateQueryTask,
  IDashboard,
  IQuery,
  IRequestCreateDashboardElement,
  IRequestRunInlineQuery,
  IUser,
  IWriteQuery,
} from '@looker/sdk';
import {
  Looker40SDK,
  Looker40SDKStream,
  Looker40SDK as LookerSDK,
  ResultFormat,
  environmentPrefix,
} from '@looker/sdk';
import type { IRawResponse } from '@looker/sdk-rtl';
import {
  ApiConfigMap,
  DelimArray,
  LookerSDKError,
  boolDefault,
  defaultTimeout,
  pageAll,
  pager,
} from '@looker/sdk-rtl';
import {
  LookerNodeSDK,
  NodeSession,
  NodeSettings,
  NodeSettingsIniFile,
  readIniConfig,
} from '../src';
import { TestConfig } from '../../sdk-rtl/src/testUtils';

const envKey = ApiConfigMap(environmentPrefix);
const strLookerBaseUrl = envKey.base_url;
const strLookerClientId = envKey.client_id;
const strLookerClientSecret = envKey.client_secret;
const strLookerTimeout = envKey.timeout;
const strLookerVerifySsl = envKey.verify_ssl;
const config = TestConfig();
const users: Partial<IUser>[] = config.testData.users;
const queries: Partial<IQuery>[] = config.testData.queries_system_activity;
const dashboards: any[] = config.testData.dashboards;
const emailDomain = '@foo.com';
const testTimeout = 36000000; // 1 hour
const fifteen = 15000; // 15 seconds

const mimeType = (data: string) => {
  //        var sig = [UInt8](repeating: 0, count: 20)
  //        data.copyBytes(to: &sig, count: 20)
  //        print(sig)
  const b = data.charCodeAt(0);
  switch (b) {
    case 0xff:
      return 'image/jpg';
    case 0x89:
      return 'image/png';
    case 0x47:
      return 'image/gif';
    case 0x4d:
    case 0x49:
      return 'image/tiff';
    case 0x25:
      return 'application/pdf';
    case 0xd0:
      return 'application/vnd';
    case 0x46:
      return 'text/plain';
    default:
      return 'application/octet-stream';
  }
};

describe('LookerNodeSDK', () => {
  beforeAll(() => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  });

  const settings = new NodeSettingsIniFile(
    environmentPrefix,
    config.localIni,
    'Looker'
  );
  const session = new NodeSession(settings);

  const createQueryRequest = (q: any, limit: number) => {
    const result: Partial<IWriteQuery> = {
      client_id: q.client_id || undefined,
      column_limit: q.column_limit || undefined,
      dynamic_fields: q.dynamic_fields || undefined,
      fields: q.fields || undefined,
      fill_fields: q.fill_fields || [],
      filter_config: q.filter_config || undefined,
      filter_expression: q.filter_expression || undefined,
      filters: q.filters || [],
      limit: limit.toString(10),
      model: q.model,
      pivots: q.pivots || undefined,
      query_timezone: q.query_timezone || undefined,
      row_total: q.row_total || undefined,
      sorts: q.sorts || [],
      subtotals: q.subtotals || undefined,
      total: typeof q.total !== 'undefined' ? q.total : false,
      view: q.view,
      vis_config: q.vis_config || undefined,
      visible_ui_sections: q.visible_ui_sections || undefined,
    };
    return result;
  };

  const createTestUsers = async () => {
    const sdk = new LookerSDK(session);
    // Ensure all test users are populated and enabled
    let user: IUser;
    // create test users
    for (const u of users) {
      let searched = await sdk.ok(
        sdk.search_users({ first_name: u.first_name, last_name: u.last_name })
      );
      if (searched.length === 0) {
        // Look for disabled user
        searched = await sdk.ok(
          sdk.search_users({
            first_name: u.first_name,
            is_disabled: true,
            last_name: u.last_name,
          })
        );
        for (const user of searched) {
          // enable user if found
          await sdk.ok(sdk.update_user(user.id!, { is_disabled: false }));
        }
      }
      if (searched.length === 0) {
        // create missing user record
        user = await sdk.ok(
          sdk.create_user({
            first_name: u.first_name,
            is_disabled: false,
            last_name: u.last_name,
            locale: 'en',
          })
        );
      } else {
        user = searched[0];
      }
      if (!user.credentials_email) {
        // Ensure email credentials are created
        const email =
          `${u.first_name}.${u.last_name}${emailDomain}`.toLocaleLowerCase();
        await sdk.ok(sdk.create_user_credentials_email(user.id!, { email }));
        user = await sdk.ok(sdk.user(user.id!));
      }
    }
    await sdk.authSession.logout();
  };

  const removeTestUsers = async () => {
    // Clean up any test users that may exist
    const sdk = new LookerSDK(session);
    for (const u of users) {
      let searched = await sdk.ok(
        sdk.search_users({ first_name: u.first_name, last_name: u.last_name })
      );
      if (searched.length === 0) {
        searched = await sdk.ok(
          sdk.search_users({
            first_name: u.first_name,
            is_disabled: true,
            last_name: u.last_name,
          })
        );
      }
      if (searched.length > 0) {
        for (const user of searched) {
          await sdk.ok(sdk.delete_user(user.id!));
        }
      }
    }
    await sdk.authSession.logout();
  };

  const removeTestDashboards = async () => {
    // Clean up any test users that may exist
    const sdk = new LookerSDK(session);
    for (const d of dashboards) {
      const searched = await sdk.ok(sdk.search_dashboards({ title: d.title }));
      if (searched.length > 0) {
        for (const dashboard of searched) {
          await sdk.ok(sdk.delete_dashboard(dashboard.id!));
        }
      }
    }
    await sdk.authSession.logout();
  };

  it('assigns SDK.ApiVersion', () => {
    expect(Looker40SDK.ApiVersion).toEqual('4.0');
    expect(Looker40SDKStream.ApiVersion).toEqual('4.0');
  });

  describe('issue-related tests', () => {
    it('create_user_attribute options', async () => {
      // Reported in #544
      // WriteUserAttribute(name=git_username, label=Git Username, type=string, default_value=, value_is_hidden=false, user_can_view=true, user_can_edit=true, hidden_value_domain_whitelist=null)
      const sdk = new LookerSDK(session);
      try {
        const attrib = await sdk.ok(
          sdk.create_user_attribute({
            name: 'git_username',
            label: 'Git Username',
            type: 'string',
            default_value: undefined,
            value_is_hidden: false,
            user_can_edit: true,
            user_can_view: true,
            hidden_value_domain_whitelist: '',
          })
        );
        // We shouldn't get here but if we do, delete the test attribute
        await sdk.ok(sdk.delete_user_attribute(attrib.id!));
      } catch (e: any) {
        // Using this instead of `rejects.toThrowError` because that pattern fails to match valid RegEx condition
        expect(e.message).toMatch(
          /hidden_value_domain_whitelist must be a comma-separated list of urls with optional wildcards/gim
        );
      }
    });
  });

  describe('downloads', () => {
    it(
      'png and svg',
      async () => {
        const sdk = new LookerSDK(session);
        const looks = await sdk.ok(sdk.search_looks({ limit: 1 }));
        let type = '';
        let id = '';
        expect(looks).toBeDefined();
        if (looks.length > 0) {
          type = 'look';
          id = looks[0].id!.toString();
        } else {
          const dashboards = await sdk.ok(sdk.search_dashboards({ limit: 1 }));
          expect(dashboards).toBeDefined();
          if (dashboards.length > 0) {
            type = 'dashboards';
            id = dashboards[0].id!;
          }
        }
        expect(type).toBeDefined();
        expect(id).toBeDefined();
        const image = await sdk.ok(
          sdk.content_thumbnail({ type: type, resource_id: id, format: 'png' })
        );
        expect(image).toBeDefined();
        expect(mimeType(image)).toEqual('image/png');
        const svg = await sdk.ok(
          sdk.content_thumbnail({ type: type, resource_id: id, format: 'svg' })
        );
        expect(svg).toBeDefined();
        expect(svg).toMatch(/^<\?xml/);
      },
      testTimeout
    );
  });

  describe('PUT smoke test', () => {
    it(
      'set default color collection',
      async () => {
        const sdk = new LookerSDK(session);
        const current = await sdk.ok(sdk.default_color_collection());
        expect(current).toBeDefined();
        const cols = await sdk.ok(sdk.all_color_collections());
        const other = cols.find((c) => c.id !== current.id);
        expect(other).toBeDefined();
        // tests to stop lint from complaining
        if (other && other.id && current.id) {
          const actual = await sdk.ok(
            sdk.set_default_color_collection(other.id)
          );
          expect(actual).toBeDefined();
          expect(actual.id).toEqual(other.id);
          const updated = await sdk.ok(sdk.default_color_collection());
          expect(updated.id).toEqual(actual.id);
          await sdk.ok(sdk.set_default_color_collection(current.id));
        }
      },
      fifteen
    );
  });

  describe('automatic authentication for API calls', () => {
    it('me returns the correct result', async () => {
      const sdk = new LookerSDK(session);
      const actual = await sdk.ok(sdk.me());
      expect(actual).toBeDefined();
      expect(actual.credentials_api3).toBeDefined();
      expect(actual.credentials_api3!.length).toBeGreaterThan(0);
      await sdk.authSession.logout();
      expect(sdk.authSession.isAuthenticated()).toBeFalsy();
    });

    it('me fields filter', async () => {
      const sdk = new LookerSDK(session);
      const actual = await sdk.ok(sdk.me('id,first_name,last_name'));
      expect(actual).toBeDefined();
      expect(actual.id).toBeDefined();
      expect(actual.first_name).toBeDefined();
      expect(actual.last_name).toBeDefined();
      expect(actual.display_name).toBeUndefined();
      expect(actual.email).toBeUndefined();
      expect(actual.personal_folder_id).toBeUndefined();
      await sdk.authSession.logout();
      expect(sdk.authSession.isAuthenticated()).toBeFalsy();
    });
  });

  describe('sudo', () => {
    it(
      'login/logout',
      async () => {
        const sdk = new LookerSDK(session);
        const all = await sdk.ok(
          sdk.all_users({
            fields: 'id,is_disabled',
          })
        );
        const apiUser = await sdk.ok(sdk.me());

        // find users who are not the API user
        const others = all
          .filter((u) => u.id !== apiUser.id && !u.is_disabled)
          .slice(0, 2);
        expect(others.length).toEqual(2);
        if (others.length > 1) {
          // pick two other active users for `sudo` tests
          const [sudoA, sudoB] = others;
          // get auth support for login()
          const auth = sdk.authSession;

          // login as sudoA
          await auth.login(sudoA.id!.toString());
          let sudo = await sdk.ok(sdk.me()); // `me` returns `sudoA` user
          expect(sudo.id).toEqual(sudoA.id);

          // login as sudoB directly from sudoA
          await auth.login(sudoB.id);
          sudo = await sdk.ok(sdk.me()); // `me` returns `sudoB` user
          expect(sudo.id).toEqual(sudoB.id);

          // logging out sudo resets to API user
          await auth.logout();
          let user = await sdk.ok(sdk.me()); // `me` returns `apiUser` user
          expect(sdk.authSession.isAuthenticated()).toEqual(true);
          expect(user).toEqual(apiUser);

          // login as sudoA again to test plain `login()` later
          await auth.login(sudoA.id);
          sudo = await sdk.ok(sdk.me());
          expect(sudo.id).toEqual(sudoA.id);

          // login() without a sudo ID logs in the API user
          await auth.login();
          user = await sdk.ok(sdk.me()); // `me` returns `apiUser` user
          expect(sdk.authSession.isAuthenticated()).toEqual(true);
          expect(user.id).toEqual(apiUser.id);
        }
        await sdk.authSession.logout();
        expect(sdk.authSession.isAuthenticated()).toEqual(false);
      },
      testTimeout
    );
  });

  describe('retrieves collections', () => {
    it('search_looks returns looks', async () => {
      const sdk = new LookerSDK(session);
      const actual = await sdk.ok(sdk.search_looks({}));
      expect(actual).toBeDefined();
      expect(actual.length).toBeGreaterThan(0);
      const look = actual[0];
      expect(look.title).toBeDefined();
      await sdk.authSession.logout();
      expect(sdk.authSession.isAuthenticated()).toBeFalsy();
    });

    it('search_looks fields filter', async () => {
      const sdk = new LookerSDK(session);
      const actual = await sdk.ok(
        sdk.search_looks({ fields: 'id,title,description' })
      );
      expect(actual).toBeDefined();
      expect(actual.length).toBeGreaterThan(0);
      const look = actual[0];
      expect(look.id).toBeDefined();
      expect(look.title).toBeDefined();
      expect(look.description).toBeDefined();
      expect(look.created_at).not.toBeDefined();
      await sdk.authSession.logout();
      expect(sdk.authSession.isAuthenticated()).toBeFalsy();
    });

    it(
      'search_looks fields and title',
      async () => {
        const sdk = new LookerSDK(session);
        const looks = await sdk.ok(sdk.all_looks('id,title'));
        expect(looks).not.toHaveLength(0);
        const expected = looks[0];
        const actual = await sdk.ok(
          sdk.search_looks({
            fields: 'id,title',
            title: expected.title,
          })
        );
        expect(actual).toBeDefined();
        expect(actual.length).toBeGreaterThanOrEqual(1);
        const look = actual[0];
        expect(look.id).toBeDefined();
        expect(look.title).toBeDefined();
        expect(look.title).toEqual(expected.title);
        expect(look.description).not.toBeDefined();
        await sdk.authSession.logout();
        expect(sdk.authSession.isAuthenticated()).toBeFalsy();
      },
      fifteen
    );
  });

  describe('User CRUD-it checks', () => {
    beforeAll(async () => {
      await removeTestUsers();
    }, testTimeout);

    afterAll(async () => {
      await removeTestUsers();
      // await removeTestQueries()
    });

    it(
      'create, update, and delete user',
      async () => {
        const sdk = new LookerSDK(session);
        for (const u of users) {
          let user = await sdk.ok(
            sdk.create_user({
              first_name: u.first_name,
              is_disabled: false,
              last_name: u.last_name,
              locale: 'fr',
            })
          );
          expect(user).toBeDefined();
          expect(user.first_name).toEqual(u.first_name);
          expect(user.last_name).toEqual(u.last_name);
          expect(user.is_disabled).toEqual(false);
          expect(user.locale).toEqual('fr');
          const actual = await sdk.ok(
            sdk.update_user(user.id!, {
              is_disabled: true,
              locale: 'en',
            })
          );
          expect(actual.is_disabled).toEqual(true);
          expect(actual.locale).toEqual('en');
          // Ensure update *only* updates what it's supposed to
          expect(actual.last_name).toEqual(user.last_name);
          expect(actual.first_name).toEqual(user.first_name);
          user = await sdk.ok(
            sdk.update_user(user.id!, {
              is_disabled: false,
              locale: 'en',
            })
          );
          expect(user.is_disabled).toEqual(false);
          const email =
            `${u.first_name}.${u.last_name}${emailDomain}`.toLocaleLowerCase();
          const creds = await sdk.ok(
            sdk.create_user_credentials_email(user.id!, { email: email })
          );
          expect(creds.email).toEqual(email);
          const result = await sdk.ok(sdk.delete_user(user.id!));
          expect(result).toEqual('');
        }
        await sdk.authSession.logout();
        expect(sdk.authSession.isAuthenticated()).toBeFalsy();
      },
      testTimeout
    );
  });

  describe('User searches', () => {
    beforeAll(async () => {
      await removeTestUsers();
      await createTestUsers();
    }, testTimeout);

    it('bad search returns no results', async () => {
      const sdk = new LookerSDK(session);
      const actual = await sdk.ok(
        sdk.search_users({ first_name: 'Bad', last_name: 'News' })
      );
      expect(actual.length).toEqual(0);
      await sdk.authSession.logout();
    });

    it(
      'matches email domain',
      async () => {
        const sdk = new LookerSDK(session);
        const actual = await sdk.ok(
          sdk.search_users_names({
            pattern: `%${emailDomain}`,
          })
        );
        expect(actual.length).toEqual(users.length);
        await sdk.authSession.logout();
      },
      testTimeout
    );

    it(
      'csv user id list aka DelimArray',
      async () => {
        const sdk = new LookerSDK(session);
        const searched = await sdk.ok(
          sdk.search_users_names({
            pattern: `%${emailDomain}`,
          })
        );
        expect(searched.length).toEqual(users.length);
        const ids = new DelimArray<string>(searched.map((u) => u.id!));
        const all = await sdk.ok(sdk.all_users({ ids }));
        expect(all.length).toEqual(users.length);
        await sdk.authSession.logout();
      },
      testTimeout
    );

    it(
      'matches email domain and returns sorted',
      async () => {
        const lastFirst = users.sort((a: Partial<IUser>, b: Partial<IUser>) =>
          `${a.last_name} ${a.first_name}`.localeCompare(
            `${b.last_name} ${b.first_name}`
          )
        );
        const firstLast = users.sort((a: Partial<IUser>, b: Partial<IUser>) =>
          `${a.first_name} ${a.last_name}`.localeCompare(
            `${b.first_name} ${b.last_name}`
          )
        );
        const sdk = new LookerSDK(session);
        let actual = await sdk.ok(
          sdk.search_users_names({
            pattern: `%${emailDomain}`,
            sorts: 'last_name,first_name',
          })
        );
        expect(actual.length).toEqual(users.length);
        for (let i = 0; i < users.length; i++) {
          expect(actual[i].first_name).toEqual(lastFirst[i].first_name);
          expect(actual[i].last_name).toEqual(lastFirst[i].last_name);
        }
        actual = await sdk.ok(
          sdk.search_users_names({
            pattern: `%${emailDomain}`,
            sorts: 'first_name,last_name',
          })
        );
        expect(actual.length).toEqual(users.length);
        for (let i = 0; i < users.length; i++) {
          expect(actual[i].first_name).toEqual(firstLast[i].first_name);
          expect(actual[i].last_name).toEqual(firstLast[i].last_name);
        }

        await sdk.authSession.logout();
      },
      testTimeout
    );
  });

  describe('Datagroups', () => {
    it(
      'gets all datagroups',
      async () => {
        const sdk = new LookerSDK(session);
        const datagroups = await sdk.ok(sdk.all_datagroups());
        expect(datagroups).toBeDefined();
        expect(datagroups.length).not.toEqual(0);
      },
      testTimeout
    );
  });

  describe('Types with enums', () => {
    it('CreateQueryTask serializes and deserializes', () => {
      let task: ICreateQueryTask = {
        query_id: '1',
        result_format: ResultFormat.inline_json,
        dashboard_id: '1',
        source: 'local',
      };
      let json = JSON.stringify(task);
      let actual: ICreateQueryTask = JSON.parse(json);
      expect(actual).toEqual(task);
      task = {
        query_id: '1',
        result_format: 'inline_json' as ResultFormat,
        dashboard_id: '1',
        source: 'local',
      };
      json = JSON.stringify(task);
      actual = JSON.parse(json);
      expect(actual).toEqual(task);
    });
  });

  // TODO remove skip when 21.12 is available
  describe.skip('paging alpha', () => {
    describe('pager', () => {
      test(
        'getRel can override limit and offset',
        async () => {
          const sdk = new LookerSDK(session);
          const limit = 2;
          const all = await sdk.ok(sdk.search_dashboards({ fields: 'id' }));
          const paged = await pager(sdk, () =>
            sdk.search_dashboards({ fields: 'id', limit })
          );
          const full = await sdk.ok(paged.getRel('first', all.length));
          expect(full).toEqual(all);
        },
        testTimeout
      );
      test(
        'observers can be chained',
        async () => {
          const sdk = new LookerSDK(session);
          const limit = 2;
          let hooked = false;
          const hook = (response: IRawResponse) => {
            hooked = true;
            return response;
          };
          sdk.authSession.transport.observer = hook;
          await pager(sdk, () =>
            sdk.search_dashboards({ fields: 'id', limit })
          );
          sdk.authSession.transport.observer = undefined;
          expect(hooked).toEqual(true);
        },
        testTimeout
      );
    });
    describe('pageAll', () => {
      test(
        'search_dashboard',
        async () => {
          const sdk = new LookerSDK(session);
          // Use a small limit to test paging for a small number of dashboards
          const limit = 2;
          let count = 0;
          let actual: IDashboard[] = [];
          const aggregate = (page: IDashboard[]) => {
            console.log(`Page ${++count} has ${page.length} items`);
            actual = actual.concat(page);
            return page;
          };
          const paged = await pageAll(
            sdk,
            () => sdk.search_dashboards({ fields: 'id,title', limit }),
            aggregate
          );
          expect(paged.limit).toEqual(limit);
          expect(paged.more()).toEqual(false);

          const all = await sdk.ok(
            sdk.search_dashboards({ fields: 'id, title' })
          );
          expect(actual.length).toEqual(all.length);
          expect(actual).toEqual(all);
        },
        testTimeout
      );
      test(
        'all_dashboards pageAll returns non-paged results',
        async () => {
          const sdk = new LookerSDK(session);
          // Use a small limit to test paging for a small number of dashboards
          let count = 0;
          let actual: IDashboard[] = [];
          const aggregate = (page: IDashboard[]) => {
            console.log(`Page ${++count} has ${page.length} items`);
            actual = actual.concat(page);
            return page;
          };
          const paged = await pageAll(
            sdk,
            () => sdk.all_dashboards('id,title'),
            aggregate
          );
          expect(paged.limit).toEqual(-1);
          expect(paged.more()).toEqual(false);

          const all = await sdk.ok(sdk.all_dashboards('id, title'));
          expect(actual.length).toEqual(all.length);
          expect(actual).toEqual(all);
        },
        testTimeout
      );
    });
  });

  describe('Query calls', () => {
    it(
      'create and run query',
      async () => {
        const sdk = new LookerSDK(session);
        for (const q of queries) {
          // default the result limit to 10
          const limit = q.limit ? parseInt(q.limit, 10) : 10;
          const request = createQueryRequest(q, limit);
          const query = await sdk.ok(sdk.create_query(request));
          expect(query).toBeDefined();
          expect(query.id).toBeDefined();
          expect(String(query.id).length).toBeGreaterThan(0);
          if (query && query.id) {
            const sql = await sdk.ok(
              sdk.run_query({ query_id: query.id, result_format: 'sql' })
            );
            expect(sql).toContain('SELECT');
            if (query.fields) {
              query.fields.forEach((field) => {
                expect(sql).toContain(field);
              });
            }

            const json = await sdk.ok(
              sdk.run_query({ query_id: query.id, result_format: 'json' })
            );
            const csv = await sdk.ok(
              sdk.run_query({ query_id: query.id, result_format: 'csv' })
            );
            expect(json).toBeDefined();
            expect(json.length).toBeGreaterThan(0);
            expect(json.length).toBeLessThanOrEqual(limit);
            const row = json[0] as any;
            if (query.fields) {
              query.fields.forEach((field) => {
                expect(field in row).toBeTruthy();
              });
            }
            expect(csv).toBeDefined();
            const matches = (csv.match(/\n/g) || []).length;
            expect(matches).toBeGreaterThan(0);
            expect(matches).toBeLessThanOrEqual(limit + 1);
          }
        }
        await sdk.authSession.logout();
        expect(sdk.authSession.isAuthenticated()).toBeFalsy();
      },
      testTimeout
    );

    it(
      'run_inline_query',
      async () => {
        const sdk = new LookerSDK(session);
        let streamed = false;
        for (const q of queries) {
          // default the result limit to 10
          const limit = q.limit ? parseInt(q.limit, 10) : 10;
          const request: IRequestRunInlineQuery = {
            body: {
              client_id: q.client_id || undefined,
              column_limit: q.column_limit || undefined,
              dynamic_fields: q.dynamic_fields || undefined,
              fields: q.fields || undefined,
              fill_fields: q.fill_fields || [],
              filter_config: q.filter_config || undefined,
              filter_expression: q.filter_expression || undefined,
              filters: q.filters,
              limit: limit.toString(10),
              model: q.model!,
              pivots: q.pivots || undefined,
              query_timezone: q.query_timezone || undefined,
              row_total: q.row_total || undefined,
              sorts: q.sorts || [],
              subtotals: q.subtotals || undefined,
              total: typeof q.total !== 'undefined' ? q.total : false,
              view: q.view!,
              vis_config: q.vis_config || undefined,
              visible_ui_sections: q.visible_ui_sections || undefined,
            },
            result_format: 'json',
          };
          const json = await sdk.ok(sdk.run_inline_query(request));
          expect(json).toBeDefined();
          expect(json.length).toBeGreaterThan(0);
          expect(json.length).toBeLessThanOrEqual(limit);
          const row = json[0] as any;
          if (q.fields) {
            q.fields.forEach((field: string) => {
              expect(field in row).toBeTruthy();
            });
          }
          request.result_format = 'csv';
          const csv = await sdk.ok(sdk.run_inline_query(request));
          expect(csv).toBeDefined();
          // Check the number of rows returned from the CSV response
          const matches = (csv.match(/\n/g) || []).length;
          expect(matches).toBeGreaterThan(0);
          expect(matches).toBeLessThanOrEqual(limit + 1);
          if (!streamed) {
            // Only test the first query for streaming support to avoid redundant long processes
            streamed = true;
            const csvFile = './query.csv';
            const writer = fs.createWriteStream(csvFile);
            const sdkStream = new Looker40SDKStream(sdk.authSession);
            await sdkStream.run_inline_query(async (readable: Readable) => {
              return new Promise<any>((resolve, reject) => {
                readable.pipe(writer).on('error', reject).on('finish', resolve);
              });
            }, request);
            expect(fs.existsSync(csvFile)).toEqual(true);
            const contents = fs.readFileSync(csvFile, 'utf8');
            fs.unlinkSync(csvFile);
            expect(fs.existsSync(csvFile)).toEqual(false);
            expect(contents).toEqual(csv);
          }
        }
        await sdk.authSession.logout();
        expect(sdk.authSession.isAuthenticated()).toBeFalsy();
      },
      testTimeout
    );

    it(
      'parses a query with no results',
      async () => {
        const sdk = new LookerSDK(session);
        const query = await sdk.ok(
          sdk.create_query({
            model: 'system__activity',
            view: 'dashboard',
            limit: '2',
            fields: ['dashboard.id', 'dashboard.title'],
            filters: { 'dashboard.id': '-1' },
          })
        );
        expect(query).toBeDefined();
        expect(query.id).toBeDefined();
        for (const format of ['csv', 'json', 'json_detail', 'txt', 'md']) {
          let failed = '';
          try {
            const live = await sdk.ok(
              sdk.run_query({ query_id: query.id!, result_format: format })
            );
            const cached = await sdk.ok(
              sdk.run_query({
                query_id: query.id!,
                result_format: format,
                cache: true,
              })
            );
            expect(live).not.toEqual('{}');
            expect(cached).not.toEqual('{}');
          } catch (e: any) {
            failed = e.message;
          }
          expect(failed).toEqual('');
        }
        await sdk.authSession.logout();
      },
      testTimeout
    );
  });

  describe('Dashboard endpoints', () => {
    const getQueryId = (qhash: { [id: string]: IQuery }, id: any) => {
      if (!id) return id;
      if (id.startsWith('#')) id = id.substr(1);
      else return id;
      const result = qhash[id];
      if (result) return result.id;
      // default to first query. test data is bad
      return qhash[Object.keys(qhash)[0]].id;
    };

    beforeAll(async () => {
      // test dashboards are removed here, but not in top-level tear-down because
      // we may want to view them after the test
      await removeTestDashboards();
    }, testTimeout);

    it('search_dashboards', async () => {
      const sdk = new LookerSDK(session);
      const list = await sdk.ok(sdk.search_dashboards({ limit: 1 }));
      expect(list).toBeDefined();
      expect(list).toHaveLength(1);
      expect(list[0].created_at).toBeDefined();
    });

    it(
      'create and update dashboard',
      async () => {
        const sdk = new LookerSDK(session);
        const me = await sdk.ok(sdk.me());
        const qhash: { [id: string]: IQuery } = {};
        let qcount = 0;
        // create query hash
        for (const q of queries) {
          qcount++;
          const limit = q.limit ? parseInt(q.limit, 10) : 10;
          const request = createQueryRequest(q, limit);
          qhash[q.id || qcount.toString()] = await sdk.ok(
            sdk.create_query(request)
          );
        }
        let dashboard;
        for (const d of dashboards) {
          if (!d.title) continue;
          [dashboard] = await sdk.ok(sdk.search_dashboards({ title: d.title }));
          if (dashboard) continue;
          dashboard = await sdk.ok(
            sdk.create_dashboard({
              background_color: d.background_color || undefined,
              description: d.description || undefined,
              // assign the folder if it's not specified
              folder_id:
                d.folder_id || (d.folder ? undefined : me.home_folder_id),

              hidden: typeof d.hidden === 'undefined' ? undefined : d.hidden,

              load_configuration: d.load_configuration || undefined,

              lookml_link_id: d.lookml_link_id || undefined,

              query_timezone: d.query_timezone || undefined,

              refresh_interval: d.refresh_interval || undefined,

              show_filters_bar:
                typeof d.show_filters_bar === 'undefined'
                  ? undefined
                  : d.show_filters_bar,

              show_title:
                typeof d.show_title === 'undefined' ? undefined : d.show_title,

              slug: d.slug || undefined,

              text_tile_text_color: d.text_tile_text_color || undefined,
              tile_background_color: d.tile_background_color || undefined,
              tile_text_color: d.tile_text_color || undefined,
              title: d.title || undefined,
              title_color: d.title_color || undefined,
            })
          );
          expect(dashboard).toBeDefined();
          expect(dashboard.title).toEqual(d.title);
          if (d.background_color) {
            expect(dashboard.background_color).toEqual(d.background_color);
          }
          if (d.text_tile_text_color) {
            expect(dashboard.text_tile_text_color).toEqual(
              d.text_tile_text_color
            );
          }
          if (d.tile_background_color) {
            expect(dashboard.tile_background_color).toEqual(
              d.tile_background_color
            );
          }
          if (d.tile_text_color) {
            expect(dashboard.tile_text_color).toEqual(d.tile_text_color);
          }
          if (d.title_color) {
            expect(dashboard.title_color).toEqual(d.title_color);
          }
          const actual = await sdk.ok(
            sdk.update_dashboard(dashboard.id!, {
              deleted: true,
            })
          );
          expect(actual.deleted).toEqual(true);
          // Ensure update *only* updates what it's supposed to
          expect(actual.title).toEqual(dashboard.title);
          dashboard = await sdk.ok(
            sdk.update_dashboard(dashboard.id!, {
              deleted: false,
            })
          );
          expect(dashboard.deleted).toEqual(false);
          for (const f of d.filters) {
            const filter = await sdk.ok(
              sdk.create_dashboard_filter({
                allow_multiple_values: f.allow_multiple_values,
                dashboard_id: dashboard.id,
                default_value: f.default_value,
                dimension: f.dimension,
                explore: f.explore,
                model: f.model,
                name: f.name,
                row: f.row,
                title: f.title,
                type: f.type,
              })
            );
            expect(filter).toBeDefined();
            expect(filter.name).toEqual(f.name);
            expect(filter.title).toEqual(f.title);
            expect(filter.row).toEqual(f.row);
            expect(filter.type).toEqual(f.type);
            expect(filter.model).toEqual(f.model);
            expect(filter.explore).toEqual(f.explore);
            expect(filter.dimension).toEqual(f.dimension);
            expect(filter.allow_multiple_values).toEqual(
              f.allow_multiple_values
            );
            expect(filter.default_value).toEqual(f.default_value);
          }

          for (const t of d.tiles) {
            const request: IRequestCreateDashboardElement = {
              body: {
                body_text: t.body_text,
                dashboard_id: dashboard.id,
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
              },
            };
            const tile = await sdk.ok(sdk.create_dashboard_element(request));
            expect(tile).toBeDefined();
            expect(tile.dashboard_id).toEqual(dashboard.id);
            expect(tile.title).toEqual(t.title);
            expect(tile.type).toEqual(t.type);
          }
        }
        await sdk.authSession.logout();
        expect(sdk.authSession.isAuthenticated()).toBeFalsy();
      },
      testTimeout
    );
  });

  describe('Theme', () => {
    it('validate_theme returns ok on valid template', async () => {
      const sdk = new LookerSDK(session);
      const result = await sdk.ok(
        sdk.validate_theme({
          name: 'validTemplate',
          settings: {
            show_filters_bar: false,
            show_title: false,
            tile_shadow: false,
            font_family: 'Arial',
          },
        })
      );
      expect(result).toBeDefined();
      expect(result).toEqual('');
    });

    it('validate_theme throws error with details', async () => {
      const sdk = new LookerSDK(session);
      try {
        await sdk.ok(
          sdk.validate_theme({
            settings: {
              show_filters_bar: false,
              show_title: false,
              tile_shadow: false,
              font_family: 'Arial;',
            },
          })
        );
      } catch (e: any) {
        expect(e).toBeInstanceOf(LookerSDKError);
        expect(e.message).toBeDefined();
        expect(e.errors).toBeDefined();
        expect(e.errors).toHaveLength(3);
      }
    });
  });

  describe('Node environment', () => {
    beforeAll(() => {
      const section = readIniConfig(
        config.localIni,
        environmentPrefix,
        'Looker'
      );
      const verify_ssl = boolDefault(section.verify_ssl, false).toString();
      // populate environment variables
      process.env[strLookerTimeout] =
        section.timeout || defaultTimeout.toString();
      process.env[strLookerClientId] = section.client_id;
      process.env[strLookerClientSecret] = section.client_secret;
      process.env[strLookerBaseUrl] = section.base_url;
      process.env[strLookerVerifySsl] = verify_ssl.toString();
    });

    afterAll(() => {
      // reset environment variables
      delete process.env[strLookerTimeout];
      delete process.env[strLookerClientId];
      delete process.env[strLookerClientSecret];
      delete process.env[strLookerBaseUrl];
      delete process.env[strLookerVerifySsl];
    });

    it('no INI', async () => {
      const sdk = LookerNodeSDK.init40(new NodeSettings(environmentPrefix));
      const me = await sdk.ok(sdk.me());
      expect(me).not.toBeUndefined();
      expect(me.id).not.toBeUndefined();
      expect(sdk.authSession.isAuthenticated()).toBeTruthy();
      await sdk.authSession.logout();
      expect(sdk.authSession.isAuthenticated()).toBeFalsy();
    });
  });
});
