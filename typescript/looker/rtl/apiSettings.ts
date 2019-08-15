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
import { ITransportSettings } from './transport'

export interface IApiSettings extends ITransportSettings {
  client_id: string
  client_secret: string
  embed_secret: string
  user_id: string
}

export interface IApiSections {
  [key: string]: IApiSettings
}

export const ApiConfig = (contents: string): IApiSections => ini.parse(contents)

export class ApiSettings implements IApiSettings {
  // tslint:disable-next-line: variable-name
  api_version!: string
  // tslint:disable-next-line: variable-name
  base_url!: string
  // tslint:disable-next-line: variable-name
  client_id!: string
  // tslint:disable-next-line: variable-name
  client_secret!: string
  // tslint:disable-next-line: variable-name
  embed_secret!: string
  // tslint:disable-next-line: variable-name
  user_id!: string

  constructor(contents: string, section?: string) {
    const config = ApiConfig(contents)
    if (!section) {
      // default the section if not specified
      section = Object.keys(config)[0]
    }
    const settings = config[section]
    if (!settings) {
      throw new Error(`No section named "${section}" was found`)
    }
    Object.assign(this, settings)
  }

}

// Parse an INI file, read the settings
export class ApiSettingsIniFile extends ApiSettings {
  constructor(fileName = './looker.ini', section?: string) {
    super(fs.readFileSync(fileName, 'utf-8'), section)
  }
}
