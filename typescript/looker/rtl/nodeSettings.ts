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
import { ApiSettings, IApiSettings } from './apiSettings'

export interface IApiSection {
  [key: string]: string;
}

/**
 * Interface that supports reading the API settings on demand from an .ini file
 *
 */
export interface IApiSettingsIniFile extends IApiSettings {
  readIni(section?: string): IApiSection;
}

/**
 * Parse .ini formatted content
 * @param contents {string} formatted as an .ini file
 * @constructor
 */
export const ApiConfig = (contents: string) => ini.parse(contents)

/**
 * Extract named or (default) first section from INI file
 * @param contents {string} Parameters formatted as an INI file
 * @param section {[key: string]: any;} Contents of INI section
 * @constructor
 */
export const ApiConfigSection = (
  contents: string,
  section?: string,
): IApiSection => {
  const config = ApiConfig(contents)
  if (!section) {
    // default to the first section if not specified
    section = Object.keys(config)[0]
  }
  const settings = config[section]
  if (!settings) {
    throw new Error(`No section named "${section}" was found`)
  }
  return settings
}

/**
 * .ini Configuration initializer
 * @class NodeSettingsIni
 *
 */
export class NodeSettingsIni extends ApiSettings {
  constructor(contents: string, section?: string) {
    const settings = ApiConfigSection(contents, section)
    super(settings)
  }
}

/**
 * Example class that reads INI configuration from a file in node
 * @class NodeSettingsIniFile
 *
 * Warning: INI files storing credentials should be secured in the run-time environment, and
 * ignored by version control systems so credentials never get checked in to source code repositories
 */
export class NodeSettingsIniFile extends NodeSettingsIni
  implements IApiSettingsIniFile {
  private readonly fileName!: string

  constructor(fileName: string = './looker.ini', section?: string) {
    if (fs.existsSync(fileName)) {
      super(fs.readFileSync(fileName, 'utf-8'), section)
    }
    this.fileName = fileName
  }

  /**
   * Read an INI file section and return it as a generic keyed collection
   * @param section {string} Name of Ini section to read. Optional. Defaults to first section.
   */
  readIni(section?: string): IApiSection {
    if (fs.existsSync(this.fileName)) {
      return ApiConfigSection(fs.readFileSync(this.fileName, 'utf-8'), section)
    }
    return ApiConfigSection('')
  }
}
