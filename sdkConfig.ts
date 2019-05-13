import * as fs from 'fs'
import * as ini from 'ini'

export interface SDKConfigProps {
  api_version: string
  base_url: string
  client_id: string
  client_secret: string
  embed_secret: string
  user_id: string
  verbose: boolean
  verify_ssl: boolean
}

export interface SDKConfigSection {
  [key: string]: SDKConfigProps
}

export const SDKConfig = (fileName = './looker.ini') => {
  const config = ini.parse(fs.readFileSync(fileName, 'utf-8')) as SDKConfigSection
  return config
}