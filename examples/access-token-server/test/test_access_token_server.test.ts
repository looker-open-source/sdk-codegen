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

import fetch from 'node-fetch'
import dotenv from 'dotenv'

dotenv.config()

describe('access_token_server', () => {
  const accessTokenServerUrl = `http://localhost:${
    process.env.SERVER_PORT || 8081
  }`

  test('status', async () => {
    const resp = await fetch(`${accessTokenServerUrl}/status`)
    expect(resp.status).toEqual(200)
    const json = await resp.json()
    expect(json.app_version).toBeDefined()
    expect(json.build_date).toBeDefined()
    expect(json.git_commit).toBeDefined()
    expect(json.access_token_server_provider_label).toBeDefined()
    expect(json.looker_server_status.url).toBeDefined()
    expect(json.looker_server_status.reachable).toBeTruthy()
  })

  test.each([
    {
      client_secret: 'expiry_date',
      scope: 'https://www.googleapis.com/auth/spreadsheets',
    },
    {
      client_id: 'client_id',
      scope: 'https://www.googleapis.com/auth/spreadsheets',
    },
    {
      client_id: 'client_id',
      client_secret: 'expiry_date',
    },
  ])('access_token missing input', async (input) => {
    const resp = await fetch(`${accessTokenServerUrl}/access_token`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    })
    expect(resp.status).toEqual(400)
    expect(resp.statusText).toEqual('invalid input')
  })

  test.each([
    {
      client_id: process.env.LOOKER_CLIENT_ID,
      client_secret: process.env.LOOKER_CLIENT_SECRET,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
    },
  ])('access_token good', async (input) => {
    const resp = await fetch(`${accessTokenServerUrl}/access_token`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    })
    expect(resp.status).toEqual(200)
    const json = await resp.json()
    expect(json.access_token).toBeDefined()
    expect(json.expiry_date).toBeDefined()
    const resp2 = await fetch(`${accessTokenServerUrl}/access_token`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    })
    expect(resp2.status).toEqual(200)
    const json2 = await resp2.json()
    expect(json2.access_token).toEqual(json.access_token)
    expect(json2.expiry_date).toEqual(json.expiry_date)
  })

  test.each([
    {
      scope: 'https://www.googleapis.com/auth/spreadsheets',
    },
    {
      client_id: process.env.LOOKER_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
    },
    {
      client_secret: process.env.LOOKER_CLIENT_SECRET,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
    },
    {
      client_id: 'XXX',
      client_secret: 'XXX',
      scope: 'https://www.googleapis.com/auth/spreadsheets',
    },
  ])('bad looker credentials', async (input) => {
    const resp = await fetch(`${accessTokenServerUrl}/access_token`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    })
    expect(resp.status).toEqual(400)
  })
})
