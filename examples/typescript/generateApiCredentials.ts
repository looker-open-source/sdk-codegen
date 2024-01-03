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
import { LookerNodeSDK } from '@looker/sdk-node';

interface Api3SuccessBody {
  success: boolean;
  usersWithNewCredentials: Array<string>;
}

const sdk = LookerNodeSDK.init40();

const generateApiCredentials = async (
  roleID: string
): Promise<Api3SuccessBody> => {
  // grab all users and return id, credentials_api3, and role_ids parameters
  const usersWithoutCredentials = await sdk.ok(
    sdk.all_users({ fields: 'id, credentials_api3, role_ids' })
  );
  // filter those users for those with no api credentials (ie. empty array) and for those that have the role caller specifies
  const filteredUsers = usersWithoutCredentials.filter(
    u => u.credentials_api3.length === 0 && u.role_ids.includes(roleID)
  );
  const res: Api3SuccessBody = {
    success: true,
    // array holding user with new generated api3 credentials
    usersWithNewCredentials: [],
  };
  for (const user of filteredUsers) {
    try {
      // pass empty body here, patch endpoint requires but is not actually used by the call
      res.usersWithNewCredentials.push(user.id);
      await sdk.ok(sdk.create_user_credentials_api3(user.id));
    } catch (e) {
      throw new Error(
        `There was an error generating api3 crenetials for user ${user.id}. Full error: ${e}.`
      );
    }
  }
  return res;
};

// Example
// generateApiCredentials(148)
