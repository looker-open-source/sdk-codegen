/*

 MIT License

 Copyright (c) 2020 Looker Data Sciences, Inc.

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

import * as fs from 'fs'
import { ApiConfig } from '@looker/sdk'
import { ApiModel } from '../sdkModels'

interface IKeyAny {
  [key: string]: any
}

const utf8 = 'utf-8'

export const specFromFile = (specFile: string): ApiModel => {
  const specContent = fs.readFileSync(specFile, { encoding: utf8 })
  return ApiModel.fromString(specContent)
}

/**
 * Properties used for various typescript-based tests
 */
export interface ITestConfig {
  apiTestModel: ApiModel
  rootPath: string
  testPath: string
  dataFile: string
  localIni: string
  baseUrl: string
  timeout: number
  testData: any
  testIni: string
  configContents: string
  config: IKeyAny
  section: IKeyAny
  testConfig: IKeyAny
  testSection: IKeyAny
}

/**
 * Reads configuration information, returning various test values
 * @param {string} rootPath
 * @returns {{testConfig: {[p: string]: any}; localIni: string; baseUrl: any; testData: any; apiVersion: any; testIni: string; configContents: string; rootPath: string; testSection: any; timeout: number}}
 * @constructor
 */
export function TestConfig(rootPath = ''): ITestConfig {
  const testFile = 'data.yml.json'
  if (!rootPath) {
    rootPath = fs.existsSync(`test/${testFile}`) ? '' : '../../'
  }
  const localIni = process.env.LOOKERSDK_INI || `${rootPath}looker.ini`
  const testPath = `${rootPath}test/`
  const dataFile = `${testPath}${testFile}`
  const testData = JSON.parse(fs.readFileSync(dataFile, utf8))
  const testIni = `${rootPath}${testData.iniFile}`
  const configContents = fs.readFileSync(localIni, utf8)
  const config = ApiConfig(configContents)
  const section = config.Looker
  const baseUrl = section.base_url
  const timeout = parseInt(section.timeout, 10)
  const testContents = fs.readFileSync(testIni, utf8)
  const testConfig = ApiConfig(testContents)
  const testSection = testConfig.Looker
  const apiTestModel = specFromFile(`${testPath}openApiRef.json`)
  return {
    apiTestModel,
    baseUrl,
    config,
    configContents,
    dataFile,
    localIni,
    rootPath,
    section,
    testConfig,
    testData,
    testIni,
    testPath,
    testSection,
    timeout,
  }
}
