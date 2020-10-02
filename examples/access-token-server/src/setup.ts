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
  LOOKER_CLIENT_ID: 'LOOKER_CLIENT_ID',
  LOOKER_CLIENT_SECRET: 'LOOKER_CLIENT_SECRET',
  SERVICE_ACCOUNT_CREDENTIALS: 'SERVICE_ACCOUNT_CREDENTIALS',
}

const env = process.env as ProcessEnv

class Setup {
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

  get port() {
    return parseInt(env[envVarNames.SERVER_PORT], 10)
  }

  get lookerServerUrl() {
    return env[envVarNames.LOOKER_SERVER_URL]
  }

  get lookerClientId() {
    return env[envVarNames.LOOKER_CLIENT_ID]
  }

  get lookerClientSecret() {
    return env[envVarNames.LOOKER_CLIENT_SECRET]
  }

  get serviceAccountCredentials(): Credentials {
    return this._serviceAccountCredentials
  }
}

let setup: Setup

const getSetup = () => {
  if (!setup) {
    dotenv.config()
    setup = new Setup()
  }
  return setup
}

export { getSetup }
