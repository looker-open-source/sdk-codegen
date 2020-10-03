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

export interface ProcessEnv {
  [key: string]: string
}
interface Credentials {
  private_key: string
  client_email: string
}

const envVarNames = {
  SERVER_PORT: 'SERVER_PORT',
  LOOKER_SERVER_URL: 'LOOKER_SERVER_URL',
  LOOKER_SERVER_VERIFY_SSL: 'LOOKER_SERVER_VERIFY_SSL',
  SERVICE_ACCOUNT_CREDENTIALS: 'SERVICE_ACCOUNT_CREDENTIALS',
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
    const missingEnvVars = Object.keys(envVarNames).reduce((accum, key) => {
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
    if (!env[envVarNames.SERVER_PORT].match(/^[0-9]*$/)) {
      const message = `Invalid environment variable: ${envVarNames.SERVER_PORT}`
      console.error(message)
      throw new Error(message)
    }
    try {
      this._serviceAccountCredentials = JSON.parse(
        Buffer.from(
          env[envVarNames.SERVICE_ACCOUNT_CREDENTIALS],
          'base64'
        ).toString()
      )
    } catch (err) {}
    if (!this._serviceAccountCredentials) {
      const message = `Invalid environment variable: ${envVarNames.SERVICE_ACCOUNT_CREDENTIALS}`
      console.error(message)
      throw new Error(message)
    }
  }

  /**
   * Port number that this server will run on.
   */
  get port() {
    return parseInt(env[envVarNames.SERVER_PORT], 10)
  }

  /**
   * Looker server against which to validate looker credentials.
   */
  get lookerServerUrl() {
    return env[envVarNames.LOOKER_SERVER_URL]
  }

  /**
   * Whether or not to validate the Looker server SSL certificate.
   */
  get lookerServerVerifySsl() {
    return env[envVarNames.LOOKER_SERVER_VERIFY_SSL] !== 'false'
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
