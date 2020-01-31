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

import { agentPrefix, defaultTimeout, ITransportSettings } from './transport'
import { boolDefault, environmentPrefix, isTrue, unquote } from './constants'
import { IApiSection } from './nodeSettings'

export interface IValueSettings {
  [name: string]: string;
}

export const strLookerBaseUrl = `${environmentPrefix}_BASE_URL`
export const strLookerApiVersion = `${environmentPrefix}_API_VERSION`
export const strLookerVerifySsl = `${environmentPrefix}_VERIFY_SSL`
export const strLookerTimeout = `${environmentPrefix}_TIMEOUT`
export const strLookerClientId =`${environmentPrefix}_CLIENT_ID`
export const strLookerClientSecret = `${environmentPrefix}_CLIENT_SECRET`

export const ApiConfigMap: IValueSettings = {
  'base_url': strLookerBaseUrl,
  'api_version': strLookerApiVersion,
  'verify_ssl': strLookerVerifySsl,
  'timeout': strLookerTimeout,
  'client_id': strLookerClientId,
  'client_secret': strLookerClientSecret
}

export const strBadConfiguration = `${agentPrefix} configuration error:
Missing required configuration values like base_url and api_version
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
    base_url: '',
    api_version: '3.1', // default to API 3.1
    verify_ssl: true,
    timeout: defaultTimeout,
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
 *  - <environmentPrefix>_API_VERSION or `api_version`
 *  - <environmentPrefix>_CLIENT_ID or `client_id`
 *  - <environmentPrefix>_CLIENT_SECRET or `client_secret`
 *  - <environmentPrefix>_VERIFY_SSL or `verify_ssl`
 *  - <environmentPrefix>_TIMEOUT or `timeout`
 */
export const ValueSettings = (values: IValueSettings): IApiSettings => {
  const settings = DefaultSettings()
  settings.api_version = configValue(values, 'api_version') || settings.api_version
  settings.base_url = configValue(values, 'base_url') || settings.base_url
  settings.verify_ssl = boolDefault(configValue(values, 'verify_ssl'), true)
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
  // tslint:disable-next-line: variable-name
  base_url: string = ''
  // tslint:disable-next-line: variable-name
  api_version: string = '3.1'
  // tslint:disable-next-line: variable-name
  verify_ssl: boolean = true
  timeout: number = defaultTimeout

  constructor(settings: Partial<IApiSettings>) {
    // coerce types to declared types since some paths could have non-conforming settings values
    this.base_url = 'base_url' in settings ? unquote(settings.base_url) : this.base_url
    this.api_version =
      'api_version' in settings
        ? unquote(settings.api_version)
        : this.api_version
    this.verify_ssl =
      'verify_ssl' in settings
        ? isTrue(unquote(settings.verify_ssl!.toString()))
        : this.verify_ssl
    this.timeout =
      'timeout' in settings
        ? parseInt(unquote(settings.timeout!.toString()), 10)
        : this.timeout
    if (!this.isConfigured()) {
      throw new Error(strBadConfiguration)
    }
  }

  isConfigured() {
    return !!(this.base_url && this.api_version)
  }

  /**
   * Default dynamic configuration reader
   * @param section key/name of configuration section to read
   * @returns an empty `IAPISection`
   */
  // @ts-ignore
  readConfig(section?: string): IApiSection {
    return {}
  }
}
