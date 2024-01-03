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
import { config } from 'dotenv';

const utf8 = 'utf-8';

/**
 * Properties used for various typescript-based tests
 */
export interface ITestConfig {
  rootPath: string;
  testPath: string;
  dataFile: string;
  localIni: string;
  testData: any;
  testIni: string;
}

const homeToRoost = '../../../../';

export const getRootPath = () => path.join(__dirname, homeToRoost);
export const rootFile = (fileName = '') => path.join(getRootPath(), fileName);
export const readFile = (fileName: string) => fs.readFileSync(fileName, utf8);

/**
 * Reads configuration information, returning various test values
 * @param {string} rootPath
 * @returns {{testConfig: {[p: string]: any}; localIni: string; baseUrl: any; testData: any; apiVersion: any; testIni: string; configContents: string; rootPath: string; testSection: any; timeout: number}}
 * @constructor
 */
export const TestConfig = (rootPath = ''): ITestConfig => {
  config();
  const testFile = 'data.yml.json';
  rootPath = rootPath || getRootPath();
  let localIni = process.env.LOOKERSDK_INI || rootFile('looker.ini');
  const testPath = rootFile('test/');
  const dataFile = `${testPath}${testFile}`;
  const testData = JSON.parse(fs.readFileSync(dataFile, utf8));
  let testIni = `${rootPath}${testData.iniFile}`;

  // If .ini files don't exist, don't try to read them downstream and expect environment variables to be set
  if (!fs.existsSync(localIni)) localIni = '';
  if (!fs.existsSync(testIni)) testIni = '';

  return {
    dataFile,
    localIni,
    rootPath,
    testData,
    testIni,
    testPath,
  };
};
