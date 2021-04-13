/*

 MIT License

 Copyright (c) 2021 Looker Data Sciences, Inc.

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

import { NodeSession, NodeSettingsIniFile } from '@looker/sdk-node'
import { functionalSdk } from '@looker/sdk-rtl'
import { me } from '@looker/sdk/src/4.0/funcs'
import { me as me31 } from '@looker/sdk/src/3.1/funcs'
import { sdkVersion } from '@looker/sdk'
import { rootIni } from './utils'

const localConfig = rootIni()
const settings = new NodeSettingsIniFile('', localConfig, 'Looker')
const session = new NodeSession(settings)
const sdk = functionalSdk(session, '4.0', sdkVersion)
const sdk31 = functionalSdk(session, '3.1', sdkVersion)
;(async () => {
  const [resp, resp31] = await Promise.all([
    sdk.ok(me(sdk)),
    sdk.ok(me31(sdk31)),
  ])
  if (resp.id === resp31.id) {
    console.log('Congratulations! You are using dual SDKs!')
    console.log({ resp, resp31 })
  }
})()
