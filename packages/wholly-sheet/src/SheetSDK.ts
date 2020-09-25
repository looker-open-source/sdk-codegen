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

export const defaultScopes = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/spreadsheets.readonly',
]

// https://developers.google.com/sheets/api/reference/rest

export class SheetSDK {
  constructor(
    public readonly transport: ITransport,
    public readonly apiKey: string,
    public id: string
  ) {}

  async request(method: HttpMethod, api: string) {
    const path = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
      this.id
    )}${api}?key=${this.apiKey}`
    const response = await this.transport.rawRequest(method, path)
    return response.body
  }

  async values(range = '!A1:end') {
    const api = range ? `/values/${range}` : ''
    return await this.request('GET', api)
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
