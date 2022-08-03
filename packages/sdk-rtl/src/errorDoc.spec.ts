/*

 MIT License

 Copyright (c) 2022 Looker Data Sciences, Inc.

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

import { APIMethods } from './apiMethods'
import type { IApiSettings } from './apiSettings'
import type { IAuthSession } from './authSession'
import { ErrorDoc } from './errorDoc'

/**
 *
 *
 * https://docs.looker.com/r/err/4.0/429/delete/artifact/:namespace/purge
 *
 *
 */
describe('ErrorDoc', () => {
  const external = 'https://docs.looker.com/r/err/4.0/422/post/board_items/bulk'
  const internal =
    'https://docs.looker.com/r/err/internal/422/post/board_items/bulk'
  const hostname = 'https://looker.sdk'
  // const apiVersion = '4.0'
  const settings = { base_url: hostname } as IApiSettings
  const session = { settings: settings } as IAuthSession
  const api = new APIMethods(session, 'mock')
  const errDoc = new ErrorDoc(api)
  // api.apiVersion = apiVersion
  // api.apiPath = `${settings.base_url}/api/${apiVersion}`
  describe('parse', () => {
    it('has a valid regex', () => {
      const ex = String.raw`(?<redirector>https:\/\/docs\.looker\.com\/r\/err\/)(?<apiVersion>.*)\/(?<statusCode>d{3})(?<apiPath>.*)`
      const rx = RegExp(ex, 'i')
      expect(rx).toBeDefined()
      let actual = external.match(rx)
      expect(actual).toBeDefined()
      actual = internal.match(rx)
      expect(actual).toBeDefined()
    })

    it('does not fail', () => {
      const actual = errDoc.parse('')
      expect(actual).toBeDefined()
    })

    it('handles internal pats', () => {
      const actual = errDoc.parse(
        'https://docs.looker.com/r/err/internal/422/post/board_items/bulk'
      )
      expect(actual).toBeDefined()
      expect(actual.redirector).toEqual('https://docs.looker.com/r/err/')
      expect(actual.apiVersion).toEqual('internal')
      expect(actual.statusCode).toEqual('422')
      expect(actual.apiPath).toEqual('post/board_items/bulk')
    })
  })
})
