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
import { DefaultSettings } from '@looker/sdk-rtl/lib/browser'
import { ISheet, SheetSDK } from '@looker/wholly-sheet'
import { getExtensionSDK } from '@looker/extension-sdk'
import { getCore40SDK } from '@looker/extension-sdk-react'
import { SheetData } from '../models/SheetData'
import { GAuthSession } from '../authToken/gAuthSession'
import { Projects } from '../models'
import { ExtensionProxyTransport } from '../authToken/extensionProxyTransport'

let sheetData: SheetData

const initSheetData = async () => {
  if (sheetData) return sheetData
  // Values required
  const extSDK = getExtensionSDK()
  const lookerSdk = getCore40SDK()
  const tokenServerUrl =
    (await extSDK.userAttributeGetItem('token_server_url')) || ''
  const sheetId = (await extSDK.userAttributeGetItem('sheet_id')) || ''

  const options = {
    ...DefaultSettings(),
    ...{ base_url: tokenServerUrl },
  }

  const transport = new ExtensionProxyTransport(extSDK, options)
  const gSession = new GAuthSession(extSDK, options, transport)
  const sheetSDK = new SheetSDK(gSession, sheetId)
  const emptySheet = {} as ISheet
  sheetData = new SheetData(sheetSDK, emptySheet)
  return sheetData
}

export const sheetsSdkHelper = {
  getProjects: async (): Promise<Projects> => {
    const data = await initSheetData()
    const result = await data.refresh()
    return result.projects
  },
}
