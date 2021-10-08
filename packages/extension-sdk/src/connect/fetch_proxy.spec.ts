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
import type { ExtensionHostApiImpl } from './extension_host_api'
import { FetchProxyImpl } from './fetch_proxy'
import { FetchResponseBodyType } from './types'

describe('extension_host_api tests', () => {
  let mockExtensionSdk: ExtensionHostApiImpl
  let extensionFetchProxySpy: Required<any>

  beforeEach(() => {
    mockExtensionSdk = {
      fetchProxy: () => {
        // noop
      },
    } as unknown as ExtensionHostApiImpl
    extensionFetchProxySpy = jest.spyOn(mockExtensionSdk, 'fetchProxy')
  })

  it('appends resource to base url', async () => {
    const fetchProxy = new FetchProxyImpl(
      mockExtensionSdk as any,
      'https://example.com'
    )
    await fetchProxy.fetchProxy('/posts')
    expect(extensionFetchProxySpy).toHaveBeenCalledWith(
      'https://example.com/posts',
      undefined,
      undefined
    )
  })

  it('uses init from create proxy', () => {
    const fetchProxy = new FetchProxyImpl(
      mockExtensionSdk as any,
      'https://example.com',
      { credentials: 'include' }
    )
    fetchProxy.fetchProxy('/posts')
    expect(extensionFetchProxySpy).toHaveBeenCalledWith(
      'https://example.com/posts',
      { credentials: 'include' },
      undefined
    )
  })

  it('uses init from fetch request', () => {
    const fetchProxy = new FetchProxyImpl(
      mockExtensionSdk as any,
      'https://example.com'
    )
    fetchProxy.fetchProxy('/posts', { credentials: 'include' })
    expect(extensionFetchProxySpy).toHaveBeenCalledWith(
      'https://example.com/posts',
      { credentials: 'include' },
      undefined
    )
  })

  it('merges init', () => {
    const fetchProxy = new FetchProxyImpl(mockExtensionSdk as any, undefined, {
      credentials: 'include',
      headers: {
        'x-header-1': 'x-header-1-value',
        'x-header-2': 'x-header-2-valueA',
      },
    })
    fetchProxy.fetchProxy('https://example.com/posts', {
      method: 'POST',
      headers: {
        'x-header-2': 'x-header-2-valueB',
        'x-header-3': 'x-header-3-value',
      },
      body: JSON.stringify({ hello: 'world' }),
    })
    expect(extensionFetchProxySpy).toHaveBeenCalledWith(
      'https://example.com/posts',
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'x-header-1': 'x-header-1-value',
          'x-header-2': 'x-header-2-valueB',
          'x-header-3': 'x-header-3-value',
        },
        body: JSON.stringify({ hello: 'world' }),
      },
      undefined
    )
  })

  it('use proxy response body tyoe', () => {
    const fetchProxy = new FetchProxyImpl(
      mockExtensionSdk as any,
      undefined,
      undefined,
      FetchResponseBodyType.json
    )
    fetchProxy.fetchProxy('https://example.com/posts')
    expect(extensionFetchProxySpy).toHaveBeenCalledWith(
      'https://example.com/posts',
      undefined,
      FetchResponseBodyType.json
    )
  })

  it('use request response body tyoe', () => {
    const fetchProxy = new FetchProxyImpl(
      mockExtensionSdk as any,
      undefined,
      undefined,
      FetchResponseBodyType.json
    )
    fetchProxy.fetchProxy(
      'https://example.com/posts',
      undefined,
      FetchResponseBodyType.text
    )
    expect(extensionFetchProxySpy).toHaveBeenCalledWith(
      'https://example.com/posts',
      undefined,
      FetchResponseBodyType.text
    )
  })
})
