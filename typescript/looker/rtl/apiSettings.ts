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

import { agentTag, ITransportSettings } from './transport'

export const strLookerBaseUrl = 'LOOKER_BASE_URL'
export const strLookerApiVersion = 'LOOKER_API_VERSION'
export const strLookerClientId = 'LOOKER_CLIENT_ID'
export const strLookerClientSecret = 'LOOKER_CLIENT_SECRET'
export const strLookerEmbedSecret = 'LOOKER_EMBED_SECRET'
export const strBadConfiguration = `${agentTag} configuration error:
Missing required configuration values like base_url and api_version
`

export interface IValueSettings {
  [name: string]: string
}

export interface IApiSettings extends ITransportSettings {
  embed_secret: string
  isConfigured(): boolean
}

export interface IApiClientSettings extends IApiSettings {
  client_id?: string
  client_secret?: string
}

/**
 * default the runtime configuration settings
 * @constructor
 *
 */
export const DefaultSettings = () => ({
  base_url: '',
  api_version: '3.1', // default to API 3.1
  client_id: '',
  client_secret: '',
  embed_secret: ''
} as IApiClientSettings)

/**
 * Read any key/value collection for environment variable names and return as IApiSettings
 * @constructor
 *
 * The values keys are:
 *  - LOOKER_BASE_URL
 *  - LOOKER_API_VERSION
 *  - LOOKER_CLIENT_ID
 *  - LOOKER_CLIENT_SECRET
 *  - LOOKER_EMBED_SECRET
 */
export const ValueSettings  = (values: IValueSettings): IApiClientSettings => {
  const settings = DefaultSettings()
  settings.api_version = values[strLookerApiVersion] || settings.api_version
  settings.base_url = values[strLookerBaseUrl] || settings.base_url
  settings.client_id = values[strLookerClientId] || settings.client_id
  settings.client_secret = values[strLookerClientSecret] || settings.client_secret
  settings.embed_secret = values[strLookerEmbedSecret] || settings.embed_secret
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
  embed_secret: string = ''

  constructor(settings: Partial<IApiSettings>) {
    Object.assign(this, settings)
    if (!this.isConfigured()) {
      throw new Error(strBadConfiguration)
    }
  }

  isConfigured() { return !!(this.base_url && this.api_version) }
}
