/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2019 Looker Data Sciences, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import { agentTag, defaultTimeout, ITransportSettings } from './transport'
import { environmentPrefix } from './versions'

export const strLookerBaseUrl = `${environmentPrefix}_BASE_URL`
export const strLookerApiVersion = `${environmentPrefix}_API_VERSION`
export const strLookerVerifySsl = `${environmentPrefix}_VERIFY_SSL`
export const strLookerTimeout = `${environmentPrefix}_TIMEOUT`
export const strBadConfiguration = `${agentTag} configuration error:
Missing required configuration values like base_url and api_version
`

export interface IValueSettings {
  [name: string]: string;
}

export interface IApiSettings extends ITransportSettings {
  isConfigured(): boolean;
}

/**
 * default the runtime configuration settings
 * @constructor
 *
 */
export const DefaultSettings = () =>
  ({
    base_url: '',
    api_version: '3.1', // default to API 3.1
    verify_ssl: true,
    timeout: defaultTimeout,
  } as IApiSettings)

/**
 * Read any key/value collection for environment variable names and return as IApiSettings
 * @constructor
 *
 * The values keys are:
 *  - LOOKER_BASE_URL
 *  - LOOKER_API_VERSION
 *  - LOOKER_CLIENT_ID
 *  - LOOKER_CLIENT_SECRET
 *  - LOOKER_VERIFY_SSL
 *  - LOOKER_TIMEOUT
 */
export const ValueSettings = (values: IValueSettings): IApiSettings => {
  const settings = DefaultSettings()
  settings.api_version = values[strLookerApiVersion] || settings.api_version
  settings.base_url = values[strLookerBaseUrl] || settings.base_url
  if (strLookerVerifySsl in values) {
    settings.verify_ssl = /true|1/i.test(values[strLookerVerifySsl])
  }
  if (strLookerTimeout in values) {
    settings.timeout = parseInt(values[strLookerTimeout], 10)
  }
  return settings
}

/**
 * @class ApiSettings
 *
 * .ini Configuration initializer
 */
export class ApiSettings implements IApiSettings {
  // tslint:disable-next-line: variable-name
  base_url: string = ''
  // tslint:disable-next-line: variable-name
  api_version: string = '3.1'
  // tslint:disable-next-line: variable-name
  verify_ssl: boolean = true
  timeout: number = defaultTimeout

  constructor(settings: Partial<IApiSettings>) {
    // coerce types to declared types since some paths could have non-conforming settings values
    this.base_url = 'base_url' in settings ? settings.base_url! : this.base_url
    this.api_version =
      'api_version' in settings
        ? settings.api_version!.toString()
        : this.api_version
    this.verify_ssl =
      'verify_ssl' in settings
        ? /true|1/i.test(settings.verify_ssl!.toString())
        : this.verify_ssl
    this.timeout =
      'timeout' in settings
        ? parseInt(settings.timeout!.toString())
        : this.timeout
    if (!this.isConfigured()) {
      throw new Error(strBadConfiguration)
    }
  }

  isConfigured() {
    return !!(this.base_url && this.api_version)
  }
}
