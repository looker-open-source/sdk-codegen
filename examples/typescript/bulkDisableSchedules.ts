import { LookerNodeSDK } from '@looker/sdk-node';
import { IScheduledPlan } from '@looker/sdk';

const sdk = LookerNodeSDK.init40();

// get schedules for all users (will require admin permissions for api caller) or for a specific user by id

const getSchedules = async (userID?: number): Promise<IScheduledPlan[]> => {
  let schedules: IScheduledPlan[];
  if (userID) {
    schedules = await sdk.ok(
      sdk.all_scheduled_plans({ user_id: userID, all_users: false })
    );
  } else {
    schedules = await sdk.ok(sdk.all_scheduled_plans({ all_users: true }));
  }
  return schedules;
};

const bulkDisableSchedules = async (
  userID?: number
): Promise<boolean | Error> => {
  const schedules = await getSchedules(userID);
  try {
    schedules.forEach(async (s) => {
      if (s.id) {
        await sdk.ok(sdk.update_scheduled_plan(s.id, { enabled: false }));
      }
    });
    // depending on whether userID is included or not we will change what we log to the console
    console.log(
      `Successfully disabled all schedules ${
        userID ? `for user ${userID}.` : 'for all users.'
      }`
    );
    return true;
  } catch (e) {
    throw new Error(
      `There was an error trying to disable schedules. Full error message: ${e}`
    );
  }
};

// Examples
// bulkDisableSchedules()
// bulkDisableSchedules(938)
