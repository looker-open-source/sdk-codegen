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

import { ApiConfig, ApiSettings, ApiSettingsIniFile } from './apiSettings'

describe('API settings parser', () => {
  const localIni = 'test/looker.ini'
  const contents = `
[Looker]
# API version is required
api_version=3.1
# Base URL for API. Do not include /api/* in the url
base_url=https://<your-looker-endpoint>:19999
# API 3 client id
client_id=your_API3_client_id
# API 3 client secret
client_secret=your_API3_client_secret
# Optional embed secret for SSO embedding
embed_secret=your_embed_SSO_secret
# Optional user_id to impersonate
user_id=
# Set to false if testing locally against self-signed certs. Otherwise leave True
verify_ssl=True
# leave verbose off by default
verbose=false

[Looker30]
# API version is required
api_version=3.0
# Base URL for API. Do not include /api/* in the url
base_url=https://<your-looker-endpoint>:19999
# API 3 client id
client_id=your_API3_client_id
# API 3 client secret
client_secret=your_API3_client_secret
# Optional embed secret for SSO embedding
embed_secret=your_embed_SSO_secret
# Optional user_id to impersonate
user_id=
# Set to false if testing locally against self-signed certs. Otherwise leave True
verify_ssl=True
# leave verbose off by default
verbose=false
`
  describe('ApiConfig', () => {
    it('discovers multiple sections', () => {
      const config = ApiConfig(contents)
      expect(Object.keys(config)).toEqual(['Looker', 'Looker30'])
    })
  })

  describe('ApiSettings', () => {
    it('settings default to the first section', () => {
      const settings = new ApiSettings(contents)
      expect(settings.api_version).toEqual('3.1')
    })

    it('retrieves the first section by name', () => {
      const settings = new ApiSettings(contents, 'Looker')
      expect(settings.api_version).toEqual('3.1')
    })

    it('retrieves the second section by name', () => {
      const settings = new ApiSettings(contents, 'Looker30')
      expect(settings.api_version).toEqual('3.0')
    })

    it('fails with a bad section name', () => {
      expect(() => new ApiSettings(contents, 'NotAGoodLookForYou'))
        .toThrow(/No section named "NotAGoodLookForYou"/)
    })
  })

  describe('ApiSettingsIniFile', () => {
    it('settings default to the first section', () => {
      const settings = new ApiSettingsIniFile(localIni)
      expect(settings.api_version).toEqual('3.1')
      expect(settings.base_url).toEqual('https://self-signed.looker.com:19999')
    })

    it('retrieves the first section by name', () => {
      const settings = new ApiSettingsIniFile(localIni, 'Looker')
      expect(settings.api_version).toEqual('3.1')
      expect(settings.base_url).toEqual('https://self-signed.looker.com:19999')
    })

    it('retrieves the second section by name', () => {
      const settings = new ApiSettingsIniFile(localIni, 'Looker30')
      expect(settings.api_version).toEqual('3.0')
    })

    it('fails with a bad section name', () => {
      expect(() => new ApiSettingsIniFile(localIni, 'NotAGoodLookForYou'))
        .toThrow(/No section named "NotAGoodLookForYou"/)
    })
  })
})
