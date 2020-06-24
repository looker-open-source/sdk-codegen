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

import { agentPrefix, defaultTimeout, ITransportSettings } from './transport'
import {
  lookerVersion,
  boolDefault,
  environmentPrefix,
  isTrue,
  unquote,
} from './constants'
import { IApiSection } from './nodeSettings'

export interface IValueSettings {
  [name: string]: string
}

export const strLookerBaseUrl = `${environmentPrefix}_BASE_URL`
export const strLookerVerifySsl = `${environmentPrefix}_VERIFY_SSL`
export const strLookerTimeout = `${environmentPrefix}_TIMEOUT`
export const strLookerClientId = `${environmentPrefix}_CLIENT_ID`
export const strLookerClientSecret = `${environmentPrefix}_CLIENT_SECRET`

export const ApiConfigMap: IValueSettings = {
  base_url: strLookerBaseUrl,
  client_id: strLookerClientId,
  client_secret: strLookerClientSecret,
  timeout: strLookerTimeout,
  verify_ssl: strLookerVerifySsl,
}

export const strBadConfiguration = `${agentPrefix} configuration error:
Missing required configuration values like base_url
`

export interface IApiSettings extends ITransportSettings {
  /**
   * Reading API settings on demand from some configuration source
   */
  readConfig(section?: string): IApiSection

  /**
   * Checks to see if minimal configuration values are assigned.
   *
   * If this function returns `false`, the Api configuration class will typically throw a run-time
   * error so the implementer knows required configuration values are missing
   *
   * @returns true or false
   */
  isConfigured(): boolean
}

/**
 * default the runtime configuration settings
 * @constructor
 *
 */
export const DefaultSettings = () =>
  ({
    agentTag: `${agentPrefix} ${lookerVersion}`,
    base_url: '',
    timeout: defaultTimeout,
    verify_ssl: true,
  } as IApiSettings)

/**
 * Return environment variable name value first, otherwise config name value
 * @param {IValueSettings} values
 * @param {string} name
 * @returns {string}
 */
export const configValue = (values: IValueSettings, name: string) => {
  const val = values[ApiConfigMap[name]] || values[name]
  return typeof val === 'string' ? unquote(val) : val
}

/**
 * Read any key/value collection for environment variable names and return as IApiSettings
 * @constructor
 *
 * The keys for the values are:
 *  - <environmentPrefix>_BASE_URL or `base_url`
 *  - <environmentPrefix>_CLIENT_ID or `client_id`
 *  - <environmentPrefix>_CLIENT_SECRET or `client_secret`
 *  - <environmentPrefix>_VERIFY_SSL or `verify_ssl`
 *  - <environmentPrefix>_TIMEOUT or `timeout`
 */
export const ValueSettings = (values: IValueSettings): IApiSettings => {
  const settings = DefaultSettings()
  settings.base_url = configValue(values, 'base_url') || settings.base_url
  settings.verify_ssl = boolDefault(configValue(values, 'verify_ssl'), true)
  settings.agentTag = `${agentPrefix} ${lookerVersion}`
  const timeout = configValue(values, 'timeout')
  settings.timeout = timeout ? parseInt(timeout, 10) : defaultTimeout
  return settings
}

/**
 * @class ApiSettings
 *
 * .ini Configuration initializer
 */
export class ApiSettings implements IApiSettings {
  base_url = ''
  verify_ssl = true
  timeout: number = defaultTimeout
  agentTag = `${agentPrefix} ${lookerVersion}`

  constructor(settings: Partial<IApiSettings>) {
    // coerce types to declared types since some paths could have non-conforming settings values
    this.base_url =
      'base_url' in settings ? unquote(settings.base_url) : this.base_url
    this.verify_ssl =
      'verify_ssl' in settings
        ? isTrue(unquote(settings.verify_ssl?.toString()))
        : this.verify_ssl
    this.timeout =
      'timeout' in settings
        ? parseInt(unquote(settings.timeout?.toString()), 10)
        : this.timeout
    if (!this.isConfigured()) {
      throw new Error(strBadConfiguration)
    }
  }

  isConfigured() {
    return !!this.base_url
  }

  /**
   * Default dynamic configuration reader
   * @param _section key/name of configuration section to read
   * @returns an empty `IAPISection`
   */
  readConfig(_section?: string): IApiSection {
    return {}
  }
}
