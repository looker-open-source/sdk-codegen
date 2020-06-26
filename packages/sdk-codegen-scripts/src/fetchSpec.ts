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

import * as fs from 'fs'
import { log, warn } from '@looker/sdk-codegen-utils'
import { IVersionInfo } from '@looker/sdk-codegen'
import {
  NodeTransport,
  defaultTimeout,
  ITransportSettings,
  sdkOk,
  sdkError,
} from '@looker/sdk'
import { fail, quit, isFileSync, utf8Encoding, isDirSync } from './nodeUtils'
import { ISDKConfigProps } from './sdkConfig'
import { convertSpec } from './convert'

/*
const { Spectral } = require('@stoplight/spectral')
const { getLocationForJsonPath, parseWithPointers } = require('@stoplight/json')

const lintyFresh = true

const lintCheck = async (fileName: string) => {
  if (!lintyFresh) return ''
  // return `${fileName} lint checking was skipped`
  try {
    // const linter = run('speccy', ['lint', fileName])
    const linter = new Spectral()
    if (!linter) return fail('Lint', 'no response')
    const spec = parseWithPointers(readFileSync(fileName))
    linter
      .run({
        parsed: spec,
        getLocationForJsonPath,
      })
      .then(console.log)
    return ''
    // if (
    //   linter.toString().indexOf('Specification is valid, with 0 lint errors') >=
    //   0
    // ) {
    //   return
    // }
  } catch (e) {
    return quit(e)
  }
}

*/

/**
 * Checks OpenAPI file for lint errors
 *
 * NOTE: Currently disabled
 * @param {string} fileName
 * @returns {Promise<void>}
 */
export const lintCheck = async (_fileName: string) => {
  return ''
}

let transport: NodeTransport

/**
 * Customize request transport properties for SDK codegen
 * @param {ISDKConfigProps} props SDK configuration properties
 * @returns {NodeTransport} codegen-specific overrides
 * @constructor
 */
export const specTransport = (props: ISDKConfigProps) => {
  if (transport) return transport
  const options: ITransportSettings = {
    agentTag: 'SDK Codegen',
    base_url: props.base_url,
    timeout: defaultTimeout,
    verify_ssl: props.verify_ssl,
  }
  transport = new NodeTransport(options)
  return transport
}

const loginUrl = (props: ISDKConfigProps) =>
  `${props.base_url}/api/${props.api_version}/login`

const logoutUrl = (props: ISDKConfigProps) =>
  `${props.base_url}/api/${props.api_version}/logout`

export const supportedVersion = (version: string, versions: any) => {
  const found = Object.entries(versions.supported_versions).find(
    ([, value]) => (value as any).version === version
  )
  if (found) return found[1]
  return undefined
}

export const swaggerFileUrl = (props: ISDKConfigProps, versions: any) => {
  const apiVersion = props.api_version
  if (!versions) {
    return `${props.base_url}/api/${apiVersion}/swagger.json`
  }
  const version: any = supportedVersion(apiVersion, versions)
  if (!version) {
    throw sdkError(`${apiVersion} is not a supported version`)
  }
  return version.swagger_url
}

export const openApiFileUrl = (props: ISDKConfigProps, versions: any) => {
  const apiVersion = props.api_version
  if (!versions) {
    return ''
  }
  const version: any = supportedVersion(apiVersion, versions)
  if (!version) {
    throw sdkError(`${apiVersion} is not a supported version`)
  }
  return version.openapi_url
}

export const specPath = 'spec'

export const swaggerFileName = (name: string, props: ISDKConfigProps) =>
  `${specPath}/${name}.${props.api_version}.json`

export const openApiFileName = (name: string, props: ISDKConfigProps) =>
  `${specPath}/${name}.${props.api_version}.oas.json`

/**
 * Is there an authentication error?
 * @param {string | object} content response to check
 * @returns {boolean} True if there's an authentication error
 */
const badAuth = (content: string | object) => {
  const text = typeof content === 'object' ? JSON.stringify(content) : content
  return text.indexOf('Requires authentication') > 0
}

export const logout = async (props: ISDKConfigProps, token: string) => {
  const xp = specTransport(props)

  return sdkOk<string, Error>(
    xp.request<string, Error>(
      'DELETE',
      logoutUrl(props),
      undefined,
      undefined,
      undefined,
      { headers: { Authorization: `Bearer ${token}` } }
    )
  )
}

export const login = async (props: ISDKConfigProps) => {
  const xp = specTransport(props)
  const creds = {
    client_id: props.client_id,
    client_secret: props.client_secret,
  }
  const url = loginUrl(props)

  try {
    const response = await sdkOk<any, Error>(
      xp.request<any, Error>(
        'POST',
        url,
        creds,
        undefined,
        undefined,
        undefined
      )
    )
    const accessToken = await response.access_token

    if (accessToken) {
      return accessToken
    } else {
      log(`Server Response: ${JSON.stringify(response)}`)
      throw new Error('Access token could not be retrieved.')
    }
  } catch (err) {
    throw err
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
  const xp = specTransport(props)
  // log(`GETting ${url} ...`)
  return sdkOk<string, Error>(
    xp.request<string, Error>(
      'GET',
      url,
      undefined,
      undefined,
      undefined,
      options
    )
  )
}

export const authGetUrl = async (
  props: ISDKConfigProps,
  url: string,
  failQuits = true
) => {
  let token = null
  let content: any = null
  try {
    // Try first without login. Most Looker instances don't require auth for spec retrieval
    content = await getUrl(props, url)
  } catch (err) {
    // Whoops!  Ok, try again with login
    token = await login(props)
    content = await getUrl(props, url, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (token) {
      await logout(props, token)
    }
  }

  if (badAuth(content)) {
    const authFailed = 'Authentication failed'
    if (failQuits) {
      return quit(authFailed)
    } else {
      throw new Error(authFailed)
    }
  }
  return content
}

export const fetchLookerVersions = async (props: ISDKConfigProps) => {
  return await authGetUrl(props, `${props.base_url}/versions`)
}

export const fetchLookerVersion = async (
  props: ISDKConfigProps,
  versions?: any
) => {
  let lookerVersion = ''
  if (!versions) {
    try {
      versions = await fetchLookerVersions(props)
      const matches = versions.looker_release_version.match(/^\d+\.\d+/i)
      lookerVersion = matches.lookerVersion
    } catch (e) {
      warn(`Could not retrieve looker release version: ${e.message}`)
    }
  }
  return lookerVersion
}

/**
 * Creates spec directory if needed, converts content to JSON string, writes file
 *
 * NOTE: if specFile is not in the spec path, write errors may occur
 *
 * @param {string} specFile name of spec file to write
 * @param {object | string} content to convert to a JSON string
 * @returns {string} name of file written
 */
export const writeSpecFile = (specFile: string, content: object | string) => {
  const data = typeof content === 'string' ? content : JSON.stringify(content)
  if (!isDirSync(specPath)) fs.mkdirSync(specPath, { recursive: true })
  fs.writeFileSync(specFile, data, utf8Encoding)
  return specFile
}

export const fetchSwaggerFile = async (
  name: string,
  props: ISDKConfigProps
) => {
  const fileName = swaggerFileName(name, props)
  if (isFileSync(fileName)) return fileName

  try {
    const versions = await fetchLookerVersions(props)
    const fileUrl = swaggerFileUrl(props, versions)
    const content = await authGetUrl(props, fileUrl)

    writeSpecFile(fileName, content)

    return fileName
  } catch (err) {
    checkCertError(err)
    return quit(err)
  }
}

export const logFetchSwagger = async (name: string, props: ISDKConfigProps) => {
  const specFile = await fetchSwaggerFile(name, props)
  if (!specFile) {
    return fail('fetchSwaggerFile', 'No specification file name returned')
  }
  return specFile
}

export const getVersionInfo = async (
  props: ISDKConfigProps
): Promise<IVersionInfo | undefined> => {
  try {
    const lookerVersion = await fetchLookerVersion(props)
    return {
      apiVersion: props.api_version,
      lookerVersion,
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
/**
 * Fetch (if needed) and convert a Swagger API specification to OpenAPI
 * @param {string} name base name of the target file
 * @param {ISDKConfigProps} props SDK configuration properties to use
 * @param versions version information structure from Looker
 * @returns {Promise<string>} name of converted OpenAPI file
 */
export const logConvertSpec = async (
  name: string,
  props: ISDKConfigProps,
  versions: any
) => {
  // if openApiFile is resolved correctly, this value will be the file name
  let result = ''
  const oaFile = openApiFileName(name, props)
  if (isFileSync(oaFile)) return oaFile

  const apiUrl = await openApiFileUrl(props, versions)
  if (apiUrl) {
    const spec = await authGetUrl(props, apiUrl)
    if (spec) {
      result = writeSpecFile(oaFile, spec)
    }
  } else {
    const specFile = await logFetchSwagger(name, props)
    result = convertSpec(specFile, oaFile)
    if (!result) {
      return fail('logConvert', 'No file name returned for openAPI upgrade')
    }

    await lintCheck(result)
  }
  return result
}
