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
  ApiConfigMap,
  ApiSettings,
  IApiSettings,
  ValueSettings,
} from './apiSettings'
import { utf8 } from './constants'
import { sdkError } from './transport'

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
  let values : IApiSection = {}
  Object.keys(ApiConfigMap).forEach(key => {
    const envKey = ApiConfigMap[key]
    if (process.env[envKey] !== undefined) {
      // map environment variable keys to config variable keys
      values[key] = process.env[envKey]!
    }
  })
  return values
}

const readIniConfig = (fileName: string, section?: string) => {
  // get environment variables
  const config = readEnvConfig()
  if (fileName && fs.existsSync(fileName)) {
    const values = ApiConfigSection(fs.readFileSync(fileName, utf8), section)
    // override any config file settings with environment values if the environment value is set
    Object.keys(values).forEach(key => {
      config[key] = config[key] || values[key]
    })
  }
  return config
}

export class NodeSettingsEnv extends ApiSettings {
  constructor(contents?: string | IApiSettings, section?: string) {
    let settings
    if (contents) {
      if (typeof contents === 'string') {
        settings = ValueSettings(ApiConfigSection(contents, section))
      } else {
        settings = contents
      }
    } else {
      settings = ValueSettings(readEnvConfig())
    }
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
 * If `fileName` is not specified in the constructor, the default file name is `./looker.ini`
 *
 * **Warning**: INI files storing credentials should be secured in the run-time environment, and
 * ignored by version control systems so credentials never get checked in to source code repositories
 *
 * **Note**: If the configuration file is specified but does **not** exist, an error will be thrown.
 * No error is thrown if the fileName defaulted to `./looker.ini` inside the constructor
 *
 */
export class NodeSettingsIniFile extends NodeSettingsEnv
  implements IApiSettingsConfig {
  private readonly fileName!: string

  constructor(fileName: string = '', section?: string) {
    if (fileName && !fs.existsSync(fileName)) {
      throw sdkError({message: `File ${fileName} was not found`})
    }
    // default fileName to looker.ini
    fileName = fileName || './looker.ini'
    const settings = ValueSettings(readIniConfig(fileName, section))
    super(settings, section)
    this.fileName = fileName
  }

  /**
   * Read a configuration section and return it as a generic keyed collection
   * If the configuration file doesn't exist, environment variables will be used for the values
   * Environment variables, if set, also override the configuration file values
   * @param section {string} Name of Ini section to read. Optional. Defaults to first section.
   *
   */
  readConfig(section?: string): IApiSection {
    return readIniConfig(this.fileName, section)
  }
}
