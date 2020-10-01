/*

 MIT License

 Copyright (c) 2020 Looker Data Sciences, Inc.

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

import path from 'path'
import fs from 'fs'
import { IOauthClientApp, LookerNodeSDK } from '@looker/sdk/lib/node'
import { NodeSettingsIniFile } from '@looker/sdk-rtl/lib/node'
import { SDKConfig } from '../../sdk-codegen-scripts/src/sdkConfig'
import {
  fetchLookerVersions,
  logConvertSpec,
} from '../../sdk-codegen-scripts/src/fetchSpec'

const supportedApiVersions = ['3.0', '3.1', '4.0']

export const apixSpecFileName = (fileName: string) => {
  const p = path.parse(fileName)
  return `${__dirname}/../../../spec/${p.base}`
}

// const copySpec = (fileName: string) => {
//   const dest = apixSpecFileName(fileName)
//   fs.copyFileSync(fileName, dest)
//   console.info(`Copied ${fileName} to ${dest}`)
// }

export const updateSpecs = async (apiVersions = supportedApiVersions) => {
  console.info(`Updating the specs folder with APIs ${apiVersions.join()} ...`)
  const config = SDKConfig(`${__dirname}/../../../looker.ini`)
  const [name, props] = Object.entries(config)[0]
  const lookerVersions = await fetchLookerVersions(props)
  for (const v of apiVersions) {
    const specFile = await logConvertSpec(
      name,
      { ...props, ...{ api_version: v } },
      lookerVersions
    )
    if (!specFile) {
      console.error(`Could not fetch spec for API ${v} from ${props.base_url}`)
    }
  }
}

// CORS application registration script
export const registerOAuthApp = async (
  iniFile: string,
  appInfo: IOauthClientApp
) => {
  const guid = appInfo.client_guid
  if (!guid) {
    return Promise.reject(new Error(`client_guid must be defined`))
  }
  const settings = new NodeSettingsIniFile(iniFile)
  let result = `${guid} is registered for OAuth on ${settings.base_url}`
  const sdk = LookerNodeSDK.init40(settings)
  try {
    console.log(
      `Checking if "${guid}" is registered as an OAuth application ...`
    )
    let app = await sdk.ok(sdk.oauth_client_app(guid))
    console.log(`${guid} is already registered as ${app.display_name}`)
    app = await sdk.ok(sdk.update_oauth_client_app(guid, appInfo))
    console.log(`Updated ${guid} settings`)
    console.debug({ app })
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

const brokenPromise = (message: string) => Promise.reject(new Error(message))

export const registerApp = async () => {
  const args = process.argv.splice(2)
  const total = args.length
  const iniFile = total < 1 ? `${__dirname}/../../../looker.ini` : args[0]
  const configFile = total < 2 ? `${__dirname}/appconfig.json` : args[1]
  let result = ''
  console.log(
    `Using ${iniFile} to register the OAuth application configured in ${configFile}`
  )
  if (!fs.existsSync(iniFile)) {
    return brokenPromise(`"${iniFile}" was not found`)
  }
  if (!fs.existsSync(configFile)) {
    return brokenPromise(`"${configFile}" was not found`)
  }
  const appInfo: IOauthClientApp = JSON.parse(
    fs.readFileSync(configFile, 'utf8')
  )
  result = await registerOAuthApp(iniFile, appInfo)
  return Promise.resolve(result)
}
