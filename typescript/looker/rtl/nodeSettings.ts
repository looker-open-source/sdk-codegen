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
import {
  ApiSettings,
  DefaultSettings,
  IApiSettings,
  strLookerApiVersion,
  strLookerBaseUrl, strLookerClientId, strLookerClientSecret, strLookerTimeout, strLookerVerifySsl,
  ValueSettings,
} from './apiSettings'

export interface IApiSection {
  [key: string]: string;
}

/**
 * Interface that supports reading the API settings on demand from a configuration store
 *
 */
export interface IApiSettingsConfig extends IApiSettings {
  readConfig(section?: string): IApiSection;
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
 * Configuration initializer
 * @class NodeSettings
 *
 */
export class NodeSettings extends ApiSettings {
  constructor(contents: string, section?: string) {
    const settings = ApiConfigSection(contents, section)
    super(settings)
  }
}

const readEnvConfig = () => {
  const defaults = DefaultSettings()
  return {
    [strLookerApiVersion]: process.env[strLookerApiVersion] || defaults.api_version,
    [strLookerBaseUrl]: process.env[strLookerBaseUrl] || defaults.base_url,
    [strLookerVerifySsl]: process.env[strLookerVerifySsl] || defaults.verify_ssl.toString(),
    [strLookerTimeout]: process.env[strLookerTimeout] || defaults.timeout.toString(),
    [strLookerClientId]: process.env[strLookerClientId] || '',
    [strLookerClientSecret]: process.env[strLookerClientSecret] || '',
  }
}

export class NodeSettingsEnv extends ApiSettings {
  constructor() {
    const settings = ValueSettings(readEnvConfig())
    super(settings)
  }

  // @ts-ignore
  readConfig(section?: string) {
    return readEnvConfig()
  }
}
/**
 * Example class that reads a configuration from a file in node
 * @class NodeSettingsIniFile
 *
 * Warning: INI files storing credentials should be secured in the run-time environment, and
 * ignored by version control systems so credentials never get checked in to source code repositories
 */
export class NodeSettingsIniFile extends NodeSettings
  implements IApiSettingsConfig {
  private readonly fileName!: string

  constructor(fileName: string = './looker.ini', section?: string) {
    if (fs.existsSync(fileName)) {
      super(fs.readFileSync(fileName, 'utf-8'), section)
    }
    this.fileName = fileName
  }

  /**
   * Read a configuration section and return it as a generic keyed collection
   * @param section {string} Name of Ini section to read. Optional. Defaults to first section.
   */
  readConfig(section?: string): IApiSection {
    if (fs.existsSync(this.fileName)) {
      return ApiConfigSection(fs.readFileSync(this.fileName, 'utf-8'), section)
    }
    return ApiConfigSection('')
  }
}
