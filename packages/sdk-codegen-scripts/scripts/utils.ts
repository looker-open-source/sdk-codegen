/*

 MIT License

 Copyright (c) 2021 Looker Data Sciences, Inc.

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

import path from 'path';
import fs from 'fs';
import type { IOauthClientApp } from '@looker/sdk';
import { LookerNodeSDK, NodeSettingsIniFile } from '@looker/sdk-node';
import { getSpecsFromVersions } from '@looker/sdk-codegen';
import { SDKConfig } from '../../sdk-codegen-scripts/src/sdkConfig';
import {
  fetchLookerVersions,
  logConvertSpec,
} from '../../sdk-codegen-scripts/src/fetchSpec';

/* eslint no-console: 0 */

const supportedApiVersions = ['3.1', '4.0'];

const homeToRoost = '../../../';

const getRootPath = () => path.join(__dirname, homeToRoost);
const rootFile = (fileName = '') => path.join(getRootPath(), fileName);

export const updateSpecs = async (apiVersions = supportedApiVersions) => {
  const iniFile = rootFile('looker.ini');
  const config = SDKConfig(iniFile);
  const [name, props] = Object.entries(config)[0];
  console.info(
    `Updating the specs folder with APIs ${apiVersions.join()} from ${name} ${
      props.base_url
    } in ${iniFile} ...`
  );
  const lookerVersions = await fetchLookerVersions(props);
  const specs = await getSpecsFromVersions(lookerVersions);
  for (const v of apiVersions) {
    try {
      const specFile = await logConvertSpec(name, specs[v], lookerVersions);
      if (!specFile) {
        console.error(
          `Could not fetch spec for API ${v} from ${props.base_url}`
        );
      }
    } catch (e) {
      console.error(`Using ${props.base_url} error ${e}`);
    }
  }
};

// CORS application registration script
export const registerOAuthApp = async (
  iniFile: string,
  appInfo: IOauthClientApp
) => {
  const guid = appInfo.client_guid;
  if (!guid) {
    return Promise.reject(new Error(`client_guid must be defined`));
  }
  const settings = new NodeSettingsIniFile('', iniFile);
  let result = `${guid} is registered for OAuth on ${settings.base_url}`;
  const sdk = LookerNodeSDK.init40(settings);
  try {
    console.log(
      `Checking if "${guid}" is registered as an OAuth application ...`
    );
    let app = await sdk.ok(sdk.oauth_client_app(guid));
    console.log(`${guid} is already registered as ${app.display_name}`);
    app = await sdk.ok(sdk.update_oauth_client_app(guid, appInfo));
    console.log(`Updated ${guid} settings`);
    console.debug({ app });
  } catch (e) {
    try {
      const app = await sdk.ok(sdk.register_oauth_client_app(guid, appInfo));
      console.log(`successfully registered ${guid}`);
      console.debug({ app });
    } catch (e2) {
      result = JSON.stringify(e2);
    }
  }
  return result;
};

const brokenPromise = (message: string) => Promise.reject(new Error(message));

export const registerApp = async () => {
  const args = process.argv.slice(2);
  const total = args.length;
  const iniFile =
    total < 1 ? path.join(__dirname, '/../../../looker.ini') : args[0];
  const configFile =
    total < 2 ? path.join(__dirname, 'appconfig.json') : args[1];
  let result = '';
  console.log(
    `Using ${iniFile} to register the OAuth application configured in ${configFile}`
  );
  if (!fs.existsSync(iniFile)) {
    return brokenPromise(`"${iniFile}" was not found`);
  }
  if (!fs.existsSync(configFile)) {
    return brokenPromise(`"${configFile}" was not found`);
  }
  const appInfo: IOauthClientApp = JSON.parse(
    fs.readFileSync(configFile, 'utf8')
  );
  result = await registerOAuthApp(iniFile, appInfo);
  return Promise.resolve(result);
};
