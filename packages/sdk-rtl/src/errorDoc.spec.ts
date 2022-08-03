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
import type { ErrorCodeIndex } from './errorDoc'
import { ErrorDoc, ErrorDocRx } from './errorDoc'

const sampleIndex: ErrorCodeIndex = {
  '404/post/login': {
    url: 'login_404.md',
  },
}

const badLoginMd = `## API Response 404 for \`login\`

## Description

A 404 Error response from the /login endpoint most often means that an attempt to login at a valid Looker URL was made but the combination of client_id and client_secret provided do not match an existing valid credential on that instance.

See [HTTP 404 - Not Found](https://docs.looker.com/r/reference/looker-http-codes/404) for general information about this HTTP response from Looker.`

describe('ErrorDoc', () => {
  const external =
    'https://docs.looker.com/r/err/4.0/429/delete/bogus/:namespace/purge'
  const internal = 'https://docs.looker.com/r/err/internal/422/post/bogus/bulk'
  const badLogin = 'https://docs.looker.com/r/err/4.0/404/post/login'
  const hostname = 'https://looker.sdk'
  // const apiVersion = '4.0'
  const settings = { base_url: hostname } as IApiSettings
  const session = { settings: settings } as IAuthSession
  const api = new APIMethods(session, 'mock')
  const errDoc = new ErrorDoc(api)
  let loadMock: any
  let getContentMock: any

  beforeEach(() => {
    loadMock = jest.spyOn(errDoc, 'load').mockImplementation(() => {
      return Promise.resolve(sampleIndex)
    })
    getContentMock = jest
      .spyOn(errDoc, 'getContent')
      .mockImplementation((_) => {
        return Promise.resolve(badLoginMd)
      })
  })
  // api.apiVersion = apiVersion
  // api.apiPath = `${settings.base_url}/api/${apiVersion}`

  describe('content', () => {
    const no = '### No documentation found: '
    it.each<[string, string, boolean]>([
      [badLogin, '## API Response 404 for `login`', true],
      [internal, `${no}422/post/bogus/bulk`, false],
      [external, `${no}429/delete/bogus/:namespace/purge`, false],
      ['', `${no}bad error code link`, false],
    ])('url:"%s" should be "%s"', async (url, expected, loaded) => {
      const actual = await errDoc.content(url)
      if (loaded) {
        expect(loadMock).toHaveBeenCalled()
        expect(getContentMock).toHaveBeenCalled()
      }
      await expect(actual).toMatch(expected)
    })
  })

  describe('parse', () => {
    it('has a valid regex', () => {
      let actual = ErrorDocRx.exec(external)
      expect(actual).toBeDefined()
      actual = ErrorDocRx.exec(internal)
      expect(actual).toBeDefined()
    })

    it('does not fail', () => {
      const actual = errDoc.parse('')
      expect(actual).toBeDefined()
      expect(actual.redirector).toEqual('')
      expect(actual.apiVersion).toEqual('')
      expect(actual.statusCode).toEqual('')
      expect(actual.apiPath).toEqual('')
    })

    it('resolves internal paths', () => {
      const actual = errDoc.parse(internal)
      expect(actual).toBeDefined()
      expect(actual.redirector).toEqual('https://docs.looker.com/r/err/')
      expect(actual.apiVersion).toEqual('internal')
      expect(actual.statusCode).toEqual('422')
      expect(actual.apiPath).toEqual('/post/bogus/bulk')
    })
    it('resolves external paths', () => {
      const actual = errDoc.parse(external)
      expect(actual).toBeDefined()
      expect(actual.redirector).toEqual('https://docs.looker.com/r/err/')
      expect(actual.apiVersion).toEqual('4.0')
      expect(actual.statusCode).toEqual('429')
      expect(actual.apiPath).toEqual('/delete/bogus/:namespace/purge')
    })
  })

  describe('errorKey', () => {
    it('resolves internal paths', () => {
      const actual = errDoc.errorKey(internal)
      expect(actual).toEqual('422/post/bogus/bulk')
    })
    it('resolves external paths', () => {
      const actual = errDoc.errorKey(external)
      expect(actual).toEqual('429/delete/bogus/:namespace/purge')
    })
  })

  describe('methodName', () => {
    it.each<[string, string]>([
      ['', ''],
      ['foo', ''],
      ['/foo.md', ''],
      ['login_404.md', 'login'],
      ['login_2_404.md', 'login_2'],
      ['and_another_404.md', 'and_another'],
      ['errorcodes/live/login_404.md', 'login'],
      [
        'https://marketplace-api.looker.com/errorcodes/live/login_404.md',
        'login',
      ],
    ])('url:"%s" should be "%s"', (url, expected) => {
      expect(errDoc.methodName(url)).toEqual(expected)
    })
  })
})
