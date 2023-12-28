import { LookerNodeSDK } from '@looker/sdk-node';
import { IScheduledPlan } from '@looker/sdk';

const sdk = LookerNodeSDK.init40();

// schedules will either return for all users or for a specific user id if passed
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

const bulkReAssignSchedules = async (
  newOwner: number,
  userID?: number
): Promise<boolean | Error> => {
  if (newOwner) {
    const schedules = await getSchedules(userID);
    try {
      schedules.forEach(async (s) => {
        if (s.id) {
          await sdk.ok(sdk.update_scheduled_plan(s.id, { user_id: newOwner }));
        }
      });
      // depending on whether userID is included or not we will change what we log to the console
      console.log(
        `Successfully reassigned all schedules ${
          userID ? `for user ${userID}` : 'for all users'
        } to ${newOwner}`
      );
      return true;
    } catch (e) {
      throw new Error(
        `There was an error trying to disable schedules. Full error message: ${e}`
      );
    }
  } else {
    throw new Error(
      'Please specify at least the id of the new owner for schedules.'
    );
  }
};

// Examples
// bulkDisableSchedules(200)
// bulkDisableSchedules(200, 300)
