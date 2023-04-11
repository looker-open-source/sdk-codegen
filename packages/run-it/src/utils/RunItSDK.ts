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

import type { IApiSettings } from '@looker/sdk-rtl'
import {
  BrowserSession,
  BrowserTransport,
  DefaultSettings,
} from '@looker/sdk-rtl'
import { functionalSdk40 } from '@looker/sdk'
import { OAuthConfigProvider } from '@looker/extension-utils'

import { RunItConfigKey } from '../components'

export const initRunItSdk = () => {
  const settings = {
    ...DefaultSettings(),
    base_url: 'https://self-signed.looker.com:19999',
    agentTag: 'RunIt 0.8',
  } as IApiSettings

  const options = new OAuthConfigProvider(
    settings,
    'looker.api-explorer',
    RunItConfigKey
  )
  const transport = new BrowserTransport(options)
  const session = new BrowserSession(options, transport)
  const sdk = functionalSdk40(session)
  BrowserTransport.trackPerformance = true
  return sdk
}

export enum StoreConstants {
  LOCALSTORAGE_SETTINGS_KEY = 'settings',
}
