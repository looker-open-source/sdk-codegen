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
import {
  getConfig,
  removeConfig,
  setConfig,
  TryItConfigKey,
} from './configUtils'

describe('configUtils', () => {
  const testConfig = 'Try it config values'
  beforeEach(() => {
    removeConfig(TryItConfigKey)
  })

  afterEach(() => {
    removeConfig(TryItConfigKey)
  })

  test('it saves config values to sessionStorage by default', () => {
    setConfig(TryItConfigKey, testConfig)
    const actual = getConfig(TryItConfigKey)
    expect(actual).toEqual({ location: 'session', value: testConfig })
  })

  test('it reads config values from localStorage if they are not in sessionStorage', () => {
    setConfig(TryItConfigKey, testConfig, 'local')
    const actual = getConfig(TryItConfigKey)
    expect(actual).toEqual({ location: 'local', value: testConfig })
  })

  test('removeConfig clears both session and local storage', () => {
    setConfig(TryItConfigKey, testConfig, 'local')
    setConfig(TryItConfigKey, testConfig, 'session')
    removeConfig(TryItConfigKey)
    const actual = getConfig(TryItConfigKey)
    expect(actual).toEqual({ location: 'session', value: '' })
  })
})
