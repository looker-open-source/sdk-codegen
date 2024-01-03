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

import * as fs from 'fs';
import dotenv from 'dotenv';
import { boolDefault } from '@looker/sdk-rtl';
import { readIniConfig } from '@looker/sdk-node';

export interface ISDKConfigProps {
  api_version: string;
  api_versions: string;
  base_url: string;
  client_id: string;
  client_secret: string;
  verify_ssl: boolean;
}

export interface ISDKConfigSection {
  [key: string]: ISDKConfigProps;
}

export const SDKConfig = (
  fileName = './looker.ini',
  envPrefix = 'LOOKERSDK',
  sectionName = 'Looker'
): ISDKConfigSection => {
  dotenv.config();
  if (process.env.DOT_ENV_FILE) {
    // Load custom env file
    const name = process.env.DOT_ENV_FILE;
    const vals = dotenv.parse(fs.readFileSync(name, 'utf-8'));
    Object.entries(vals).forEach(([key, val]) => {
      if (val) process.env[key] = val;
    });
  }

  const section = readIniConfig(fileName, envPrefix, sectionName);
  const config: ISDKConfigProps = {
    api_version: section.api_version,
    api_versions: section.api_versions,
    base_url: section.base_url,
    client_id: section.client_id,
    client_secret: section.client_secret,
    verify_ssl: boolDefault(section.verify_ssl, true),
  };

  if (!config.base_url) {
    throw Error('Fatal error: base_url is not configured. Exiting.');
  }
  return { [sectionName]: config };
};
