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

import { DefaultSettings, IApiSettings } from '@looker/sdk-rtl/lib/browser'
import { LookerBrowserSDK } from '@looker/sdk/lib/browser'

import { defaultConfigurator } from '..'
import { RunItSettings } from './RunItSDK'

const settings = {
  ...DefaultSettings(),
  base_url: 'https://self-signed.looker.com:19999',
  agentTag: 'RunIt',
} as IApiSettings

const runItSettings = new RunItSettings(settings, defaultConfigurator)

describe('RunItSDK', () => {
  describe('RunItSettings', () => {
    test('settings keep agentTag', () => {
      expect(runItSettings.agentTag).toContain('RunIt')
    })
  })
  test('sdk keeps agentTag', () => {
    const actual = LookerBrowserSDK.init40(runItSettings)
    expect(actual.authSession.settings.agentTag).toContain('RunIt')
  })
})
