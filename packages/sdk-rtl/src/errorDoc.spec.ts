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
import {
  ErrorCodesUrl,
  ErrorDoc,
  ErrorDocNotFound,
  ErrorDocRx,
} from './errorDoc'
import { BrowserTransport } from './browserTransport'
import type {
  Authenticator,
  HttpMethod,
  ITransportSettings,
  Values,
} from './transport'
import { readFile, TestConfig } from './testUtils'

const config = TestConfig()
const errorIndex = `${config.testPath}errorCodesIndex.json`
const sampleIndex: ErrorCodeIndex = JSON.parse(readFile(errorIndex))
const generic404 = `## Generic 404`
const badLoginMd = `## API Response 404 for \`login\`

## Description

A 404 Error response from the /login endpoint most often means that an attempt to login at a valid Looker URL was made but the combination of client_id and client_secret provided do not match an existing valid credential on that instance.

See [HTTP 404 - Not Found](https://docs.looker.com/r/reference/looker-http-codes/404) for general information about this HTTP response from Looker.`

describe('ErrorDoc', () => {
  const external =
    'https://docs.looker.com/r/err/4.0/429/delete/bogus/:namespace/purge'
  const internal = 'https://docs.looker.com/r/err/internal/422/post/bogus/bulk'
  const badLogin = 'https://docs.looker.com/r/err/4.0/404/post/login'
  const another404 = 'https://docs.looker.com/r/err/4.0/404/post/another'
  const cloud404 =
    'https://cloud.google.com/looker/docs/r/err/4.0/404/post/another'
  const partial404 = '/err/4.0/404/post/another'
  const hostname = 'https://looker.sdk'
  const settings = { base_url: hostname } as IApiSettings
  const transport = new BrowserTransport(settings)
  const session = {
    settings: settings,
    transport: transport,
  } as unknown as IAuthSession
  const api = new APIMethods(session, 'mock')
  const errDoc = new ErrorDoc(api)
  let requestMock: any

  beforeEach(() => {
    requestMock = jest
      .spyOn(transport, 'request')
      .mockImplementation(
        (
          _method: HttpMethod,
          path: string,
          _queryParams?: Values,
          _body?: any,
          _authenticator?: Authenticator,
          _options?: Partial<ITransportSettings>
        ) => {
          let value: string | ErrorCodeIndex = sampleIndex
          switch (path) {
            case `${ErrorCodesUrl}index.json`:
              value = sampleIndex
              break
            case `${ErrorCodesUrl}login_404.md`:
              value = badLoginMd
              break
            case `${ErrorCodesUrl}404.md`:
              value = generic404
              break
            default:
              value = `${ErrorDocNotFound}${path}`
              break
          }
          return Promise.resolve({ ok: true, value })
        }
      )
  })

  describe('content', () => {
    const no = ErrorDocNotFound
    it.each<[string, string, number]>([
      [badLogin, '## API Response 404 for `login`', 2], // valid mock url and content so load will be called twice
      [another404, '## Generic 404', 2], // valid mock url and content that defaults to generic message so load will be called twice
      [cloud404, '## Generic 404', 2], // valid mock url and content that defaults to generic message so load will be called twice
      [partial404, '## Generic 404', 2], // valid mock url and content that defaults to generic message so load will be called twice
      [internal, `${no}422/post/bogus/bulk`, 1], // invalid, default to not found
      [external, `${no}429/delete/bogus/{namespace}/purge`, 1], // invalid, default to not found
      ['', `${no}bad error code link`, 0], // just bad all around
    ])('url:"%s" should be "%s"', async (url, expected, called) => {
      const index = `_index` // use this to access the private property
      errDoc[index] = undefined // reset the index so mock counts are correct
      const actual = await errDoc.content(url)
      expect(requestMock).toHaveBeenCalledTimes(called)
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
      expect(actual).toEqual({
        redirector: '',
        apiVersion: '',
        statusCode: '',
        apiPath: '',
      })
    })

    it('resolves internal paths', () => {
      const actual = errDoc.parse(internal)
      expect(actual).toBeDefined()
      expect(actual).toEqual({
        redirector: 'https://docs.looker.com/r/err/',
        apiVersion: 'internal',
        statusCode: '422',
        apiPath: '/post/bogus/bulk',
      })
    })

    it('resolves external paths', () => {
      const actual = errDoc.parse(external)
      expect(actual).toBeDefined()
      expect(actual).toEqual({
        redirector: 'https://docs.looker.com/r/err/',
        apiVersion: '4.0',
        statusCode: '429',
        apiPath: '/delete/bogus/:namespace/purge',
      })
    })

    it('resolves cloud paths', () => {
      const actual = errDoc.parse(cloud404)
      expect(actual).toBeDefined()
      expect(actual).toEqual({
        redirector: 'https://cloud.google.com/looker/docs/r/err/',
        apiVersion: '4.0',
        statusCode: '404',
        apiPath: '/post/another',
      })
    })

    it('handles partial urls', () => {
      const actual = errDoc.parse(partial404)
      expect(actual).toBeDefined()
      expect(actual).toEqual({
        redirector: '/err/',
        apiVersion: '4.0',
        statusCode: '404',
        apiPath: '/post/another',
      })
    })
  })

  describe('specPath', () => {
    it.each<[string, string]>([
      ['/x/:f/y/:z', '/x/{f}/y/{z}'],
      ['/x/{f}/y/{z}', '/x/{f}/y/{z}'],
      ['/x/:foo_bar/y/:zoo', '/x/{foo_bar}/y/{zoo}'],
      ['', ''],
    ])('path: "%s" should be "%s"', (path, expected) =>
      expect(errDoc.specPath(path)).toEqual(expected)
    )
  })

  describe('errorKey', () => {
    it('resolves internal paths', () => {
      const actual = errDoc.errorKey(internal)
      expect(actual).toEqual('422/post/bogus/bulk')
    })
    it('resolves external paths', () => {
      const actual = errDoc.errorKey(external)
      expect(actual).toEqual('429/delete/bogus/{namespace}/purge')
    })
  })

  describe('methodName', () => {
    it.each<[string, string]>([
      ['', ''],
      ['foo', ''],
      ['/foo.md', ''],
      ['404.md', ''],
      ['login_404.md', 'login'],
      ['login_2_404.md', 'login_2'],
      ['and_another_404.md', 'and_another'],
      ['errorcodes/login_404.md', 'login'],
      ['https://static-a.cdn.looker.app/errorcodes/login_404.md', 'login'],
    ])('url:"%s" should be "%s"', (url, expected) => {
      expect(errDoc.methodName(url)).toEqual(expected)
    })
  })
})
