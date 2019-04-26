import fetch from 'node-fetch'
import { ISDKConfigProps } from './sdkConfig'
import { URLSearchParams } from 'url'
import * as fs from 'fs'

const specFileUrl = (config: ISDKConfigProps) => `${config.base_url}/api/${config.api_version}/swagger.json`

const loginUrl = (config: ISDKConfigProps) => `${config.base_url}/login`

const logoutUrl = (config: ISDKConfigProps) => `${config.base_url}/login`

const logout = async (config: ISDKConfigProps, token: string) =>
  await fetch(logoutUrl(config), { method: 'DELETE', headers: { 'Authorization': `token ${token}` } })

const login = async (config: ISDKConfigProps) => {

  const params = new URLSearchParams()
  params.append('client_id', config.client_id);
  params.append('client_secret', config.client_secret);

  try {
    const token = await fetch(loginUrl(config), { method: 'POST', body: params })
    return token
  } catch (err) {
    console.error(err)
  }
}

const specFileName = (name: string, config: ISDKConfigProps) =>
  `${name}.${config.api_version}.json`

export const fetchSpecFile = async (name: string, config: ISDKConfigProps) => {
  const fileName = specFileName(name, config)
  // TODO make switch for "always fetch"
  if (fs.existsSync(fileName)) return fileName

  try {
    const token = await login(config)
    const response = await fetch(specFileUrl(config), { headers: { 'Authorization': `token ${token}` } })
    const content = await response.text()
    fs.writeFileSync(fileName, content)
    await logout(config, token)
    return fileName
  } catch (err) {
    console.log(err)
  }
}
