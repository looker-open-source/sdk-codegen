/*

 MIT License

 Copyright (c) 2021 Looker Data Sciences, Inc.

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

import * as fs from 'fs';
import * as ini from 'ini';
import type { IApiSettings, IApiSection } from '@looker/sdk-rtl';
import {
  ApiConfigMap,
  ApiSettings,
  DefaultSettings,
  ValueSettings,
  sdkError,
  unquote,
} from '@looker/sdk-rtl';

/**
 * Read an environment key. Use defaultValue if it doesn't exist
 * @param {string} name Environment variable name
 * @param {string | undefined} defaultValue
 * @returns {string | undefined} The value of the environment variable if it exists, or defaultValue
 */
export const getenv = (
  name: string,
  defaultValue: string | undefined = undefined
) => {
  const val = process.env[name];
  return val === undefined ? defaultValue : val;
};

/**
 * Complete .INI file parse results
 */
export interface IApiConfig {
  [key: string]: any;
}

/**
 * Parses `.ini` formatted content
 * @param contents formatted as an `.ini` file
 * @constructor
 */
export const ApiConfig = (contents: string): IApiConfig => ini.parse(contents);

/**
 * Extract named or (default) first section from INI file
 * @param contents {string} Parameters formatted as an INI file
 * @param section {[key: string]: any;} Contents of INI section
 * @constructor
 */
export const ApiConfigSection = (
  contents: string,
  section?: string
): IApiSection => {
  const config = ApiConfig(contents);
  if (!section) {
    // default to the first section if not specified
    section = Object.keys(config)[0];
  }
  const settings = config[section];
  if (!settings) {
    throw new Error(`No section named "${section}" was found`);
  }
  if (settings.api_version) {
    console.warn(
      'api_version is no longer read from a configuration file by the SDK'
    );
  }
  return settings;
};

/**
 * A utility function that loads environment variables and maps them to the standard configuration values
 *
 * @returns the populated `IApiSection`, which may be empty
 */
export const readEnvConfig = (envPrefix: string) => {
  const values: IApiSection = {};
  const configMap = ApiConfigMap(envPrefix);
  Object.keys(configMap).forEach((key) => {
    const envKey = configMap[key];
    if (process.env[envKey] !== undefined) {
      // Value exists. Map environment variable keys to config variable keys
      const val = unquote(process.env[envKey]);
      values[key] = val;
    }
  });
  return values;
};

/**
 * A utility function that loads the configuration values from the specified file name and overrides them
 * with environment variable values, if the environment variables exist
 *
 * @param {string} fileName Name of configuration file to read
 * @param envPrefix environment variable prefix. Pass an empty string to skip environment reading.
 * @param {string} section Optional. Name of section of configuration file to read
 * @returns {IApiSection} containing the configuration values
 */
export const readIniConfig = (
  fileName: string,
  envPrefix: string,
  section?: string
) => {
  // get environment variables
  let config = readEnvConfig(envPrefix);
  if (fileName && fs.existsSync(fileName)) {
    // override any config file settings with environment values if the environment value is set
    config = {
      ...ApiConfigSection(fs.readFileSync(fileName, 'utf8'), section),
      ...config,
    };
  }
  // Unquote any quoted configuration values
  Object.keys(config).forEach((key) => {
    const val = config[key];
    if (typeof val === 'string') {
      config[key] = unquote(val);
    }
  });
  return config;
};

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
  protected readonly envPrefix!: string;
  public section: string;

  /**
   * Initialize config settings for the node SDK runtime
   * @param envPrefix Environment variable name prefix. Use empty string to not read the environment
   * @param contents contents of the read config
   * @param section name of ini section to process
   */
  constructor(
    envPrefix: string,
    contents?: string | IApiSettings,
    section?: string
  ) {
    let settings: IApiSettings;
    if (contents) {
      if (typeof contents === 'string') {
        settings = ApiConfigSection(contents, section) as IApiSettings;
      } else {
        settings = contents;
      }
      settings = { ...readEnvConfig(envPrefix), ...settings };
    } else {
      settings = readEnvConfig(envPrefix) as IApiSettings;
    }
    super({ ...DefaultSettings(), ...settings });
    this.section = section ?? '';
    this.envPrefix = envPrefix;
  }

  /**
   * **NOTE**: If `envPrefix` is defined in the constructor, environment variables will be read in this call.
   *
   * @param _section section name is ignored here.
   */
  readConfig(_section?: string): IApiSection {
    return readEnvConfig(this.envPrefix);
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
 * while using an `.ini` file for values like `base_url`.
 *
 * **Note**: If the configuration file is specified but does **not** exist, an error will be thrown.
 * No error is thrown if the fileName defaulted to `./looker.ini` inside the constructor and that
 * file does not exist. In that case, configuration from environment variables will be required.
 *
 */
export class NodeSettingsIniFile extends NodeSettings {
  private readonly fileName!: string;

  constructor(envPrefix: string, fileName = '', section?: string) {
    if (fileName && !fs.existsSync(fileName)) {
      throw sdkError({ message: `File ${fileName} was not found` });
    }
    // default fileName to looker.ini
    fileName = fileName || './looker.ini';
    const config = readIniConfig(fileName, envPrefix, section);
    const settings = ValueSettings(config, envPrefix);
    super(envPrefix, settings, section);
    this.fileName = fileName;
  }

  /**
   * Read a configuration section and return it as a generic keyed collection
   * If the configuration file doesn't exist, environment variables will be used for the values
   * Environment variables, if set, also override the configuration file values
   *
   * **NOTE**: If `envPrefix` is defined in the constructor, environment variables will be read in this call.
   *
   * @param section {string} Name of Ini section to read. Optional. Defaults to first section.
   *
   */
  readConfig(section?: string): IApiSection {
    section = section || this.section;
    return readIniConfig(this.fileName, this.envPrefix, section);
  }
}
