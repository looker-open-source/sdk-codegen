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
import * as yaml from 'js-yaml'
import { SDKConfig } from './sdkConfig'
import { authGetUrl, getVersionInfo, login, specFileUrl } from './fetchSpec'
import { readFileSync } from './utils'

const dataFile = 'test/data.yml'
// slightly hackish data path determination for tests
const root = fs.existsSync(dataFile) ? '' : '../../'
const testData = yaml.safeLoad(readFileSync(`${root}${dataFile}`))
const localIni = `${root}${testData['iniFile']}`
const config = SDKConfig(localIni)
const props = config['Looker']

describe('fetch operations', () => {
  it('gets version info', async () => {
    expect(props).toBeDefined()
    const version = await getVersionInfo(props)
    expect(version).toBeDefined()
    if (version) {
      expect(version.lookerVersion).toBeDefined()
      expect(version.apiVersion).toBeDefined()
    }
  })

  it('can login', async () => {
    expect(props).toBeDefined()
    const token = await login(props)
    expect(token).toBeDefined()
  })

  it('authGetUrl', async () => {
    expect(props).toBeDefined()
    let fileUrl = specFileUrl(props)
    const content = await authGetUrl(props, fileUrl)
    expect(content).toBeDefined()
    expect(content.swagger).toBeDefined()
    expect(content.swagger).toEqual('2.0')
  })
})
