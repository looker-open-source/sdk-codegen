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

import { ApiSettings, strBadConfiguration, ValueSettings } from './apiSettings'

describe('SDK configuration', () => {
  describe('ValueSettings', () => {
    it('initializes to defaults', () => {
      const settings = ValueSettings({})
      expect(settings.api_version).toEqual('3.1')
      expect(settings.base_url).toEqual('')
      expect(settings.client_id).toEqual('')
      expect(settings.client_secret).toEqual('')
      expect(settings.embed_secret).toEqual('')
    })

    it('retrieves the first section by name', () => {
      const settings = ValueSettings({
        LOOKER_API_VERSION: '3.0',
        LOOKER_BASE_URL: 'base',
        LOOKER_CLIENT_ID: 'client',
        LOOKER_CLIENT_SECRET: 'secret',
        LOOKER_EMBED_SECRET: 'embed'
      })
      expect(settings.api_version).toEqual('3.0')
      expect(settings.base_url).toEqual('base')
      expect(settings.client_id).toEqual('client')
      expect(settings.client_secret).toEqual('secret')
      expect(settings.embed_secret).toEqual('embed')
    })

  })

  describe('ApiSettings', () => {
    it('initialization', () => {
      const settings = new ApiSettings({
        api_version: '3.1',
        base_url: 'base',
        embed_secret: 'embed'
      })
      expect(settings.api_version).toEqual('3.1')
      expect(settings.base_url).toEqual('base')
      expect(settings.embed_secret).toEqual('embed')
    })

    it('fails with missing required values', () => {
      const values = {
        api_version: '',
      }

      expect(() => new ApiSettings(values))
        .toThrow(strBadConfiguration)
    })
  })
})
