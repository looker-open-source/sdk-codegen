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

import {
  ApiConfig,
  NodeSettings,
  NodeSettingsIniFile,
} from './nodeSettings'
import * as fs from 'fs'
import * as yaml from 'js-yaml'
import { defaultTimeout } from './transport'

// TODO create destructurable function for test path resolution
const dataFile = 'test/data.yml'
// slightly hackish data path determination for tests
const root = fs.existsSync(dataFile) ? '' : '../../'
const testData = yaml.safeLoad(fs.readFileSync(`${root}${dataFile}`, 'utf-8'))
const localIni = `${root}${testData['iniFile']}`

describe('NodeSettings', () => {
  const contents = `
[Looker]
# API version is required. 3.1 and 3.0 are currently supported. 3.1 is the current version. 3.0 is deprecated.
api_version=3.1
# Base URL for API. Do not include /api/* in the url
base_url=https://self-signed.looker.com:19999
# API 3 client id
client_id=your_API3_client_id
# API 3 client secret
client_secret=your_API3_client_secret
[Looker30]
# API version is required. 3.1 and 3.0 are currently supported. 3.1 is the current version. 3.0 is deprecated.
api_version=3.0
# Base URL for API. Do not include /api/* in the url
base_url=https://self-signed.looker.com:19999
# API 3 client id
client_id=your_API3_client_id
# API 3 client secret
client_secret=your_API3_client_secret
# Set to false only if testing locally against self-signed certs.
verify_ssl=False
# timeout in seconds
timeout=30
`
  describe('ApiConfig', () => {
    it('discovers multiple sections', () => {
      const config = ApiConfig(contents)
      expect(Object.keys(config)).toEqual(['Looker', 'Looker30'])
    })
  })

  describe('NodeSettingsIni', () => {
    it('settings default to the first section', () => {
      const settings = new NodeSettings(contents)
      expect(settings.api_version).toEqual('3.1')
      expect(settings.timeout).toEqual(defaultTimeout)
      expect(settings.verify_ssl).toEqual(true)
    })

    it('retrieves the first section by name', () => {
      const settings = new NodeSettings(contents, 'Looker')
      expect(settings.api_version).toEqual('3.1')
    })

    it('retrieves the second section by name', () => {
      const settings = new NodeSettings(contents, 'Looker30')
      expect(settings.api_version).toEqual('3.0')
      expect(settings.timeout).toEqual(30)
      expect(settings.verify_ssl).toEqual(false)
    })

    it('fails with a bad section name', () => {
      expect(() => new NodeSettings(contents, 'NotAGoodLookForYou')).toThrow(
        /No section named "NotAGoodLookForYou"/,
      )
    })
  })

  describe('NodeSettingsIniFile', () => {
    it('settings default to the first section', () => {
      const settings = new NodeSettingsIniFile(localIni)
      expect(settings.api_version).toEqual('3.1')
      expect(settings.base_url).toEqual('https://self-signed.looker.com:19999')
      expect(settings.timeout).toEqual(31)
      expect(settings.verify_ssl).toEqual(false)
    })

    it('retrieves the first section by name', () => {
      const settings = new NodeSettingsIniFile(localIni, 'Looker')
      expect(settings.api_version).toEqual('3.1')
      expect(settings.base_url).toEqual('https://self-signed.looker.com:19999')
    })

    it('retrieves the second section by name', () => {
      const settings = new NodeSettingsIniFile(localIni, 'Looker30')
      expect(settings.api_version).toEqual('3.0')
      expect(settings.timeout).toEqual(30)
      expect(settings.verify_ssl).toEqual(false)
    })

    it('fails with a bad section name', () => {
      expect(
        () => new NodeSettingsIniFile(localIni, 'NotAGoodLookForYou'),
      ).toThrow(/No section named "NotAGoodLookForYou"/)
    })
  })
})
