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

import { readFileSync } from 'fs'
import { cwd } from 'process'
import { Router } from 'express'
import { verifyLookerServer } from '../services/looker_auth'

const router = Router()

/**
 * status endpoint. Returns a status json file provided by devops. Doesnt do
 * anything else as it does not have enough information.
 */
router.get('/status', async (req, res) => {
  let statusCode = 200
  let status: any = {
    errors: [],
  }
  try {
    const statusString = readFileSync(`${cwd()}/status.json`, 'utf8')
    status = { ...JSON.parse(statusString), ...status }
  } catch (err) {
    console.error(err)
    statusCode = 542
    status.errors.push('failed to read or parse status.json file')
  }
  const serverStatus = await verifyLookerServer()
  status.looker_server_status = serverStatus
  res.setHeader('Content-Type', 'application/json')
  res.status(statusCode).send(JSON.stringify(status))
})

export { router as statusRouter }
