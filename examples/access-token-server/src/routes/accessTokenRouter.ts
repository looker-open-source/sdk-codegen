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

import { Router } from 'express'
import moment from 'moment'
import { JWT } from 'google-auth-library'
import sha1 from 'crypto-js/sha1'
import { getSettings } from '../settings'
import { NodeSession, DefaultSettings, IApiSection } from '@looker/sdk-rtl'

interface AccessTokenData {
  access_token: string
  expiry_date: number
}

const accessTokenDataMap: Record<string, AccessTokenData> = {}

const createTokenDataKey = (clientId: string, scope: string) => {
  return `${sha1(clientId).toString()}.toString()}.${sha1(scope).toString()}`
}

const isExpiring = (expiryDate: number) => {
  const diff = moment(new Date(expiryDate)).diff(moment(), 'seconds')
  return diff < 300
}

const isValidLookerCredentials = async (
  client_id: string,
  client_secret: string
) => {
  const lookerSettings = DefaultSettings()
  lookerSettings.readConfig = (): IApiSection => {
    return { client_id, client_secret }
  }
  const settings = getSettings()
  lookerSettings.base_url = settings.lookerServerUrl
  lookerSettings.verify_ssl = settings.lookerServerVerifySsl
  const session = new NodeSession(lookerSettings)
  try {
    const accessToken = await session.login()
    return !!accessToken
  } catch (err) {
    console.error('looker credentials incorrect')
    console.error(err)
    return false
  }
}

const getAccessTokenData = async (scope: string): Promise<AccessTokenData> => {
  const { client_email, private_key } = getSettings().serviceAccountCredentials
  const client = new JWT({
    email: client_email,
    key: private_key,
    scopes: scope.split(' '),
  })
  const accessToken = await client.getAccessToken()
  const tokenInfo = await client.getTokenInfo(accessToken.token)
  return { access_token: accessToken.token, expiry_date: tokenInfo.expiry_date }
}

const router = Router()

/**
 * Access token route
 * Expects a json object containing the following properties
 * client_id - valid Looker client id
 * client_secret - valid secret for Looker client id
 * scope - for the access token. Multiple scropes can be requested separated by a space.
 *
 * returns an access token and an expiry date in seconds.
 *
 * Note access token is cached for up to expiry date - 5 mins after which time a new one
 * access token is requested. Cache key is a hash of the client id and scope.
 */
router.post('/access_token', async (req, res) => {
  const { client_id, client_secret, scope } = req.body
  if (!client_id || !client_secret || !scope) {
    res.statusMessage = 'invalid input'
    res.sendStatus(400)
    return
  }
  const key = createTokenDataKey(client_id, scope)
  let accessTokenData = accessTokenDataMap[key]
  if (accessTokenData && !isExpiring(accessTokenData.expiry_date)) {
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify(accessTokenData))
    return
  }
  const validCredentials = await isValidLookerCredentials(
    client_id,
    client_secret
  )
  if (!validCredentials) {
    res.statusMessage = 'invalid input'
    res.sendStatus(400)
    return
  }
  accessTokenData = await getAccessTokenData(scope)
  accessTokenDataMap[key] = accessTokenData
  res.setHeader('Content-Type', 'application/json')
  res.send(JSON.stringify(accessTokenData))
})

export { router as accessTokenRouter }
