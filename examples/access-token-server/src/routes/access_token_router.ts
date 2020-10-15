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
import { AccessTokenError } from '../shared/access_token_error'
import { handleTokenRequest } from '../models/access_token_data'

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
  try {
    console.log('POST /access_token')
    const accessTokenData = await handleTokenRequest(
      client_id,
      client_secret,
      scope
    )
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify(accessTokenData))
  } catch (err) {
    console.log(`POST /access_token ${err.message}`)
    if (err instanceof AccessTokenError) {
      res.statusMessage = err.message
      res.sendStatus(400)
    } else {
      throw err
    }
  }
})

export { router as accessTokenRouter }
