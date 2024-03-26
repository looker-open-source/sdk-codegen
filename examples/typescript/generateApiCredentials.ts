import { LookerNodeSDK } from '@looker/sdk-node';

interface Api3SuccessBody {
  success: boolean;
  usersWithNewCredentials: Array<number>;
}

const sdk = LookerNodeSDK.init40();

const generateApiCredentials = async (
  roleID: number
): Promise<Api3SuccessBody> => {
  // grab all users and return id, credentials_api3, and role_ids parameters
  const usersWithoutCredentials = await sdk.ok(
    sdk.all_users({ fields: 'id, credentials_api3, role_ids' })
  );
  // filter those users for those with no api credentials (ie. empty array) and for those that have the role caller specifies
  const filteredUsers = usersWithoutCredentials.filter(
    (u) => u.credentials_api3.length == 0 && u.role_ids.includes(roleID)
  );
  const res: Api3SuccessBody = {
    success: true,
    // array holding user with new generated api3 credentials
    usersWithNewCredentials: [],
  };
  filteredUsers.forEach(async (user: any) => {
    try {
      //pass empty body here, patch endpoint requires but is not actually used by the call
      res.usersWithNewCredentials.push(user.id);
      await sdk.ok(sdk.create_user_credentials_api3(user.id, {}));
    } catch (e) {
      throw new Error(
        `There was an error generating api3 crenetials for user ${user.id}. Full error: ${e}.`
      );
    }
  });
  return res;
};

// Example
//generateApiCredentials(148)
