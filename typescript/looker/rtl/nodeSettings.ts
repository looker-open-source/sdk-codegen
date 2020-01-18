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
  ApiSettings, DefaultSettings,
  IApiSettings,
  ValueSettings,
} from './apiSettings'
import { unquote, utf8 } from './constants'
import { sdkError } from './transport'

export interface IApiSection {
  [key: string]: string;
}

/**
 * Parses `.ini` formatted content
 * @param contents formatted as an `.ini` file
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
 * A utility function that loads environment variables and maps them to the standard configuration values
 *
 * @returns the populated `IApiSection`, which may be empty
 */
const readEnvConfig = () => {
  let values : IApiSection = {}
  Object.keys(ApiConfigMap).forEach(key => {
    const envKey = ApiConfigMap[key]
    if (process.env[envKey] !== undefined) {
      // map environment variable keys to config variable keys
      values[key] = unquote(process.env[envKey])
    }
  })
  return values
}

/**
 * A utility function that loads the configuration values from the specified file name and overrides them
 * with environment variable values, if the environment variables exist
 *
 * @param {string} fileName Name of configuration file to read
 * @param {string} section Optional. Name of section of configuration file to read
 * @returns {IApiSection} containing the configuration values
 */
const readIniConfig = (fileName: string, section?: string) => {
  // get environment variables
  let config = readEnvConfig()
  if (fileName && fs.existsSync(fileName)) {
    // override any config file settings with environment values if the environment value is set
    config  = {...ApiConfigSection(fs.readFileSync(fileName, utf8), section), ...config}
  }
  // Unquote any quoted configuration values
  Object.keys(config).forEach(key => {
    const val = config[key]
    if (typeof val === 'string') {
      config[key] = unquote(val)
    }
  })
  return config
}

/**
 * Read configuration settings from Node environment variables
 *
 * This class initializes SDK settings **only** from the values passed in to its constructor and
 * (potentially) configured environment variables, and does not read a configuration file at all
 *
 * Any environment variables that **are** set, will override the values passed in to the constructor
 * with the same key
 *
 */
export class NodeSettings extends ApiSettings {
  constructor(contents?: string | IApiSettings, section?: string) {
    let settings: IApiSettings
    if (contents) {
      if (typeof contents === 'string') {
        settings = ApiConfigSection(contents, section) as IApiSettings
      } else {
        settings = contents
      }
      settings = {...readEnvConfig(), ...settings}
    } else {
      settings = readEnvConfig() as IApiSettings
    }
    super({...DefaultSettings(), ...settings})
  }

  // @ts-ignore
  readConfig(section?: string) : IApiSection {
    return readEnvConfig()
  }
}

/**
 * Example class that reads a configuration from a file in node
 *
 * If `fileName` is not specified in the constructor, the default file name is `./looker.ini`
 *
 * **Warning**: `.ini` files storing credentials should be secured in the run-time environment, and
 * ignored by version control systems so credentials never get checked in to source code repositories.
 * A recommended pattern is using Node environment variables to specify confidential API credentials
 * while using an `.ini` file for values like `base_url` and `api_version`.
 *
 * **Note**: If the configuration file is specified but does **not** exist, an error will be thrown.
 * No error is thrown if the fileName defaulted to `./looker.ini` inside the constructor and that
 * file does not exist. In that case, configuration from environment variables will be required.
 *
 */
export class NodeSettingsIniFile extends NodeSettings {
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
