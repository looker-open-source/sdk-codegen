import fetch from 'node-fetch'
import { SDKConfigProps } from './sdkConfig'
import { URLSearchParams } from 'url'
import * as fs from 'fs'

const specFileUrl = (config: SDKConfigProps) => `${config.base_url}/api/${config.api_version}/swagger.json`

const loginUrl = (config: SDKConfigProps) => `${config.base_url}/login`

const logoutUrl = (config: SDKConfigProps) => `${config.base_url}/login`

const logout = async (config: SDKConfigProps, token: string) =>
  fetch(logoutUrl(config), { method: 'DELETE', headers: { 'Authorization': `token ${token}` } })

const login = async (config: SDKConfigProps) => {

  const params = new URLSearchParams()
  params.append('client_id', config.client_id);
  params.append('client_secret', config.client_secret);

  try {
    const response = await fetch(loginUrl(config), { method: 'POST', body: params })
    const body = await response.json()
    const accessToken = await body.access_token

    if (accessToken) {
      return accessToken
    } else {
      console.log("Server Response: ", body)
      throw new Error("Access token could not be retrieved.")
    }

  } catch (err) {
    console.error(err)
  }
}

const specFileName = (name: string, config: SDKConfigProps) =>
  `./${name}.${config.api_version}.json`

export const fetchSpecFile = async (name: string, config: SDKConfigProps) => {
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
    return
  }
}
