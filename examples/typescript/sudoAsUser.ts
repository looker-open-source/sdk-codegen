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

import { Looker40SDK as LookerSDK } from '@looker/sdk';
import type { IAuthSession } from '@looker/sdk-rtl';
import { NodeSession, NodeSettingsIniFile } from '@looker/sdk-node';
import { rootIni } from './utils';

const localConfig = rootIni();

/** Settings retrieved from the configuration file */
const settings = new NodeSettingsIniFile('', localConfig, 'Looker');

/**
 * Automatic authentication support for the Node SDK
 * Initialized node-based session manager
 */
const session = new NodeSession(settings);

/** Initialized SDK object for the Node runtime */
const sdk = new LookerSDK(session);

/** email matching pattern for searching users */
const emailPattern = 'test%';

/**
 * Find a different user than the specified user
 * @param {number} userId id to exclude from match
 * @param {string} emailPattern email pattern for user search
 * @returns {Promise<undefined | IUser>} Returns the first matched user, or undefined if no match
 */
const anyoneButMe = async (userId: number, emailPattern: string) => {
  const all = await sdk.ok(
    sdk.search_users({ email: emailPattern, page: 1, per_page: 2 })
  );
  if (!all || all.length === 0) {
    console.warn(`No matches for ${emailPattern}`);
    return undefined;
  }
  // find a user who is not the specified user
  const [other] = all
    .filter((u) => u.id !== userId && !u.is_disabled)
    .slice(0, 1);
  return other;
};
(async () => {
  const userFields =
    'id, first_name, last_name, display_name, email, personal_space_id, home_space_id, group_ids, role_ids';
  // retrieve your user account to verify correct credentials
  const me = await sdk.ok(sdk.me(userFields));
  if (!me) {
    console.warn('API authentication failed');
    return;
  }
  console.log({ me });
  const sudoUser = await anyoneButMe(me.id!, emailPattern);
  if (sudoUser) {
    const auth = sdk.authSession as IAuthSession;
    await auth.login(sudoUser.id);
    const sudo = await sdk.ok(sdk.me(userFields));
    console.log({ sudo });
    await sdk.authSession.logout(); // logout of sudo
  }

  await sdk.authSession.logout(); // logout of API session
  if (!sdk.authSession.isAuthenticated()) {
    console.log('Logout successful');
  }
})();
