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

export interface IApiSettings {
  api_version: string
  base_url: string
  client_id: string
  client_secret: string
  embed_secret: string
  user_id: string
}

export interface IApiSections {
  [key: string]: IApiSettings
}

// Strongly-typed Api configuration
export const ApiConfig = (fileName = './looker.ini') : IApiSections =>
  ini.parse(fs.readFileSync(fileName, 'utf-8'))

export class ApiSettings implements IApiSettings {
  api_version!: string
  base_url!: string
  client_id!: string
  client_secret!: string
  embed_secret!: string
  user_id!: string
  constructor (fileName = './looker.ini', section? : string) {
    const config = ApiConfig(fileName)
    if (!section) {
      // default the section if not specified
      section = Object.keys(config)[0]
    }
    Object.assign(this, config[section])
  }

}