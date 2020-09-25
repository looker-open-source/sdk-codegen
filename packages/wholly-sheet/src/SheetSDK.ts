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

import { HttpMethod, ITransport } from '@looker/sdk-rtl/lib/browser'
import { parseResponse } from '@looker/sdk-rtl'

export const defaultScopes = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/spreadsheets.readonly',
]

// https://developers.google.com/sheets/api/reference/rest

// Manually recreated type/interface declarations that are NOT complete
export interface IGridProperties {
  rowCount: number
  columnCount: number
}

export interface ISheetTabProperties {
  sheetId: number
  title: string
  index: number
  sheetType: string
  gridProperties: IGridProperties
}

export interface ISheetTab {
  properties: ISheetTabProperties
  data: any // TODO maybe type this also?
}

export interface ISheetProperties {
  title: string
  local: string
  autoRecalc: string
  timeZone: string
}

export interface ISheet {
  /** id of the spreadsheet */
  spreadsheetId: string
  /** Sheet metadata */
  properties: ISheetProperties
  /** Individual sheet tabs */
  sheets: ISheetTab[]
  /** Url where sheet can be viewed */
  spreadsheetUrl: string
}

export class SheetSDK {
  constructor(
    public readonly transport: ITransport,
    public readonly apiKey: string,
    public sheetId: string
  ) {
    this.apiKey = encodeURIComponent(apiKey)
    this.sheetId = encodeURIComponent(sheetId)
  }

  async request(method: HttpMethod, api = '') {
    const key = (api.includes('?') ? '&' : '?') + `key=${this.apiKey}`
    const path = `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}${api}${key}`
    const raw = await this.transport.rawRequest(method, path)
    const response = await parseResponse(raw)
    if (!raw.ok) throw new Error(response)
    return response
  }

  /**
   * retrieve the entire sheet
   * **NOTE**: this response is cast to the ISheet interface so some properties may be hidden
   */
  async all() {
    const api = '?includeGridData=true'
    const result = await this.request('GET', api)
    return result as ISheet
  }

  /**
   * Get the values collection from the sheet. Defaults to all values in the sheet
   * @param range
   */
  async values(range = '!A1:end') {
    const api = range ? `/values/${range}` : ''
    const sheet = await this.request('GET', api)
    return sheet.values
  }

  async tabValues(tabName: string, range = '!A1:end') {
    return await this.values(`${tabName}${range}`)
  }
}

// const response = await extensionSDK.serverProxy(
//   `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
//     spreadsheetId
//   )}/values/${encodeURIComponent(
//     range
//   )}?key=${extensionSDK.createSecretKeyTag('google_api_key')}`
// )

/*
 * @example
 * // Before running the sample:
 * // - Enable the API at:
 * //   https://console.developers.google.com/apis/api/sheets.googleapis.com
 * // - Login into gcloud by running:
 * //   `$ gcloud auth application-default login`
 * // - Install the npm module by running:
 * //   `$ npm install googleapis`
 *
 * const {google} = require('googleapis');
 * const sheets = google.sheets('v4');
 *
 * async function main() {
 *   const auth = new google.auth.GoogleAuth({
 *     // Scopes can be specified either as an array or as a single, space-delimited string.
 *     scopes: [
 *       'https://www.googleapis.com/auth/drive',
 *       'https://www.googleapis.com/auth/drive.file',
 *       'https://www.googleapis.com/auth/drive.readonly',
 *       'https://www.googleapis.com/auth/spreadsheets',
 *       'https://www.googleapis.com/auth/spreadsheets.readonly',
 *     ],
 *   });
 *
 *   // Acquire an auth client, and bind it to all future calls
 *   const authClient = await auth.getClient();
 *   google.options({auth: authClient});
 *
 *   // Do the magic
 *   const res = await sheets.spreadsheets.get({
 *     // True if grid data should be returned. This parameter is ignored if a field mask was set in the request.
 *     includeGridData: 'placeholder-value',
 *     // The ranges to retrieve from the spreadsheet.
 *     ranges: 'placeholder-value',
 *     // The spreadsheet to request.
 *     spreadsheetId: 'placeholder-value',
 *   });
 *   console.log(res.data);
 *
 *   // Example response
 *   // {
 *   //   "developerMetadata": [],
 *   //   "namedRanges": [],
 *   //   "properties": {},
 *   //   "sheets": [],
 *   //   "spreadsheetId": "my_spreadsheetId",
 *   //   "spreadsheetUrl": "my_spreadsheetUrl"
 *   // }
 * }
 */
