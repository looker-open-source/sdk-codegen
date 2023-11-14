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

import type { IApiVersion, IApiVersionElement } from './specConverter'
import { getSpecsFromVersions, include31 } from './specConverter'

const payload = `{
  "looker_release_version":"22.3.0",
  "current_version":{"version":"4.0","full_version":"4.0.22.3","status":"current","swagger_url":"https://localhost:19999/api/4.0/swagger.json"},
  "supported_versions":[
    {"version":"2.99","full_version":"2.99.0","status":"internal_test","swagger_url":"https://localhost:19999/api/2.99/swagger.json"},
    {"version":"4.0","full_version":"4.0.22.3","status":"current","swagger_url":"https://localhost:19999/api/4.0/swagger.json"},
    {"version":"4.0","full_version":"4.0.22.3","status":"undocumented","swagger_url":"https://localhost:19999/api/4.0/undoc.json"}
  ],
  "api_server_url":"https://localhost:19999",
  "web_server_url":"https://localhost:9999"
}`
describe('specConverter', () => {
  describe('includeVersion', () => {
    it.skip('includes 4.0', () => {
      const v: IApiVersionElement = {
        status: 'stable',
        version: '4.0',
        full_version: '4.0.22.4',
        swagger_url: 'swagger',
      }
      expect(include31(v)).toEqual(true)
    })
  })

  it('getSpecsFromVersions', async () => {
    const versions: IApiVersion = JSON.parse(payload)
    const specs = await getSpecsFromVersions(versions)
    expect(Object.keys(specs)).toEqual(['4.0', '4.0u'])
  })
})
