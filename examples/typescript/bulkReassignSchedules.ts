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
import type { IScheduledPlan } from '@looker/sdk';

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
      schedules.forEach(async s => {
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
