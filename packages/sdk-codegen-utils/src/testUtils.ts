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
import path from 'path';
import * as yaml from 'js-yaml';
import isEmpty from 'lodash/isEmpty';
import { findRootSync } from '@manypkg/find-root';
import type { IApiConfig } from '@looker/sdk-node';
import { ApiConfig, NodeSession, readEnvConfig } from '@looker/sdk-node';
import { ApiModel } from '@looker/sdk-codegen/src/sdkModels';
import { upgradeSpecObject } from '@looker/sdk-codegen/src/specConverter';
import type {
  IAPIMethods,
  IApiSection,
  IApiSettings,
  IAuthSession,
} from '@looker/sdk-rtl';
import { ApiSettings } from '@looker/sdk-rtl';
/* eslint-disable no-restricted-imports */
import { Looker40SDK, functionalSdk40 } from '@looker/sdk';

const utf8 = 'utf-8';

/**
 * Convert a spec file into an APIModel
 * @param specFile name of spec file
 */
export const specFromFile = (specFile: string): ApiModel => {
  const specContent = fs.readFileSync(specFile, { encoding: utf8 });
  return ApiModel.fromString(specContent);
};

/**
 * Properties used for various typescript-based tests
 */
export interface ITestConfig {
  /** the openApi.json snapshot in the test/ dir */
  apiTestModel: ApiModel;
  /** root dir of this repository */
  rootPath: string;
  /** <rootPath>/test dir */
  testPath: string;
  /** test/data.yml file */
  dataFile: string;
  /** root looker.ini file or LOOKERSDK_INI value */
  localIni: string;
  /** contents of test/data.yml */
  testData: any;
  /** ini file configured in testData */
  testIni: string;
  /* melded API config settings */
  settings: IApiSettings;
  /** melded sdk configuration session */
  session: IAuthSession;
  /** initialized typescript SDK from melded configuration */
  sdk: IAPIMethods;
}

let rootPath = '';
/** fully resolved root dir of the repository */
export const getRootPath = (): string => {
  if (!rootPath) {
    rootPath = findRootSync(__dirname).rootDir;
  }
  return rootPath;
};

/**
 * Fully resolved path to a file based from the root path
 * @param fileName to path. It can start with folders
 */
export const rootFile = (fileName = ''): string =>
  path.join(getRootPath(), fileName);

let _mockSpec: ApiModel;
/**
 * Returns the entire "undocumented" API specification as the model to use for mocking
 * because it includes everything from our current API
 */
export const mockApiSpec = () => {
  if (!_mockSpec) {
    const spec = rootFile('test/core/undoc_api_4.0.json');
    if (!fs.existsSync(spec)) {
      throw new Error(
        `run 'bin/sdk_gen -f' to generate the API spec file '${spec}'`
      );
    }
    const obj = JSON.parse(fs.readFileSync(spec, utf8));
    const oas = upgradeSpecObject(obj);
    _mockSpec = ApiModel.fromJson(oas);
  }
  return _mockSpec;
};

/**
 * Fully resolved path to a file in the codegen test data folder
 * @param filename to path. It can start with folders
 */
export const testFile = (filename = ''): string =>
  path.join(rootFile('/packages/sdk-codegen-utils/data/'), filename);

export class MeldSettings extends ApiSettings {
  constructor(private settings: Partial<IApiSettings>) {
    super(settings);
  }

  readConfig(_section?: string): IApiSection {
    return {
      client_id: this.settings.client_id,
      client_secret: this.settings.client_secret,
    };
  }
}

/**
 * Find a file from the current directory up to the root of the repository
 * @param fileName to find from current directory
 */
export const lookUp = (fileName: string) => {
  const root = getRootPath();
  let dir = __dirname;
  while (dir >= root) {
    const f = path.join(dir, fileName);
    if (fs.existsSync(f)) {
      return f;
    } else {
      dir = path.join(dir, '../');
    }
  }
  return '';
};

/**
 * Gets the cypress settings
 */
export const getCypressSettings = (): Record<string, string> => {
  const cypressFile = lookUp('cypress.env.json');
  const config: any = fs.existsSync(cypressFile)
    ? JSON.parse(fs.readFileSync(cypressFile, utf8))
    : {};
  const cypress: Record<string, string> = {};
  Object.keys(config).forEach((k) => (cypress[k.toLowerCase()] = config[k]));
  const env = readEnvConfig('CYPRESS');
  return {
    ...cypress,
    ...env,
  };
};

/**
 * Melds CYPRESS environment variables with cypress.env.json and optional looker.ini and returns the settings collection
 * @param rootPath root location of repository
 * @param localIni full name of default looker.ini. Needs to be passed in, but doesn't need to exist
 */
export const loadApiSettings = (
  _rootPath: string,
  localIni: string
): IApiSettings => {
  const cypressSettings = getCypressSettings();
  const local: IApiConfig = fs.existsSync(localIni) ? ApiConfig(localIni) : {};
  const settings = {
    verify_ssl: false,
    base_url: 'https://localhost:19999',
    ...local,
    ...cypressSettings,
  };
  const result = new MeldSettings(settings);
  const creds = result.readConfig();
  if (isEmpty(creds)) {
    throw new Error(
      `Test SDK not initialized. Configure environment variables, 'cypress.env.json', or '${localIni}'`
    );
  }
  return result;
};

/**
 * get a random value use for entity name constraints
 */
export const randomize = () => {
  return Math.round(Math.random() * 100000);
};

/**
 * Create a uniquely named title
 * @param rando value to use for unique name combo
 * @param title of entity to name
 */
export const entitle = (rando: string | number, title?: string) => {
  return `${rando} ${title ?? ''}`.trim();
};

export const createFunSdk = (): IAPIMethods => {
  const root = getRootPath();
  const localIni = process.env.LOOKERSDK_INI || `${root}looker.ini`;
  const settings = loadApiSettings(root, localIni);
  const session = new NodeSession(settings);
  return functionalSdk40(session);
};

/**
 * Reads configuration information, returning various test values
 * @param rootPath
 * @returns {{testConfig: {[p: string]: any}; localIni: string; baseUrl: any; testData: any; apiVersion: any; testIni: string; configContents: string; rootPath: string; testSection: any; timeout: number}}
 * @constructor
 */
export const TestConfig = (rootPath = getRootPath()): ITestConfig => {
  const testDataFile = 'data.yml';
  const localIni = process.env.LOOKERSDK_INI || `${rootPath}looker.ini`;
  const settings = loadApiSettings(rootPath, localIni);
  const session = new NodeSession(settings);
  const sdk: IAPIMethods = new Looker40SDK(session);
  const testPath = `${rootPath}/packages/sdk-codegen-utils/data/`;
  const dataFile = testFile(testDataFile);
  const testData: any = fs.existsSync(dataFile)
    ? yaml.load(fs.readFileSync(dataFile, utf8))
    : {};
  const apiTestModel = specFromFile(testFile('openApiRef.json'));
  const testIni = `${rootPath}${testData.iniFile}`;
  return {
    apiTestModel,
    dataFile,
    localIni,
    rootPath,
    testData,
    testIni,
    testPath,
    settings,
    session,
    sdk,
  };
};
