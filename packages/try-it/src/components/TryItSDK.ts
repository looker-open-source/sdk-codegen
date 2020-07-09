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
  ApiSettings,
  DefaultSettings,
  IApiSection,
  IApiSettings,
  LookerBrowserSDK,
} from '@looker/sdk/lib/browser'

// https://docs.looker.com/reference/api-and-integration/api-cors
// TODO get base_url value from the stand-alone TryIt provider
const settings = {
  ...DefaultSettings(),
  agentTag: 'TryIt',
  base_url: 'https://self-signed.looker.com:19999',
} as IApiSettings

class TryItSettings extends ApiSettings {
  constructor(settings: Partial<IApiSettings>) {
    super(settings)
  }

  isConfigured(): boolean {
    const creds = this.readConfig()
    return (
      super.isConfigured() && 'redirect_uri' in creds && 'looker_url' in creds
    )
  }

  readConfig(_section?: string): IApiSection {
    /**
     * Use the values that can be resolved dynamically
     */
    const url = new URL(this.base_url)
    const oauthServer = `${url.protocol}//${url.hostname}`
    return {
      ...super.readConfig(_section),
      ...{
        client_id: 'looker.api-explorer',
        looker_url: `${oauthServer}:9999`,
        redirect_uri: `${window.location.origin}/oauth`,
      },
    }
  }
}

export const tryItSDK = LookerBrowserSDK.init40(new TryItSettings(settings))
