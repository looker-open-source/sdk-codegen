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

import type { IRawResponse, ITransportSettings } from '@looker/sdk-rtl'
import { StatusCode } from '@looker/sdk-rtl'
import { NodeCryptoHash, NodeTransport } from './nodeTransport'

describe('NodeTransport', () => {
  const hostname = 'https://looker.sdk'
  const settings = { base_url: hostname } as ITransportSettings
  const xp = new NodeTransport(settings)
  const fullPath = 'https://github.com/looker-open-source/sdk-codegen'
  const badPath = fullPath + '_bogus'
  // const queryParams = { a: 'b c', d: false, nil: null, skip: undefined }

  test('raw request retrieves fully qualified url', async () => {
    const response = await xp.rawRequest('GET', fullPath)
    expect(response).toBeDefined()
    expect(response.ok).toEqual(true)
    expect(response.method).toEqual('GET')
    expect(response.statusCode).toEqual(200)
    expect(response.statusMessage).toEqual('OK')
    expect(response.contentType).toContain('text/html')
    expect(response.body).toBeDefined()
    const html = response.body.toString()
    expect(html).toContain(
      'One SDK to rule them all, and in the codegen bind them'
    )
  })

  describe('transport errors', () => {
    test('gracefully handles Node-level transport errors', async () => {
      const response = await xp.rawRequest('GET', badPath)
      const errorMessage = `GET ${badPath}`
      expect(response).toBeDefined()
      expect(response.ok).toEqual(false)
      expect(response.method).toEqual('GET')
      expect(response.statusCode).toEqual(404)
      expect(response.body).toBeDefined()
      expect(response.statusMessage.indexOf('"type":"Buffer"')).toEqual(-1)
      expect(response.statusMessage.indexOf(errorMessage)).toEqual(0)
    })
  })

  test('retrieves fully qualified url', async () => {
    const response = await xp.request<string, Error>('GET', fullPath)
    expect(response).toBeDefined()
    expect(response.ok).toEqual(true)
    if (response.ok) {
      const content = response.value
      expect(content).toContain(
        'One SDK to rule them all, and in the codegen bind them'
      )
    }
  })

  describe('ok check', () => {
    const raw: IRawResponse = {
      method: 'GET',
      contentType: 'application/json',
      headers: {},
      url: 'bogus',
      ok: true,
      statusCode: StatusCode.OK,
      statusMessage: 'Mocked success',
      body: 'body',
      requestStarted: 1000,
      responseCompleted: 2000,
    }

    test('ok is ok', () => {
      expect(xp.ok(raw)).toEqual(true)
    })

    test('All 2xx responses are ok', () => {
      raw.statusCode = StatusCode.IMUsed
      expect(xp.ok(raw)).toEqual(true)
    })

    test('Non-2xx responses are not ok', () => {
      raw.statusCode = 422
      expect(xp.ok(raw)).toEqual(false)
    })
  })

  describe('NodeCryptoHash', () => {
    test('secureRandom', () => {
      const hasher = new NodeCryptoHash()
      const rand1 = hasher.secureRandom(5)
      expect(rand1.length).toEqual(10)
      const rand2 = hasher.secureRandom(32)
      expect(rand2.length).toEqual(64)
    })

    test('sha256hash', async () => {
      const hasher = new NodeCryptoHash()
      const message = 'The quick brown fox jumped over the lazy dog.'
      const hash = await hasher.sha256Hash(message)
      expect(hash).toEqual('aLEoK5HeLAVMNmKcuN1EfxLwltPjxYeXjcIkhERjNIM=')
    })
  })
})
