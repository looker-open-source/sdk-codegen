#!/usr/bin/env node

// CORS application registration script

import {
  IWriteOauthClientApp,
  LookerNodeSDK,
  NodeSettingsIniFile,
} from '@looker/sdk/lib/node'

export const registerCorsApp = async (
  guid: string,
  appInfo: IWriteOauthClientApp
) => {
  const iniFile = `${__dirname}/../../../looker.ini`
  const settings = new NodeSettingsIniFile(iniFile)
  let result = `${guid} is registered for OAuth on ${settings.base_url}`
  const sdk = LookerNodeSDK.init40(settings)
  try {
    let app = await sdk.ok(sdk.oauth_client_app(guid))
    console.log(`${guid} is already registered as OAuth application ${app.display_name}`)
    app = await sdk.ok(sdk.update_oauth_client_app(guid, appInfo))
    console.log(`Updated ${guid} settings`)
    console.debug({ app })
    return result
  } catch (e) {
    try {
      const app = await sdk.ok(sdk.register_oauth_client_app(guid, appInfo))
      console.log(`successfully registered ${guid}`)
      console.debug({ app })
    } catch (e2) {
      result = JSON.stringify(e2)
    }
  }
  return result
}

export const apixGuid = 'looker.api-explorer'
export const apixAppInfo = (): IWriteOauthClientApp => {
  return {
    redirect_uri: 'https://localhost:8080/oauth',
    display_name: 'CORS API Explorer',
    description: 'Looker API Explorer using CORS',
    enabled: true,
    // group_id TODO what should this be?
  }
}

(async () => {
  console.log(`Checking if "${apixGuid}" is registered for OAuth ...` )
  const result = await registerCorsApp(apixGuid, apixAppInfo())
  console.log({ result })
})()
