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

import { NodeSession, DefaultSettings, IApiSection } from '@looker/sdk-rtl'
import { getSettings } from '../shared/settings'

/**
 * Validate looker api key and secret
 * @param client_id
 * @param client_secret
 */
export const validateLookerCredentials = async (
  client_id: string,
  client_secret: string
): Promise<boolean> => {
  const lookerSettings = DefaultSettings()
  console.log({ client_id, client_secret })
  lookerSettings.readConfig = (): IApiSection => {
    return { client_id, client_secret }
  }
  const settings = getSettings()
  lookerSettings.base_url = settings.lookerServerUrl
  lookerSettings.verify_ssl = settings.lookerServerVerifySsl
  const session = new NodeSession(lookerSettings)
  try {
    const authToken = await session.login()
    return authToken.isActive()
  } catch (err) {
    console.error('looker credentials incorrect')
    console.error(`server url ${session.settings.base_url}`)
    console.error(err)
    return false
  }
}

export const verifyLookerServer = async () => {
  const lookerSettings = DefaultSettings()
  const settings = getSettings()
  lookerSettings.base_url = settings.lookerServerUrl
  lookerSettings.verify_ssl = settings.lookerServerVerifySsl
  const session = new NodeSession(lookerSettings)
  try {
    const result = await session.transport.rawRequest('GET', '/versions')
    return {
      url: settings.lookerServerUrl,
      reachable: result.statusCode === 200,
      status: result.statusCode,
      status_message: result.statusMessage,
      body: result.body.toString(),
    }
  } catch (error) {
    return {
      looker_server_url: settings.lookerServerUrl,
      looker_server_reachable: false,
    }
  }
}
