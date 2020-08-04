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
  Looker40SDK,
  LookerBrowserSDK,
  lookerVersion,
} from '@looker/sdk/lib/browser'
import { getStorage, RunItConfigKey } from '../components'

// https://docs.looker.com/reference/api-and-integration/api-cors
const settings = {
  ...DefaultSettings(),
  base_url: 'https://self-signed.looker.com:19999',
  agentTag: `RunIt ${lookerVersion}.4.0`,
} as IApiSettings

/***
 * An OAuth Session configuration provider
 *
 * @class RunItSettings
 */
export class RunItSettings extends ApiSettings {
  constructor(settings: Partial<IApiSettings>) {
    super(settings)
  }

  private getStoredConfig() {
    const storage = getStorage(RunItConfigKey)
    let config = { base_url: '', looker_url: '' }
    if (storage.value) {
      config = JSON.parse(storage.value)
    }
    return config
  }

  authIsConfigured(): boolean {
    const config = this.getStoredConfig()
    return config.base_url !== '' && config.looker_url !== ''
  }

  readConfig(_section?: string): IApiSection {
    // Read server url values from storage
    let config = this.getStoredConfig()
    if (!this.authIsConfigured()) {
      // derive Looker server URL from base_url
      const url = new URL(this.base_url)
      const authServer = `${url.protocol}//${url.hostname}`
      config = {
        base_url: this.base_url,
        looker_url: `${authServer}:9999`,
      }
    }

    const { base_url, looker_url } = config
    return {
      ...super.readConfig(_section),
      ...{
        base_url,
        looker_url,
        client_id: 'looker.api-explorer',
        redirect_uri: `${window.location.origin}/oauth`,
      },
    }
  }
}

/** Initialized stand-alone API test runner */
export const runItSDK = LookerBrowserSDK.init40(new RunItSettings(settings))

/** Is this a stand-alone version of Run-It that needs server and auth configuration? */
export const sdkNeedsConfig = (sdk: Looker40SDK | undefined) =>
  sdk?.authSession.settings instanceof RunItSettings
