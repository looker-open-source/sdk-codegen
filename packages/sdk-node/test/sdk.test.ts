/*

 MIT License

 Copyright (c) 2023 Looker Data Sciences, Inc.

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

import { beforeEach, describe, it } from 'node:test';
import { LookerNodeSDK } from '../src';
import * as assert from 'assert';
import type { ILooker40SDK } from '@looker/sdk';
import { Looker40SDK, Looker40SDKStream } from '@looker/sdk';

/** Note, these tests are for the Node test runner because jest has trouble with
 * real calls to node's native fetch functionality
 */

let sdk: ILooker40SDK;

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

beforeEach(() => {
  sdk = LookerNodeSDK.init40();
});

describe('LookerNodeSDK integration tests', () => {
  it('assigns SDK.ApiVersion', () => {
    assert.equal(Looker40SDK.ApiVersion, '4.0');
    assert.equal(Looker40SDKStream.ApiVersion, '4.0');
  });

  it('can login', async () => {
    const user = await sdk.ok(sdk.me());
    assert.ok(Boolean(user.id), 'user id is assigned');
    assert.ok(sdk.authSession.isAuthenticated(), 'not authenticated');
    await sdk.authSession.logout();
    assert.ok(!sdk.authSession.isAuthenticated(), 'logged out');
  });

  describe('regression tests', () => {
    it('create user attribute ', async () => {
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
        assert(false, 'code not reachable');
      } catch (e: any) {
        assert.equal(
          e.message,
          'Validation Failed',
          `message was ${e.message}`
        );
        assert.equal(e.errors.length, 1, 'not just one error');
        assert.match(
          e.errors[0].message,
          /hidden_value_domain_whitelist must be a comma-separated list of urls with optional wildcards/gim
        );
      }
    });
  });

  describe('downloads', () => {
    it('png and svg', async () => {
      const looks = await sdk.ok(sdk.search_looks({ limit: 1 }));
      let type = '';
      let id = '';
      assert.ok(looks, 'looks are found');
      if (looks.length > 0) {
        type = 'look';
        id = looks[0].id!.toString();
      } else {
        const dashboards = await sdk.ok(sdk.search_dashboards({ limit: 1 }));
        assert.ok(dashboards, 'dashboards found');
        if (dashboards.length > 0) {
          type = 'dashboards';
          id = dashboards[0].id!;
        }
      }
      assert.ok(type, 'type defined');
      assert.ok(id, 'id defined');
      const svg = await sdk.ok(
        sdk.content_thumbnail({ type: type, resource_id: id, format: 'svg' })
      );
      assert.ok(svg, 'svg defined');
      assert.match(svg, /^<\?xml/);
      const image = await sdk.ok(
        sdk.content_thumbnail({ type: type, resource_id: id, format: 'png' })
      );
      assert.ok(image, 'image defined');
      assert.equal(mimeType(image), 'image/png');
    });
  });
  describe('automatic authentication for API calls', () => {
    it('me returns the correct result', async () => {
      const actual = await sdk.ok(sdk.me());
      assert.ok(actual, 'me found');
      assert.ok(actual.credentials_api3, 'api creds found');
      assert.ok(actual.credentials_api3!.length > 0, 'api creds assigned');
      await sdk.authSession.logout();
      assert.equal(sdk.authSession.isAuthenticated(), false);
    });

    it('me fields filter', async () => {
      const actual = await sdk.ok(sdk.me('id,first_name,last_name'));
      assert.ok(actual, 'me found');
      assert.ok(actual.id, 'id assigned');
      assert.ok(actual.first_name, 'first_name');
      assert.ok(actual.last_name, 'last_name');
      assert.ok(!actual.display_name, 'display_name undefined');
      assert.ok(!actual.email, 'email undefined');
      assert.ok(!actual.personal_folder_id, 'personal_folder_id undefined');
      await sdk.authSession.logout();
      assert.equal(sdk.authSession.isAuthenticated(), false);
    });
  });

  describe('sudo', () => {
    it('login/logout', async () => {
      const all = await sdk.ok(
        sdk.all_users({
          fields: 'id,is_disabled',
        })
      );
      const apiUser = await sdk.ok(sdk.me());

      // find users who are not the API user
      const others = all
        .filter(u => u.id !== apiUser.id && !u.is_disabled)
        .slice(0, 2);
      assert.equal(others.length, 2);
      if (others.length > 1) {
        // pick two other active users for `sudo` tests
        const [sudoA, sudoB] = others;
        // get auth support for login()
        const auth = sdk.authSession;

        // login as sudoA
        await auth.login(sudoA.id!.toString());
        let sudo = await sdk.ok(sdk.me()); // `me` returns `sudoA` user
        assert.equal(sudo.id, sudoA.id);

        // login as sudoB directly from sudoA
        await auth.login(sudoB.id);
        sudo = await sdk.ok(sdk.me()); // `me` returns `sudoB` user
        assert.equal(sudo.id, sudoB.id);

        // logging out sudo resets to API user
        await auth.logout();
        let user = await sdk.ok(sdk.me()); // `me` returns `apiUser` user
        assert.equal(sdk.authSession.isAuthenticated(), true);
        assert.equal(user.id, apiUser.id);

        // login as sudoA again to test plain `login()` later
        await auth.login(sudoA.id);
        sudo = await sdk.ok(sdk.me());
        assert.equal(sudo.id, sudoA.id);

        // login() without a sudo ID logs in the API user
        await auth.login();
        user = await sdk.ok(sdk.me()); // `me` returns `apiUser` user
        assert.equal(sdk.authSession.isAuthenticated(), true);
        assert.equal(user.id, apiUser.id);
      }
      await sdk.authSession.logout();
      assert.equal(sdk.authSession.isAuthenticated(), false);
    });
  });
});
