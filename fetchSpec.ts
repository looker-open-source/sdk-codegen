/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2019 Looker Data Sciences, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import fetch from 'node-fetch'
import { SDKConfig, SDKConfigProps } from './sdkConfig'
import { URLSearchParams } from 'url'
import * as fs from 'fs'
import { fail, quit, log } from './utils'

const specFileUrl = (props: SDKConfigProps) => `${props.base_url}/api/${props.api_version}/swagger.json`

const loginUrl = (props: SDKConfigProps) => `${props.base_url}/login`

const logoutUrl = (props: SDKConfigProps) => `${props.base_url}/logout`

const logout = async (props: SDKConfigProps, token: string) =>
  fetch(logoutUrl(props), {method: 'DELETE', headers: {'Authorization': `token ${token}`}})

const login = async (props: SDKConfigProps) => {

  const params = new URLSearchParams()
  params.append('client_id', props.client_id)
  params.append('client_secret', props.client_secret)

  try {
    const response = await fetch(loginUrl(props), {method: 'POST', body: params})
    const body = await response.json()
    const accessToken = await body.access_token

    if (accessToken) {
      return accessToken
    } else {
      log('Server Response: ' + JSON.stringify(body))
      throw new Error('Access token could not be retrieved.')
    }

  } catch (err) {
    console.error(err)
  }
}

export const specFileName = (name: string, props: SDKConfigProps) =>
  `./${name}.${props.api_version}.json`

export const openApiFileName = (name: string, props: SDKConfigProps) =>
  `./${name}.${props.api_version}.oas.json`

const badAuth = (content: string) => content.indexOf('Requires authentication') > 0

export const fetchSpecFile = async (name: string, props: SDKConfigProps) => {
  const fileName = specFileName(name, props)
  // TODO make switch for "always fetch" -- or just instruct users to delete previous spec files?
  if (fs.existsSync(fileName)) return fileName

  try {
    let response = null
    let token = null
    let content = null
    try {
      // Try first without login. Most Looker instances don't require auth for metadata
      response = await fetch(specFileUrl(props))
      content = await response.text()
      if (badAuth(content)) {
        token = await login(props)
        response = await fetch(specFileUrl(props), {headers: {'Authorization': `token ${token}`}})
        content = await response.text()
      }
    } catch (err) {
      // Whoops!  Ok, try again with login
      token = await login(props)
      response = await fetch(specFileUrl(props), {headers: {'Authorization': `token ${token}`}})
      content = await response.text()
    }

    if (badAuth(content)) {
      return quit('Authentication failed')
    }

    fs.writeFileSync(fileName, content)

    if (token) {
      await logout(props, token)
    }

    return fileName

  } catch (err) {
    if (err.message && err.message.match(/self signed certificate/gi)) {
      log(`
NOTE! Certificate validation can be disabled with:
  NODE_TLS_REJECT_UNAUTHORIZED="0" yarn {command}
`)
    }
    return quit(err)
  }
}

export const logFetch = async (name: string, props: SDKConfigProps) => {
  const specFile = await fetchSpecFile(name, props)
  if (!specFile) {
    return fail('fetchSpecFile', 'No specification file name returned')
  }
  return specFile
}

try {
  const config = SDKConfig()
  Object.entries(config).forEach(async ([name, props]) => logFetch(name, props))
} catch (e) {
  quit(e)
}
