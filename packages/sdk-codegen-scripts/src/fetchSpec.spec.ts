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
import { TestConfig } from 'packages/sdk-test-utils'
import {
  authGetUrl,
  fetchLookerVersions,
  getVersionInfo,
  login,
  swaggerFileUrl,
  supportedVersion,
  logConvertSpec,
  openApiFileName,
} from './fetchSpec'
import { ISDKConfigProps } from './sdkConfig'
import { isFileSync } from './nodeUtils'

const config = TestConfig()
const props = (config.section as unknown) as ISDKConfigProps
// api_version is no longer part of the INI, now set by sdkGen iterator
props.api_version = '4.0'

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

  it('get versions', async () => {
    expect(props).toBeDefined()
    const actual = await fetchLookerVersions(props)
    expect(actual).toBeDefined()
    const version: any = supportedVersion('4.0', actual)
    expect(version).toBeDefined()
    if (version) {
      expect(version.version).toEqual('4.0')
      expect(version.swagger_url).toBeDefined()
      // TODO enable when these values are surfaced in Looker
      // expect(version.swagger_min_url).toBeDefined()
      // expect(version.openapi_url).toBeDefined()
      // expect(version.openapi_min_url).toBeDefined()
    }
  })

  it('authGetUrl', async () => {
    expect(props).toBeDefined()
    const fileUrl = swaggerFileUrl(props, await fetchLookerVersions(props))
    const content = await authGetUrl(props, fileUrl)
    expect(content).toBeDefined()
    expect(content.swagger).toBeDefined()
    expect(content.swagger).toEqual('2.0')
  })

  it('logConvertSpec', async () => {
    expect(props).toBeDefined()
    const name = 'Looker'
    const fileName = openApiFileName(name, props)
    const lookerVersions = await fetchLookerVersions(props)
    // Make sure the file doesn't exist
    if (isFileSync(fileName)) {
      fs.unlinkSync(fileName)
    }
    const actual = await logConvertSpec(name, props, lookerVersions)
    expect(actual).toBeDefined()
    expect(actual.length).toBeGreaterThan(0)
  })
})
