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

import sha1 from 'crypto-js/sha1'
import { AccessTokenError } from '../shared/access_token_error'
import { AccessTokenData } from '../types'
import { validateLookerCredentials } from '../services/looker_auth'
import { getGoogleAccessToken } from '../services/google_access_token'

const accessTokenDataMap: Record<string, AccessTokenData> = {}

/**
 * Process a token request. Checks cache first. If not in cache validates
 * looker API credentials. If looker API credentials valid requests token
 * from google using the service account and the scrope. If token got,
 * caches token (using string and api credentials hash) and returns token
 * to caller.
 * If token is in cache checks to see if token has expired. If expired,
 * validates looker API key again and requests token from google.
 * If token is in cache and has not expired, token from cache returned.
 * @param client_id
 * @param client_secret
 * @param scope
 */
export const handleTokenRequest = async (
  client_id: string,
  client_secret: string,
  scope: string
): Promise<AccessTokenData> => {
  let accessTokenData: AccessTokenData
  if (client_id && client_secret && scope) {
    const key = createTokenDataKey(client_id, client_secret, scope)
    accessTokenData = accessTokenDataMap[key]
    if (accessTokenData && isExpired(accessTokenData.expiry_date)) {
      accessTokenData = undefined
    }
    if (!accessTokenData) {
      const credentialsValid = await validateLookerCredentials(
        client_id,
        client_secret
      )
      if (credentialsValid) {
        accessTokenData = await getGoogleAccessToken(scope)
        accessTokenDataMap[key] = accessTokenData
      }
    }
  }
  if (accessTokenData) {
    return accessTokenData
  } else {
    throw new AccessTokenError('invalid input')
  }
}

const createTokenDataKey = (
  clientId: string,
  clientSecret: string,
  scope: string
) => {
  return `${sha1(clientId).toString()}.toString()}.${sha1(
    clientSecret
  ).toString()}.toString()}.${sha1(scope).toString()}`
}

const isExpired = (expiryDate: number) => {
  return Date.now() > expiryDate
}
