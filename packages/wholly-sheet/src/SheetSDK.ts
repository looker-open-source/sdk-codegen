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

/** Key/value pairs for tab data */
export type RowValues = Record<string, any>

/** name of the property that tracks the row's position in the tab sheet */
export const rowPosition = 'row'

export interface IRowModel extends RowValues {
  row: number
  keyName: string
  id: string
}

/** All keyed data values for a tab */
export type TabData = IRowModel[]

// Manually recreated type/interface declarations that are NOT complete
export interface ITabGridProperties {
  rowCount: number
  columnCount: number
}

export interface ITabProperties {
  sheetId: number
  title: string
  index: number
  sheetType: string
  gridProperties: ITabGridProperties
}

export interface ICellValue {
  stringValue: string
}

export interface ICellTextFormat {
  fontFamily: string
}

export interface ICellFormat {
  verticalAlignment: string
  textFormat: ICellTextFormat
}

export interface ICellData {
  userEnteredValue: ICellValue
  effectiveValue: ICellValue
  formattedValue: string
  userEnteredFormat: ICellFormat
  // effectiveFormat: {
  //   "backgroundColor": {
  //     "red": 1,
  //     "green": 1,
  //     "blue": 1
  //   },
  //   "padding": {
  //     "top": 2,
  //     "right": 3,
  //     "bottom": 2,
  //     "left": 3
  //   },
  //   "horizontalAlignment": "LEFT",
  //   "verticalAlignment": "BOTTOM",
  //   "wrapStrategy": "OVERFLOW_CELL",
  //   "textFormat": {
  //     "foregroundColor": {},
  //     "fontFamily": "Arial",
  //     "fontSize": 10,
  //     "bold": false,
  //     "italic": false,
  //     "strikethrough": false,
  //     "underline": false,
  //     "foregroundColorStyle": {
  //       "rgbColor": {}
  //     }
  //   },
  //   "hyperlinkDisplayType": "PLAIN_TEXT",
  //   "backgroundColorStyle": {
  //     "rgbColor": {
  //       "red": 1,
  //       "green": 1,
  //       "blue": 1
  //     }
  //   }
  // }
}

export interface ITabRowData {
  values: ICellData[]
}

export interface ITabData {
  rowData: ITabRowData[]
}

export interface ISheetTab {
  properties: ITabProperties
  data: ITabData
}

export interface ISheetProperties {
  title: string
  local: string
  autoRecalc: string
  timeZone: string
}

export type TabKeyedData = Record<string, TabData>

export interface ISheet {
  /** id of the spreadsheet */
  spreadsheetId: string
  /** Sheet metadata */
  properties: ISheetProperties
  /** Individual sheet tabs */
  sheets: ISheetTab[]
  /** All tabs data loaded into a keyed collection of TabData */
  tabs: TabKeyedData
  /** Url where sheet can be viewed */
  spreadsheetUrl: string
}

export const tabName = (tab: string | ISheetTab) => {
  if (typeof tab === 'string') return tab
  return tab.properties.title
}

export const loadTabValues = (tab: ISheetTab, keyName = 'id'): TabData => {
  const result: TabData = []
  const rowData = tab.data[0].rowData
  if (rowData.length < 1) return result

  // Get column headers
  const header: string[] = []
  const values = rowData[0].values
  for (let i = 0; i < values.length; i++) {
    const cell = values[i]
    // Are we at an empty header column?
    if (!cell.formattedValue) break
    header.push(cell.formattedValue)
  }

  // Index row data
  for (let rowIndex = 1; rowIndex < rowData.length; rowIndex++) {
    const r = rowData[rowIndex]
    const row = {}
    row[rowPosition] = rowIndex + 1
    header.forEach((colName, index) => {
      if (index < r.values.length) {
        const cell: ICellData = r.values[index]
        // Only assign cells with values
        if (cell.formattedValue) row[colName] = cell.formattedValue
      }
    })

    // An empty data row means we've hit the last row of data
    // some tabs have thousands of rows of no data
    if (Object.keys(row).length === 1) {
      break
    }

    if (!row[keyName]) {
      throw new Error(
        `Tab ${tabName(tab)} row ${rowIndex + 1} has no key column '${keyName}'`
      )
    }
    result.push(row as IRowModel)
  }
  return result
}

// https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values

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
  async read() {
    const api = '?includeGridData=true'
    const result = (await this.request('GET', api)) as ISheet
    return result
  }

  /**
   * Index the raw sheet into tab data
   * @param doc Sheet to index
   */
  async index(doc?: ISheet) {
    if (!doc) doc = await this.read()
    if (doc) {
      doc.tabs = {}
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      doc.sheets.forEach((tab) => (doc.tabs[tabName(tab)] = loadTabValues(tab)))
    }
    return doc
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

  async tabValues(tab: string | ISheetTab, range = '!A1:end') {
    return await this.values(`${tabName(tab)}${range}`)
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
