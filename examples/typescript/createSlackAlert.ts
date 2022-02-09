import { LookerNodeSDK } from '@looker/sdk-node'
import { ComparisonType, DestinationType } from '@looker/sdk'

/**
Creating an Alert to Send to Slack
Currently Leverages the Default Workspace of the Instance
**/

/**
Pulls from Environment Variables, see env sample in sdk-codegen root directory
An ini file can be used as well. See ./downloadDashboard.ts file for an example of this approach.
 */
const sdk = LookerNodeSDK.init40()

/**
Below are some sample variables to mock creating an alert
 */
const integration = '1::slack_app'
const channelType = 'users'
const channelSearch = '@test.user'
const dashboardElementId = 873

/**
Fetches the default slack workspace and ID for the Slack Destination. Can be either a user or channel depending on Function input. Then creates an alert to slack with a hard coded config.
required variables:
* @param  {string} integrationId: the action integration id for your instances' Slack App
* @param  {string} channelType: either "users" to send to users in your slack workspace OR "channel" to send to channels in your slack workspace 
* @param  {string} channelSearch: search string representing channel name OR user name in Slack workspace 
* @param  {number} dashboardElementId: id of the dashboard element to set the alert on
* @returns {Promise<Record<string, number>>}: returns response object with owner id of alert and the alert id
**/

const createSlackAlert = async (
  integrationId: string,
  channelSearch: string,
  channelType: string,
  dashboardElementId: number
) => {
  const slackDestinationObject = {}
  let formResponse
  slackDestinationObject.channelType = channelType
  // programmatically retrieve workspace id and channel id for alert creation
  try {
    formResponse = await sdk.ok(
      sdk.fetch_integration_form(integrationId, { channelType: channelType })
    )
  } catch (e) {
    throw new Error(`Error Fetching Action Form. Full message here: ${e}.`)
  }
  if (formResponse.fields.length > 0) {
    // first create key for workspace to be used
    if (formResponse.fields[0].name === 'workspace') {
      slackDestinationObject.workspace = formResponse.fields[0].default
    } else {
      const workspaceObject = formResponse.fields.filter(
        (value) => value.name === 'workspace'
      )
      slackDestinationObject.workspace = workspaceObject[0].default
    }
    // filtered array for given channelSearch string, if multiple channels or users OR resulting array is 0 throw error
    const getChannel = formResponse.fields.filter(
      (channelForm) => channelForm.name === 'channel'
    )
    const resultChannel = getChannel[0].options.filter(
      (channel) => channel.label === channelSearch
    )
    if (resultChannel.length === 0)
      throw new Error(
        `There are no users or channels that match ${channelSearch}.`
      )
    if (resultChannel.length > 1)
      throw new Error(
        `The ${channelSearch} returned multiple ${
          channelType === 'users' ? 'users' : 'channels'
        }. Please search for a specific id.`
      )
    // return just the id to be used later
    const { name } = resultChannel[0]
    slackDestinationObject.channel = name
    console.log(slackDestinationObject)
    const data = await createAlert(
      dashboardElementId,
      JSON.stringify(slackDestinationObject),
      integrationId
    )
    if (data.id) {
      return { owner_id: data.owner_id, alert: data.id }
    }
  }
  throw new Error(
    `No Fields exist for ${integrationId} given ${channelType} search. Perhaps your user doesn't have the appropriate permissions to this workspace`
  )
}

/**
Configures the alert body/configuration to be passed to the create alert endpoint, in this example most of the attributes are hard coded, but this could be updated so they are passed dynamically
* @param  {number} dashboardElementId: id of the dashboard element to set the alert on
* @param  {string} formParams: json string containing workspace id, channel type (user or channel) and id of destination
* @param  {string} integrationId: the action integration id for your instances' Slack App
* @returns {IWriteAlert}: returns alert body object
**/

const alertConfig = (
  dashbordElementId: number,
  formParams: string,
  integrationId: string
) => {
  // example config
  return {
    comparison_type: ComparisonType.GREATER_THAN,
    cron: '0 5 1 * *',
    custom_title: 'Test Test 00000',
    dashboard_element_id: dashbordElementId,
    destinations: [
      {
        destination_type: DestinationType.ACTION_HUB,
        action_hub_integration_id: integrationId,
        action_hub_form_params_json: formParams,
      },
    ],
    field: {
      title: 'Any History',
      name: 'history.count',
    },
    is_disabled: false,
    is_public: true,
    owner_id: 938,
    threshold: 10000,
  }
}

/**
Fetches the default slack workspace and ID for the Slack Destination. Can be either a user or channel depending on Function input.
required variables:
* @param  {number} dashboardElementId: id of the dashboard element to set the alert on
* @param  {string} formParams: json string containing workspace id, channel type (user or channel) and id of destination
* @param  {string} integrationId: the action integration id for your instances' Slack App
* @returns {Promise<IAlert>}: returns a promise of IAlert (created alert response body)
**/
const createAlert = async (
  dashboardElementId: number,
  formParams: string,
  integrationId: string
) => {
  try {
    const alertResponse = await sdk.ok(
      sdk.create_alert(
        alertConfig(dashboardElementId, formParams, integrationId)
      )
    )
    console.log(alertResponse)
    return alertResponse
  } catch (e) {
    throw new Error(
      `There was an error creating the alert. Full message here: ${e}`
    )
  }
}

// Example
// createSlackAlert(integration, channelSearch, channelType, dashboardElementId)
