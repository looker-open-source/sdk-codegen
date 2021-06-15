import {LookerNodeSDK} from '@looker/sdk-node'
import {IScheduledPlan} from '@looker/sdk'


const sdk = LookerNodeSDK.init40()

// schedules will either return for all users or for a specific user id if passed
const getSchedules = async (allUsers: boolean, userID?: number): Promise<IScheduledPlan[]> => {

    let schedules: IScheduledPlan[];

    if (allUsers) {
        schedules = await sdk.ok(sdk.all_scheduled_plans({all_users:true}))
    } else {
        if (!userID) {
            schedules = undefined
            throw new Error(`Please specify a userID for this function.`)
        } else {
            schedules = await sdk.ok(sdk.all_scheduled_plans({user_id: userID, all_users:false}))
        }
    }

    return schedules

}


const bulkReAssignSchedules = async (allUsers: boolean, newOwner: number, userID?: number): Promise<boolean | Error> => {

    const schedules = await getSchedules(allUsers=allUsers, userID=userID)

    try {
        schedules.forEach(async (s) => await sdk.ok(sdk.update_scheduled_plan(s.id, {user_id:newOwner})))

        // depending on whether allUsers is set to true or not we will change what we log to the console

        console.log(`Successfully reassinged all schedules ${allUsers? 'for all users' : `for user ${userID}`} to ${newOwner}`)
        return true
    } catch (e) {
        throw new Error(`There was an error trying to disable schedules. Full error message: ${e}`)
    }
}

// Examples
// bulkDisableSchedules(false, 200, 300)
// bulkDisableSchedules(true, 200)