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
  ApiSettings,
  strBadConfiguration,
  ValueSettings,
  strLookerBaseUrl,
  strLookerVerifySsl,
  strLookerTimeout
} from './apiSettings'
import { defaultTimeout } from './transport'

describe('SDK configuration', () => {
  describe('ValueSettings', () => {
    it('initializes to defaults', () => {
      const settings = ValueSettings({})
      expect(settings.base_url).toEqual('')
      expect(settings.verify_ssl).toEqual(true)
      expect(settings.timeout).toEqual(defaultTimeout)
    })

    it('retrieves the first section by name', () => {
      const settings = ValueSettings({
        [strLookerBaseUrl]: 'base',
        [strLookerVerifySsl]: 'false',
        [strLookerTimeout]: '30',
      })
      expect(settings.base_url).toEqual('base')
      expect(settings.verify_ssl).toEqual(false)
      expect(settings.timeout).toEqual(30)
    })

    it('unquotes ValueSettings', () => {
      const settings = ValueSettings({
        [strLookerBaseUrl]: '"base"',
        [strLookerVerifySsl]: "'false'",
        [strLookerTimeout]: "'30'",
      })
      expect(settings.base_url).toEqual('base')
      expect(settings.verify_ssl).toEqual(false)
      expect(settings.timeout).toEqual(30)
    })
  })

  describe('ApiSettings', () => {
    it('initialization', () => {
      const settings = new ApiSettings({
        base_url: 'base',
        verify_ssl: false,
        timeout: 30,
      })
      expect(settings.base_url).toEqual('base')
      expect(settings.verify_ssl).toEqual(false)
      expect(settings.timeout).toEqual(30)
    })

    it('unquotes initialization', () => {
      const settings = new ApiSettings({
        base_url: '"base"',
        verify_ssl: false,
        timeout: 30,
      })
      expect(settings.base_url).toEqual('base')
      expect(settings.verify_ssl).toEqual(false)
      expect(settings.timeout).toEqual(30)
    })

    it('fails with missing required values', () => {
      const values = {
        base_url: '',
      }

      expect(() => new ApiSettings(values)).toThrow(strBadConfiguration)
    })
  })
})
