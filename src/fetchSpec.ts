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

import { ISDKConfigProps } from './sdkConfig'
import * as fs from 'fs'
import { fail, quit, log, isFileSync, warn } from './utils'
import { IVersionInfo } from './codeGen'
import { NodeTransport } from '../typescript/looker/rtl/nodeTransport'
import {
  defaultTimeout,
  ITransportSettings,
  sdkOk
} from '../typescript/looker/rtl/transport'

const agentTag = 'SDK Codegen'
let transport: NodeTransport

const Transport = (props: ISDKConfigProps) => {
  if (transport) return transport
  const options: ITransportSettings = {
    base_url: props.base_url,
    api_version: props.api_version,
    verify_ssl: props.verify_ssl,
    timeout: defaultTimeout
  }
  transport = new NodeTransport(options)
  return transport
}

const loginUrl = (props: ISDKConfigProps) =>
  `${props.base_url}/api/${props.api_version}/login`

const logoutUrl = (props: ISDKConfigProps) =>
  `${props.base_url}/api/${props.api_version}/logout`

export const specFileUrl = (props: ISDKConfigProps) =>
  `${props.base_url}/api/${props.api_version}/swagger.json`

export const specFileName = (name: string, props: ISDKConfigProps) =>
  `./${name}.${props.api_version}.json`

export const openApiFileName = (name: string, props: ISDKConfigProps) =>
  `./${name}.${props.api_version}.oas.json`

const badAuth = (content: string | object) => {
  let text = typeof content === 'object' ? JSON.stringify(content) : content
  return text.indexOf('Requires authentication') > 0
}

export const logout = async (props: ISDKConfigProps, token: string) => {
  const xp = Transport(props)

  return sdkOk<string, Error>(
    xp.request<string, Error>(
      'DELETE',
      logoutUrl(props),
      undefined,
      undefined,
      undefined,
      { headers: { Authorization: `Bearer ${token}` } },
      agentTag
    )
  )
}

export const login = async (props: ISDKConfigProps) => {
  const xp = Transport(props)
  const creds = {
    client_id: props.client_id,
    client_secret: props.client_secret
  }
  const url = loginUrl(props)

  try {
    const response = await sdkOk<any, Error>(
      xp.request<any, Error>('POST', url, creds, undefined, undefined, undefined, agentTag)
    )
    const accessToken = await response.access_token

    if (accessToken) {
      return accessToken
    } else {
      log(`Server Response: ${JSON.stringify(response)}`)
      throw new Error('Access token could not be retrieved.')
    }
  } catch (err) {
    console.error(err)
  }
}

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

export const getUrl = async (
  props: ISDKConfigProps,
  url: string,
  options?: Partial<ITransportSettings>
) => {
  const xp = Transport(props)
  // log(`GETting ${url} ...`)
  return sdkOk<string, Error>(
    xp.request<string, Error>(
      'GET',
      url,
      undefined,
      undefined,
      undefined,
      options,
      agentTag
    )
  )
}

export const authGetUrl = async (props: ISDKConfigProps, url: string) => {
  let token = null
  let content: any = null
  try {
    // Try first without login. Most Looker instances don't require auth for spec retrieval
    content = await getUrl(props, url)
  } catch (err) {
    // Whoops!  Ok, try again with login
    token = await login(props)
    content = await getUrl(props, url, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (token) {
      await logout(props, token)
    }
  }

  if (badAuth(content)) {
    return quit('Authentication failed')
  }
  return content
}

export const fetchSpecFile = async (name: string, props: ISDKConfigProps) => {
  const fileName = specFileName(name, props)
  if (isFileSync(fileName)) return fileName

  try {
    let fileUrl = specFileUrl(props)
    const content = await authGetUrl(props, fileUrl)
    const json = JSON.stringify(content, undefined, 2)

    fs.writeFileSync(fileName, json)

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

export const getVersionInfo = async (
  props: ISDKConfigProps
): Promise<IVersionInfo | undefined> => {
  try {
    const lookerVersion = await fetchLookerVersion(props)
    return {
      lookerVersion,
      apiVersion: props.api_version
    }
  } catch (e) {
    warn(
      `Could not retrieve version information. Is ${props.base_url} running?`
    )
    checkCertError(e)
    console.error({ e })
  }
  return undefined
}

export const fetchLookerVersion = async (props: ISDKConfigProps) => {
  const versions: any = await authGetUrl(props, `${props.base_url}/versions`)
  const [lookerVersion] = versions.looker_release_version.match(/^\d+\.\d+/gi)
  return lookerVersion
}
