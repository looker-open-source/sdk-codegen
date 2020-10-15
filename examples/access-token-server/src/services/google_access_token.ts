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

import { JWT } from 'google-auth-library'
import { AccessTokenError } from '../shared/access_token_error'
import { getSettings } from '../shared/settings'
import { AccessTokenData } from '../types'

/**
 * Get an access token from google for the given scrope
 * @param scope
 */
export const getGoogleAccessToken = async (
  scope: string
): Promise<AccessTokenData> => {
  const { client_email, private_key } = getSettings().serviceAccountCredentials
  const client = new JWT({
    email: client_email,
    key: private_key,
    scopes: scope.split(' '),
  })
  const accessToken = await client.getAccessToken()
  if (!accessToken.token) {
    console.error('google access token request failed', accessToken)
    throw new AccessTokenError('invalid environment')
  }
  const tokenInfo = await client.getTokenInfo(accessToken.token)
  return {
    access_token: accessToken.token,
    expiry_date: tokenInfo.expiry_date - 5 * 60 * 1000,
  }
}
