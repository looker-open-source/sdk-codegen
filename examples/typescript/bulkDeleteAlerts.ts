import { LookerNodeSDK } from '@looker/sdk-node'

/**
Admin Script to Bulk Delete Alerts for a given user
**/

/**
Pulls from Environment Variables, see env sample in sdk-codegen root directory
An ini file can be used as well. See ./downloadDashboard.ts file for an example of this approach.
 */
const sdk = LookerNodeSDK.init40()

/**
 * @param {number} userId: the user who's alerts one wants to fetch
 * @returns {Promise<string | string>}: Object containing number of alerts deleted and user
 */

const bulkDeleteAlerts = async (userId: number) => {
  if (!userId) {
    throw new Error('Please specify a specific user id to disable alerts for.')
  }
  try {
    // return all alerts, then filter for specific user
    const alertResponse = await sdk.ok(
      sdk.search_alerts({
        group_by: 'owner_id',
        fields: 'id,owner_id',
        all_owners: true,
      })
    )
    const alertsToDelete = alertResponse.filter(
      (alert) => alert.owner_id === userId
    )
    if (alertsToDelete.length > 0) {
      alertsToDelete.forEach(async (alert) => {
        try {
          await sdk.ok(sdk.delete_alert(alert.id))
          console.log(`Deleted Alert ${alert.id}`)
        } catch (e) {
          throw new Error(
            `There was an error trying to delete alert ${alert.id}. Full message here: ${e}`
          )
        }
      })
      return { alertsDeleted: alertsToDelete.length, user: userId }
    } else {
      console.log(`User ${userId}, has no alerts saved. Aborting.`)
      return { alertsDeleted: 0, user: userId }
    }
  } catch (e) {
    throw new Error(
      `There was an error fetching all alerts for a user ${userId}. Make sure a user by that ID exists OR that you have permissions to make this call.`
    )
  }
}

// Example
// bulkDeleteAlerts(938)
