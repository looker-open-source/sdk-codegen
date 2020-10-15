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

import dotenv from 'dotenv'
import { ProcessEnv, Credentials } from '../types'

const envVarNames = {
  SERVER_PORT: 'SERVER_PORT',
  LOOKERSDK_BASE_URL: 'LOOKERSDK_BASE_URL',
  LOOKERSDK_VERIFY_SSL: 'LOOKERSDK_VERIFY_SSL',
  GOOGLE_APPLICATION_CREDENTIAL_ENCODED:
    'GOOGLE_APPLICATION_CREDENTIAL_ENCODED',
}

const env = process.env as ProcessEnv

/**
 * Access token server settings. Convenience wrapper around process
 * environment variables. Ensures that the environment variables
 * have been defined.
 */
class Settings {
  private _serviceAccountCredentials: Credentials
  constructor() {
    if (process.env.LOOKERSDK_CLIENT_ID) {
      console.warn('LOOKERSDK_CLIENT_ID env set. Please remove!')
      delete process.env.LOOKERSDK_CLIENT_ID
    }
    if (process.env.LOOKERSDK_CLIENT_SECRET) {
      console.warn('LOOKERSDK_CLIENT_SECRET env set. Please remove!')
      delete process.env.LOOKERSDK_CLIENT_SECRET
    }
    const missingEnvVars = Object.keys(envVarNames)
      .filter((key) => key !== 'SERVER_PORT')
      .reduce((accum, key) => {
        if (!process.env[key]) {
          accum.push(key)
        }
        return accum
      }, [])
    if (missingEnvVars.length > 0) {
      const message = `Missing environment variables: ${missingEnvVars.join(
        ','
      )}`
      console.error(message)
      throw new Error(message)
    }
    try {
      this._serviceAccountCredentials = JSON.parse(
        Buffer.from(
          env[envVarNames.GOOGLE_APPLICATION_CREDENTIAL_ENCODED],
          'base64'
        ).toString()
      )
    } catch (err) {}
    if (!this._serviceAccountCredentials) {
      const message = `Invalid environment variable: ${envVarNames.GOOGLE_APPLICATION_CREDENTIAL_ENCODED}`
      console.error(message)
      throw new Error(message)
    }
  }

  /**
   * Port number that this server will run on.
   */
  get port() {
    return env[envVarNames.SERVER_PORT]
      ? parseInt(env[envVarNames.SERVER_PORT], 10)
      : 8081
  }

  /**
   * Looker server against which to validate looker credentials.
   */
  get lookerServerUrl() {
    return env[envVarNames.LOOKERSDK_BASE_URL]
  }

  /**
   * Whether or not to validate the Looker server SSL certificate.
   */
  get lookerServerVerifySsl() {
    return env[envVarNames.LOOKERSDK_VERIFY_SSL] !== 'false'
  }

  /**
   * Service account credentials (from Google console). The json file
   * is base64 encoded in order to store in an environment variable
   */
  get serviceAccountCredentials(): Credentials {
    return this._serviceAccountCredentials
  }
}

let setup: Settings

/**
 * Get the settings
 */
const getSettings = () => {
  if (!setup) {
    dotenv.config()
    setup = new Settings()
  }
  return setup
}

export { getSettings }
