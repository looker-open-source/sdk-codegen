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

import { NodeTransport } from './nodeTransport'
import { NodeSession } from './nodeSession'
import { ApiConfig, NodeSettingsEnv, NodeSettingsIniFile } from './nodeSettings'
import * as fs from 'fs'
import * as yaml from 'js-yaml'
import {
  strLookerApiVersion,
  strLookerBaseUrl,
  strLookerClientId, strLookerClientSecret,
  strLookerTimeout,
  strLookerVerifySsl,
} from './apiSettings'
import { defaultTimeout } from './transport'
import { isTrue } from './constants'
import { utf8 } from '../../../src/utils'

// TODO create destructurable function for test path resolution
const dataFile = 'test/data.yml'
// slightly hackish data path determination for tests
const root = fs.existsSync(dataFile) ? '' : '../../'
const testData = yaml.safeLoad(fs.readFileSync(`${root}${dataFile}`, 'utf-8'))
const localIni = `${root}${testData['iniFile']}`

describe('NodeSession', () => {
  const settings = new NodeSettingsIniFile(localIni, 'Looker')
  const transport = new NodeTransport(settings)

  describe('isAuthenticated', () => {
    it('unauthenticated logout returns false', async () => {
      const session = new NodeSession(settings, transport)
      expect(session.isAuthenticated()).toEqual(false)
      const actual = await session.logout()
      expect(actual).toEqual(false)
    })
  })

  describe('integration tests', () => {
    it('initializes', () => {
      const session = new NodeSession(settings, transport)
      expect(session.settings).toEqual(settings)
      expect(session.isAuthenticated()).toEqual(false)
      expect(session.isSudo()).toEqual(false)
    })

    it('default auth logs in and out with good credentials', async () => {
      const session = new NodeSession(settings, transport)
      expect(session.isAuthenticated()).toEqual(false)
      const token = await session.login()
      expect(token).toBeDefined()
      expect(token.access_token).toBeDefined()
      expect(session.isAuthenticated()).toEqual(true)
      const result = await session.logout()
      expect(result).toEqual(true)
      expect(session.isAuthenticated()).toEqual(false)
    })
  })

  describe('environmental configuration', () => {
    it('no INI file', async () => {
      const section = ApiConfig(fs.readFileSync(localIni, utf8))['Looker']
      const verify_ssl = isTrue(section['verify_ssl'] || 'false')
      // populate environment variables
      process.env[strLookerTimeout] = section['timeout'] || defaultTimeout.toString()
      process.env[strLookerClientId] = section['client_id']
      process.env[strLookerClientSecret] = section['client_secret']
      process.env[strLookerBaseUrl] = section['base_url']
      process.env[strLookerApiVersion] = section['api_version'] || '3.1'
      process.env[strLookerVerifySsl] = verify_ssl.toString()

      const settings = new NodeSettingsEnv()
      expect(settings.base_url).toEqual(section['base_url'])
      expect(settings.api_version).toEqual(section['api_version'] || '3.1')
      expect(settings.timeout.toString()).toEqual(section['timeout'] || defaultTimeout.toString())
      expect(settings.verify_ssl).toEqual(verify_ssl)

      const session = new NodeSession(settings, transport)
      expect(session.isAuthenticated()).toEqual(false)
      const token = await session.login()
      expect(token).toBeDefined()
      expect(token.access_token).toBeDefined()
      expect(session.isAuthenticated()).toEqual(true)
      const result = await session.logout()
      expect(result).toEqual(true)
      expect(session.isAuthenticated()).toEqual(false)

      // reset environment variables
      delete process.env[strLookerTimeout]
      delete process.env[strLookerClientId]
      delete process.env[strLookerClientSecret]
      delete process.env[strLookerBaseUrl]
      delete process.env[strLookerApiVersion]
      delete process.env[strLookerVerifySsl]
    })
  })
})
