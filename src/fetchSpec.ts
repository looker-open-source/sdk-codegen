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
import { SDKConfig, ISDKConfigProps } from './sdkConfig'
import { URLSearchParams } from 'url'
import * as fs from 'fs'
import { fail, quit, log, isFileSync, warn } from './utils'
import { IVersionInfo } from './codeGen'

const specFileUrl = (props: ISDKConfigProps) => `${props.base_url}/api/${props.api_version}/swagger.json`

const loginUrl = (props: ISDKConfigProps) => `${props.base_url}/login`

const logoutUrl = (props: ISDKConfigProps) => `${props.base_url}/logout`

const logout = async (props: ISDKConfigProps, token: string) =>
  fetch(logoutUrl(props), {method: 'DELETE', headers: {'Authorization': `token ${token}`}})

const login = async (props: ISDKConfigProps) => {

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

export const specFileName = (name: string, props: ISDKConfigProps) =>
  `./${name}.${props.api_version}.json`

export const openApiFileName = (name: string, props: ISDKConfigProps) =>
  `./${name}.${props.api_version}.oas.json`

const badAuth = (content: string) => content.indexOf('Requires authentication') > 0

const checkCertError = (err: Error): boolean => {
  if (err.message && err.message.match(/self signed certificate/gi)) {
    warn(`
NOTE! Certificate validation can be disabled with:
  NODE_TLS_REJECT_UNAUTHORIZED="0" {original command}
`)
    return true
  }
  return false
}

export const fetchSpecFile = async (name: string, props: ISDKConfigProps) => {
  const fileName = specFileName(name, props)
  if (isFileSync(fileName)) return fileName

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
    checkCertError(err)
    return quit(err)
  }
}

export const logFetch = async (name: string, props: ISDKConfigProps) => {
  const specFile = await fetchSpecFile(name, props)
  if (!specFile) {
    return fail('fetchSpecFile', 'No specification file name returned')
  }
  return specFile
}

export const getVersionInfo = async (props: ISDKConfigProps): Promise<IVersionInfo | undefined> => {
  try {
    const lookerVersion = await fetchLookerVersion(props.base_url)
    return {
      lookerVersion,
      apiVersion: props.api_version
    }
  } catch (e) {
    warn(`Could not retrieve version information. Is ${props.base_url} running?`)
    checkCertError(e)
  }
  return undefined
}


export const fetchLookerVersion = async (url: string) => {
  const response = await fetch(`${url}/versions`)
  const content = await response.text()
  const versions = JSON.parse(content)
  const [lookerVersion] = versions.looker_release_version.match(/^\d+\.\d+/gi)
  return lookerVersion
}

try {
  const config = SDKConfig()
  Object.entries(config).forEach(async ([name, props]) => logFetch(name, props))
} catch (e) {
  quit(e)
}
