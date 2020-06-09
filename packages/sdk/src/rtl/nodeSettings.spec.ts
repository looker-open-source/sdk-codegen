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

import { TestConfig } from '../testUtils'
import { ApiConfig, NodeSettings, NodeSettingsIniFile } from './nodeSettings'
import { defaultTimeout } from './transport'
import { boolDefault } from './constants'
import {
  IApiSettings,
  strLookerBaseUrl,
  strLookerClientId,
  strLookerClientSecret,
  strLookerTimeout,
  strLookerVerifySsl,
} from './apiSettings'

const config = TestConfig()

describe('NodeSettings', () => {
  const contents = `
[Looker]
base_url=${config.baseUrl}
client_id=your_API3_client_id
client_secret=your_API3_client_secret
timeout=${config.timeout}
[Looker30]
api_version=3.0
base_url=https://self-signed.looker.com:19999
client_id=your_API3_client_id
client_secret=your_API3_client_secret
verify_ssl=False
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
      expect(settings.timeout).toEqual(config.timeout)
      expect(settings.verify_ssl).toEqual(true)
    })

    it('retrieves the first section by name', () => {
      const settings = new NodeSettings(contents, 'Looker')
      expect(settings.timeout).toEqual(config.timeout)
    })

    it('retrieves the second section by name', () => {
      const settings = new NodeSettings(contents, 'Looker30')
      expect(settings.timeout).toEqual(30)
      expect(settings.verify_ssl).toEqual(false)
    })

    it('fails with a bad section name', () => {
      expect(() => new NodeSettings(contents, 'NotAGoodLookForYou')).toThrow(
        /No section named "NotAGoodLookForYou"/
      )
    })
  })

  describe('NodeSettingsEnv', () => {
    const verifySsl = boolDefault(
      config.testSection.verify_ssl,
      false
    ).toString()

    beforeAll(() => {
      // populate environment variables
      process.env[strLookerTimeout] = defaultTimeout.toString()
      process.env[strLookerClientId] = config.testSection.client_id
      process.env[strLookerClientSecret] = config.testSection.client_secret
      process.env[strLookerBaseUrl] = config.testSection.base_url
      process.env[strLookerVerifySsl] = verifySsl.toString()
    })

    afterAll(() => {
      // reset environment variables
      delete process.env[strLookerTimeout]
      delete process.env[strLookerClientId]
      delete process.env[strLookerClientSecret]
      delete process.env[strLookerBaseUrl]
      delete process.env[strLookerVerifySsl]
    })

    it('settings are retrieved from environment variables', () => {
      const settings = new NodeSettings('')
      expect(settings.base_url).toEqual(config.baseUrl)
      expect(settings.timeout).toEqual(defaultTimeout)
      expect(settings.verify_ssl).toEqual(false)
    })

    it('empty file name uses environment variables', () => {
      const settings = new NodeSettingsIniFile('')
      expect(settings.base_url).toEqual(config.baseUrl)
      expect(settings.timeout).toEqual(defaultTimeout)
      expect(settings.verify_ssl).toEqual(false)
    })

    it('partial INI uses environment variables', () => {
      const settings = new NodeSettings({
        base_url: config.baseUrl,
      } as IApiSettings)
      expect(settings.base_url).toEqual(config.baseUrl)
      expect(settings.timeout).toEqual(defaultTimeout)
      expect(settings.verify_ssl).toEqual(false)
      const creds = settings.readConfig()
      expect(creds.client_id).toBeDefined()
      expect(creds.client_secret).toBeDefined()
    })

    it('environment variables override ini values', () => {
      process.env[strLookerTimeout] = '66'
      process.env[strLookerVerifySsl] = '1'
      const settings = new NodeSettingsIniFile(config.testIni)
      expect(settings.base_url).toEqual(config.testSection.base_url)
      expect(settings.timeout).toEqual(66)
      expect(settings.verify_ssl).toEqual(true)
      // process.env[strLookerTimeout] = config.testSection['timeout'] || defaultTimeout.toString()
      // process.env[strLookerVerifySsl] = verifySsl.toString()
    })
  })

  describe('NodeSettingsIniFile', () => {
    xit('settings default to the first section', () => {
      const settings = new NodeSettingsIniFile(config.testIni)
      expect(settings.base_url).toEqual(config.testSection.base_url)
      expect(settings.timeout).toEqual(parseInt(config.testSection.timeout, 10))
      expect(settings.verify_ssl).toEqual(config.testSection.verify_ssl)
    })

    xit('retrieves the first section by name', () => {
      const settings = new NodeSettingsIniFile(config.testIni, 'Looker')
      expect(settings.base_url).toEqual(config.testSection.base_url)
      expect(settings.timeout).toEqual(parseInt(config.testSection.timeout, 10))
      expect(settings.verify_ssl).toEqual(config.testSection.verify_ssl)
    })

    xit('retrieves the second section by name', () => {
      const settings = new NodeSettingsIniFile(config.testIni, 'Looker31')
      expect(settings.timeout).toEqual(30)
      expect(settings.verify_ssl).toEqual(false)
    })

    it('fails with a bad section name', () => {
      expect(
        () => new NodeSettingsIniFile(config.testIni, 'NotAGoodLookForYou')
      ).toThrow(/No section named "NotAGoodLookForYou"/)
    })

    it('fails with a bad file name', () => {
      expect(
        () => new NodeSettingsIniFile('missing.ini', 'NotAGoodLookForYou')
      ).toThrow(/File missing.ini was not found/)
    })
  })
})
