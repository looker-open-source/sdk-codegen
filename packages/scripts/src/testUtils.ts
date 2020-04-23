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

import * as fs from "fs"
import * as yaml from 'js-yaml'
import { ApiConfig } from '@looker/sdk'
import { specFromFile } from './sdkGenerator'

const utf8 = 'utf-8'

/**
 * Reads configuration information, returning various test values
 * @param {string} rootPath
 * @returns {{testConfig: {[p: string]: any}; localIni: string; baseUrl: any; testData: any; apiVersion: any; testIni: string; configContents: string; rootPath: string; testSection: any; timeout: number}}
 * @constructor
 */
export function TestConfig(rootPath: string = '') {
  const testFile = 'test/data.yml'
  if (!rootPath) {
    rootPath = fs.existsSync(testFile) ? '' : '../../'
  }
  const localIni = process.env['LOOKERSDK_INI'] || `${rootPath}looker.ini`
  const testPath = `${rootPath}test/`
  const dataFile = `${testPath}data.yml`
  const testData = yaml.safeLoad(fs.readFileSync(dataFile, utf8))
  const testIni = `${rootPath}${testData['iniFile']}`
  const configContents = fs.readFileSync(localIni, utf8)
  const config = ApiConfig(configContents)
  const section = config['Looker']
  const baseUrl = section['base_url']
  const timeout = parseInt(section['timeout'], 10)
  const testContents = fs.readFileSync(testIni, utf8)
  const testConfig = ApiConfig(testContents)
  const testSection = testConfig['Looker']
  return {
    rootPath,
    testPath,
    dataFile,
    localIni,
    baseUrl,
    timeout,
    testData,
    testIni,
    configContents,
    config,
    section,
    testConfig,
    testSection,
  }
}

const config = TestConfig()
export const apiTestModel = specFromFile(`${config.testPath}openApiRef.json`)

