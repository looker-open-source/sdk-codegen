import {LookerNodeSDK} from '@looker/sdk-node'
import {IScheduledPlan} from '@looker/sdk'

const sdk = LookerNodeSDK.init40()

// get schedules for all users (will require admin permissions for api caller) or for a specific user by id

const getSchedules = async (allUsers: boolean, userID?: number): Promise<IScheduledPlan[]> => {
    let schedules: IScheduledPlan[];
    if(userID) {
        schedules = await sdk.ok(sdk.all_scheduled_plans({user_id: userID, all_users:false}))
    } else {
        schedules = await sdk.ok(sdk.all_scheduled_plans({all_users:true}))
    }
    return schedules
}

const bulkDisableSchedules = async (allUsers: boolean, userID?: number): Promise<boolean> => {
    if(userID || allUsers) {
        const schedules = await getSchedules(allUsers=allUsers, userID=userID)
        try {
            schedules.forEach(async (s) => await sdk.ok(sdk.update_scheduled_plan(s.id, {enabled:false})))
            // depending on whether allUsers is set to true or not we will change what we log to the console
            console.log(`Successfully disabled all schedules ${allUsers ? 'for all users' : `for user ${userID}`}`)
            return true
        } catch (e) {
            throw new Error(`There was an error trying to disable schedules. Full error message: ${e}`)
        }
    } else {
        throw new Error('Please specify either allUsers or a userID to fetch schedules.')
    }
}

// Example
// bulkDisableSchedules(false, 300)
// bulkDisableSchedules(true)