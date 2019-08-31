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

import * as fs from 'fs'
import * as ini from 'ini'
import { ApiSettings, IApiClientSettings, IApiSettings } from './apiSettings'

export interface IApiSections {
  [key: string]: IApiSettings
}

// TODO figure out spread operation for DefaultSettings ... client_id, client_secretß
/**
 * default the runtime configuration settings
 * @constructor
 *
 */
export const DefaultClientSettings = () => ({
  base_url: '',
  api_version: '3.1', // default to API 3.1
  client_id: '',
  client_secret: '',
  embed_secret: ''
} as IApiClientSettings)

/**
 * Parse .ini formatted content
 * @param contents {string} formatted as an .ini file
 * @constructor
 */
export const ApiConfig = (contents: string): IApiSections => ini.parse(contents)

/**
 * .ini Configuration initializer
 * @class NodeSettingsIni
 *
 */
export class NodeSettingsIni extends ApiSettings implements IApiClientSettings {
  client_id!: string
  // tslint:disable-next-line: variable-name
  client_secret!: string

  constructor(contents: string, section?: string) {
    const config = ApiConfig(contents)
    if (!section) {
      // default to the first section if not specified
      section = Object.keys(config)[0]
    }
    const settings = config[section]
    if (!settings) {
      throw new Error(`No section named "${section}" was found`)
    }
    super(settings)
  }

  isConfigured() {
    return super.isConfigured() && !!(this.client_id && this.client_secret)
  }
}

/**
 * Example class that reads INI configuration from a file in node
 * @class NodeSettingsIniFile
 *
 */
export class NodeSettingsIniFile extends NodeSettingsIni {
  constructor(fileName = './looker.ini', section?: string) {
    if (fs.existsSync(fileName)) {
      super(fs.readFileSync(fileName, 'utf-8'), section)
    }
  }
}
