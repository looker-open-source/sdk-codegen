#!/usr/bin/env node

// CORS application registration script
import fs from 'fs'
import {
  IOauthClientApp,
  LookerNodeSDK,
  NodeSettingsIniFile,
} from '@looker/sdk/lib/node'

export const registerOAuthApp = async (
  iniFile: string,
  appInfo: IOauthClientApp,
) => {
  const guid = appInfo.client_guid
  if (!guid) {
    return Promise.reject(`client_guid must be defined`)
  }
  const settings = new NodeSettingsIniFile(iniFile)
  let result = `${guid} is registered for OAuth on ${settings.base_url}`
  const sdk = LookerNodeSDK.init40(settings)
  try {
    console.log(`Checking if "${guid}" is registered as an OAuth application ...` )
    let app = await sdk.ok(sdk.oauth_client_app(guid))
    console.log(`${guid} is already registered as ${app.display_name}`)
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

const register = async () => {
  const args = process.argv.splice(2)
  const total = args.length
  const iniFile = total < 1 ? `${__dirname}/../../../looker.ini` : args[0]
  const configFile = total < 2 ? `${__dirname}/appconfig.json` : args[1]
  let result = ''
  console.log(`Using ${iniFile} to register the OAuth application configured in ${configFile}`)
  if (!fs.existsSync(iniFile)) {
    return Promise.reject(`"${iniFile}" was not found`)
  }
  if (!fs.existsSync(configFile)) {
    return Promise.reject(`"${configFile}" was not found`)
  }
  const appInfo: IOauthClientApp = JSON.parse(fs.readFileSync(configFile, 'utf8'))
  result = await registerOAuthApp(iniFile, appInfo)
  return Promise.resolve(result)
}

(async () => {
  const result = await register()
  console.log(result)
})()
