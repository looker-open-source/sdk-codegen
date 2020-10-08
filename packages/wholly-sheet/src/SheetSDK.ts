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

import {
  HttpMethod,
  boolDefault,
  DelimArray,
  APIMethods,
  IAuthSession,
} from '@looker/sdk-rtl/lib/browser'

export const noDate = new Date(-8640000000000000)

/** Signifies an empty cell */
export const NIL = '\0'

/** Convert a value to the string representation for a cell value */
export const stringer = (value: any) => {
  if (value === undefined || value === null) return NIL
  if (value instanceof Date) {
    if (value === noDate) return NIL
    return value.toISOString()
  }
  return value.toString()
}

/** Key/value pairs for tab data */
export type RowValues = Record<string, any>

/** Sheet (tab) column header definition */
export type ColumnHeaders = string[]

/** name of the property that tracks the row's position in the tab sheet */
export const rowPosition = 'row'

/** Keyed data for a sheet row */
export interface IRowModel extends RowValues {
  row: number
  id: string
  assign(values: any): IRowModel
  /** All keys for this object */
  keys(): ColumnHeaders
  /** The sheet Column Headers keys for this model */
  header(): ColumnHeaders
  /** Column values for the entire row to write to the GSheet */
  values(): any[]
}

export class RowModel<T extends IRowModel> implements IRowModel {
  row: number
  id: string

  protected constructor(values?: any) {
    this.row = 0
    this.id = ''
    if (values) {
      if (values.row) this.row = values.row
      if (values.id) this.id = values.id
    }
  }

  keys(): ColumnHeaders {
    return Object.keys(this)
  }

  header(): ColumnHeaders {
    // remove `row`
    return this.keys().slice(1)
  }

  values() {
    const result: any[] = []
    const keys = this.header()
    keys.forEach((key) => {
      result.push(stringer(this[key]))
    })
    return result
  }

  typeCast(key: string, value: any) {
    if (!value) return undefined
    if (typeof this[key] === 'string') {
      return value.toString()
    }
    if (typeof this[key] === 'number') {
      const isInt = /^([+-]?[1-9]\d*|0)$/
      if (value.toString().match(isInt)) {
        return parseInt(value, 10)
      }
      return parseFloat(value)
    }
    if (typeof this[key] === 'boolean') {
      return boolDefault(value, false)
    }
    if (this[key] instanceof Date) {
      return new Date(value)
    }
    if (this[key] instanceof DelimArray) {
      return value.toString().split(',')
    }
    return this.toString()
  }

  assign(values: any): T {
    if (values) {
      const keys = this.header()
      if (Array.isArray(values)) {
        // Assign by position
        values.forEach((val, index) => {
          const key = keys[index]
          const value = this.typeCast(key, val)
          this[key] = value
        })
      } else {
        // Assign by name
        Object.entries(values).forEach(([key, val]) => {
          if (key in this) {
            this[key] = this.typeCast(key, val)
          }
        })
      }
    }
    return (this as unknown) as T
  }
}

// TODO figure out the Typescript magic for this to work
export type RowModelFactory<T extends IRowModel> = { new (values?: any): T }

// export const RowModelCreator: RowModelFactory<IRowModel> = (values?: any) =>
//   new RowModel(values)

/** Keyed data for a tab, and the tab's header row */
export interface ITabTable {
  /** Array of header names, in column order */
  header: ColumnHeaders
  /** Parsed data for the tab */
  rows: IRowModel[]
}

export const defaultScopes = [
  // 'https://www.googleapis.com/auth/drive',
  // 'https://www.googleapis.com/auth/drive.file',
  // 'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/spreadsheets',
  // 'https://www.googleapis.com/auth/spreadsheets.readonly',
]

// https://developers.google.com/sheets/api/reference/rest

export class SheetError extends Error {
  constructor(message?: string) {
    super(message) // 'Error' breaks prototype chain here
    Object.setPrototypeOf(this, new.target.prototype) // restore prototype chain
  }
}

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

export type TabTables = Record<string, ITabTable>

export interface ISheet {
  /** id of the spreadsheet */
  spreadsheetId: string
  /** Sheet metadata */
  properties: ISheetProperties
  /** Individual sheet tabs */
  sheets: ISheetTab[]
  /** All tabs data loaded into a keyed collection of TabData */
  tabs: TabTables
  /** Url where sheet can be viewed */
  spreadsheetUrl: string
}

export const tabName = (tab: string | ISheetTab) => {
  if (typeof tab === 'string') return tab
  return tab.properties.title
}

/**
 * Loads the GSheet data from a sheet (tab) into a header name collection and data rows
 *
 * NOTE: data collection stops when a blank row is encountered, or or at the end of all rows.
 *
 * @param tab GSheet sheet to process
 * @param keyName Optional key column name. Defaults to id
 */
export const loadTabTable = (tab: ISheetTab, keyName = 'id'): ITabTable => {
  const result: ITabTable = {
    header: [],
    rows: [],
  }
  const rowData = tab.data[0].rowData
  if (rowData.length < 1) return result

  // Get column headers
  const values = rowData[0].values
  for (let i = 0; i < values.length; i++) {
    const cell = values[i]
    // Are we at an empty header column?
    if (!cell.formattedValue) break
    result.header.push(cell.formattedValue)
  }

  // Index row data
  for (let rowIndex = 1; rowIndex < rowData.length; rowIndex++) {
    const r = rowData[rowIndex]
    const row = {}
    row[rowPosition] = rowIndex + 1
    result.header.forEach((colName, index) => {
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
      throw new SheetError(
        `Tab ${tabName(tab)} row ${rowIndex + 1} has no key column '${keyName}'`
      )
    }
    result.rows.push(row as IRowModel)
  }
  return result
}

// https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values

const sheetSDKVersion = '0.1.0-alpha'

export class SheetSDK extends APIMethods {
  constructor(authSession: IAuthSession, public sheetId: string) {
    super(authSession, sheetSDKVersion)
    authSession.settings.agentTag = `SheetSDK ${this.apiVersion}`
    this.sheetId = encodeURIComponent(sheetId)
  }

  async request<TSuccess>(method: HttpMethod, api = '', body: any = undefined) {
    const path = `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}${api}`
    const response = await this.ok<TSuccess, SheetError>(
      this.authRequest<TSuccess, SheetError>(method, path, undefined, body)
    )
    // const response = await parseResponse(raw)
    // if (!raw.ok) throw new SheetError(response)
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
  async index(doc?: ISheet): Promise<ISheet> {
    if (!doc) doc = await this.read()
    if (doc) {
      doc.tabs = {}
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      doc.sheets.forEach((tab) => (doc.tabs[tabName(tab)] = loadTabTable(tab)))
    }
    return doc
  }

  // /**
  //  * Get the values collection from the sheet. Defaults to all values in the sheet
  //  * @param range
  //  */
  // async values(range = '!A1:end') {
  //   const api = range ? `/values/${range}` : ''
  //   const sheet = await this.request('GET', api)
  //   return sheet.values
  // }

  /**
   * Get the values for a sheet row
   * @param tab name or tab sheet
   * @param row to retrieve
   */
  async getRow(tab: string | ISheetTab, row: number) {
    if (!row) throw new SheetError('row cannot be zero')
    const name = tabName(tab)
    const api = `/values/${name}!A${row}:end`
    const sheet = await this.request<any>('GET', api)
    return sheet.values
  }

  private static bodyValues(values: any[]) {
    return JSON.stringify({ values: [values] })
  }

  /**
   * Update a row of a sheet with the provided values
   *
   * @param tab name or tab sheet
   * @param row 1-based position of row
   * @param values to assign in order for the row
   */
  async updateRow(tab: string | ISheetTab, row: number, values: any[]) {
    const body = SheetSDK.bodyValues(values)
    const name = tabName(tab)
    // TODO receive changed values back from request
    // https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/update
    const options =
      'valueInputOption=RAW&includeValuesInResponse=true&responseValueRenderOption=FORMATTED_VALUE'
    const api = `/values/${name}!A${row}:end?${options}`
    const response = await this.request<any>('PUT', api, body)
    const changeCount = values.length
    const expected = `1 row(s), ${changeCount} column(s), ${changeCount} cells`
    const actual = `${response.updatedRows} row(s), ${response.updatedColumns} column(s), ${response.updatedCells} cells`
    if (expected !== actual)
      throw new SheetError(`Update expected ${expected} but got ${actual}`)
    return response
  }

  /**
   * Create a row of a sheet with the provided values
   *
   * @param tab name or tab sheet
   * @param row 1-based position of row
   * @param values to assign in order for the row
   * @return number of the created row
   */
  async createRow(
    tab: string | ISheetTab,
    row: number,
    values: any[]
  ): Promise<{ row: number; response: any }> {
    const body = SheetSDK.bodyValues(values)
    const name = tabName(tab)
    // TODO receive changed values back from request
    // https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/append
    const options =
      'valueInputOption=RAW&insertDataOption=INSERT_ROWS&includeValuesInResponse=true&responseValueRenderOption=FORMATTED_VALUE'
    const api = `/values/${name}!A${row}:end:append?${options}`
    const response = await this.request<any>('POST', api, body)
    const range = response.updates.updatedRange
    const match = range.match(/!A(\d+):/)
    if (!match) {
      throw new SheetError(`Update couldn't extract row from range ${range}`)
    }
    const rowId = parseInt(match[1])
    return { row: rowId, response: response }
  }

  // async tabValues(tab: string | ISheetTab, range = '!A1:end') {
  //   return await this.values(`${tabName(tab)}${range}`)
  // }
}
