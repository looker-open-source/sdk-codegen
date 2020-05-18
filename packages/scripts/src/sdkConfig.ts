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

import * as ini from 'ini'
import { readFileSync } from './nodeUtils'

export interface ISDKConfigProps {
  api_version: string
  api_versions: string
  base_url: string
  client_id: string
  client_secret: string
  verify_ssl: boolean
}

export interface ISDKConfigSection {
  [key: string]: ISDKConfigProps
}

export const SDKConfig = (fileName = './looker.ini') => {
  const settings = ini.parse(readFileSync(fileName))
  const config = settings as ISDKConfigSection
  Object.keys(config).forEach((key) => {
    const props: ISDKConfigProps = config[key]
    if (props.verify_ssl === undefined) props.verify_ssl = true
  })
  return config
}
