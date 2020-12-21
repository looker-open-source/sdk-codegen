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

import path from 'path'
import { NodeSettingsIniFile } from '@looker/sdk-rtl'

import {
  DeclarationMiner,
  rubyMethodProbe,
  rubyTypeProbe,
} from './declarationMiner'
import { TestConfig } from './testUtils'

const config = TestConfig()

/**
 * This test suite requires a "Miner" section in the root's looker.ini with a
 * base_url. Its value is the relative path to to the directory to be mined.
 * Tests are skipped if this configuration is not found.
 */
describe('Declaration miner', () => {
  const settings = new NodeSettingsIniFile(
    '',
    path.join(config.rootPath, 'looker.ini'),
    'Miner'
  ).readConfig()

  const sourcePath = settings.base_url
  const isConfigured = () => settings.base_url
  const testIfConfigured = isConfigured() ? it : it.skip

  testIfConfigured('should mine files matching the probe settings', () => {
    const miner = new DeclarationMiner(
      sourcePath,
      rubyMethodProbe,
      rubyTypeProbe
    )
    const actual = miner.execute()
    expect(actual.commitHash).toBeDefined()
    expect(actual.remoteOrigin).toBeDefined()
    Object.entries(actual.methods).forEach(([key, value]) => {
      expect(/^GET|POST|DELETE|PUT|PATCH\s/.test(key)).toBe(true)
      expect(key.indexOf(':')).toEqual(-1)
      expect(rubyMethodProbe.fileNamePattern.test(value.sourceFile)).toBe(true)
    })
    Object.entries(actual.types).forEach(([key, value]) => {
      expect(key.indexOf('Mapper')).toEqual(-1)
      expect(rubyTypeProbe.fileNamePattern.test(value.sourceFile)).toBe(true)
    })
  })
})
