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

import type { HttpMethod, IAuthSession } from '@looker/sdk-rtl';
import { APIMethods } from '@looker/sdk-rtl';
import type { ColumnHeaders, IRowModel } from './RowModel';
import { rowPosition } from './RowModel';

/** Keyed data for a tab, and the tab's header row */
export interface ITabTable {
  /** Array of header names, in column order */
  header: ColumnHeaders;
  /** Parsed data for the tab */
  rows: IRowModel[];
}

export const defaultScopes = [
  // 'https://www.googleapis.com/auth/drive',
  // 'https://www.googleapis.com/auth/drive.file',
  // 'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/spreadsheets',
  // 'https://www.googleapis.com/auth/spreadsheets.readonly',
];

// https://developers.google.com/sheets/api/reference/rest

export class SheetError extends Error {
  constructor(message?: string) {
    super(message); // 'Error' breaks prototype chain here
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
  }
}

// Manually recreated type/interface declarations that are NOT complete
export interface ITabGridProperties {
  rowCount: number;
  columnCount: number;
}

export interface ITabProperties {
  sheetId: number;
  title: string;
  index: number;
  sheetType: string;
  gridProperties: ITabGridProperties;
}

export interface ICellValue {
  stringValue: string;
}

export interface ICellTextFormat {
  fontFamily: string;
}

export interface ICellFormat {
  verticalAlignment: string;
  textFormat: ICellTextFormat;
}

export interface ICellData {
  userEnteredValue: ICellValue;
  effectiveValue: ICellValue;
  formattedValue: string;
  userEnteredFormat: ICellFormat;
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
  values: ICellData[];
}

export interface ITabData {
  rowData: ITabRowData[];
}

export interface ISheetTab {
  properties: ITabProperties;
  data: ITabData;
}

export interface ISheetProperties {
  title: string;
  local: string;
  autoRecalc: string;
  timeZone: string;
}

export type TabTables = Record<string, ITabTable>;

export interface ISheet {
  /** id of the spreadsheet */
  spreadsheetId: string;
  /** Sheet metadata */
  properties: ISheetProperties;
  /** Individual sheet tabs */
  sheets: ISheetTab[];
  /** All tabs data loaded into a keyed collection of TabData */
  tabs: TabTables;
  /** Url where sheet can be viewed */
  spreadsheetUrl: string;
}

/**
 * Returns the name of the tab
 * @param tab string or ISheetTab interface
 */
export const tabName = (tab: string | ISheetTab) => {
  if (typeof tab === 'string') return tab;
  return tab.properties.title;
};

/**
 * Loads the GSheet data from a sheet (tab) into a header name collection and data rows
 *
 * NOTE: data collection stops when a blank row is encountered, or or at the end of all rows.
 *
 * @param tab GSheet sheet to process
 * @param keyName Optional key column name. Defaults to _id
 */
export const loadTabTable = (tab: ISheetTab, keyName = '_id'): ITabTable => {
  const result: ITabTable = {
    header: [],
    rows: [],
  };
  const rowData = (tab.data as any)[0].rowData;
  if (rowData.length < 1) return result;

  // Get column headers
  const values = rowData[0].values;
  for (let i = 0; i < values.length; i++) {
    const cell = values[i];
    // Are we at an empty header column?
    if (!cell.formattedValue) break;
    result.header.push(cell.formattedValue);
  }

  // Index row data
  for (let rowIndex = 1; rowIndex < rowData.length; rowIndex++) {
    const r = rowData[rowIndex];
    const row: any = {};
    row[rowPosition] = rowIndex + 1;
    result.header.forEach((colName, index) => {
      if (index < r.values.length) {
        const cell: ICellData = r.values[index];
        // Only assign cells with values
        if (cell.formattedValue) row[colName] = cell.formattedValue;
      }
    });

    // An empty data row means we've hit the last row of data
    // some tabs have thousands of rows of no data
    if (Object.keys(row).length === 1) {
      break;
    }

    if (!row[keyName]) {
      throw new SheetError(
        `Tab ${tabName(tab)} row ${rowIndex + 1} has no key column '${keyName}'`
      );
    }
    result.rows.push(row as IRowModel);
  }
  return result;
};

// https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values
export type SheetValues = any[];

const sheetSDKVersion = '0.5.0-beta';

export interface ISheetRowResponse {
  row: number;
  values: SheetValues;
}

export class SheetSDK extends APIMethods {
  constructor(
    authSession: IAuthSession,
    public sheetId: string
  ) {
    super(authSession, sheetSDKVersion);
    authSession.settings.agentTag = `SheetSDK ${this.apiVersion}`;
    this.sheetId = encodeURIComponent(sheetId);
  }

  async request<TSuccess>(method: HttpMethod, api = '', body: any = undefined) {
    const path = `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}${api}`;
    const response = await this.ok<TSuccess, SheetError>(
      this.authRequest<TSuccess, SheetError>(method, path, undefined, body)
    );
    // const response = await parseResponse(raw)
    // if (!raw.ok) throw new SheetError(response)
    return response;
  }

  /**
   * retrieve the entire sheet
   * **NOTE**: this response is cast to the ISheet interface so some properties may be hidden
   */
  async read() {
    const api = '?includeGridData=true';
    const result = (await this.request('GET', api)) as ISheet;
    return result;
  }

  /**
   * Index the raw sheet into tab data
   * @param doc Sheet to index
   */
  async index(doc?: ISheet): Promise<ISheet> {
    if (!doc) doc = await this.read();
    if (doc) {
      doc.tabs = {};
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      doc.sheets.forEach(tab => (doc.tabs[tabName(tab)] = loadTabTable(tab)));
    }
    return doc;
  }

  /**
   * Get a values collection for the specified range
   * @param range Defaults to all values in the default (first?) tab
   */
  async getValues(range = '!A1:end') {
    const api = range ? `/values/${range}` : '';
    const sheet = await this.request<any>('GET', api);
    return sheet.values as SheetValues;
  }

  /**
   * Get the values for a sheet row
   * @param tab name or tab sheet
   * @param row to retrieve
   */
  async rowGet(tab: string | ISheetTab, row: number) {
    if (!row) throw new SheetError('row cannot be zero');
    const name = tabName(tab);
    const api = `/values/${name}!A${row}:end`;
    const sheet = await this.request<any>('GET', api);
    return sheet.values as SheetValues;
  }

  /**
   * Replaces all values in a sheet from row to the length of the values array
   * @param tab to update
   * @param values row array of values
   * @param row starting position to replace. Defaults to the first row of the sheet
   */
  async batchUpdate(tab: string | ISheetTab, values: SheetValues, row = 1) {
    if (!values || values.length === 0 || !Array.isArray(values[0]))
      throw new SheetError(
        `Nothing to batch update. Expected an array of row values`
      );
    const name = tabName(tab);
    const data = {
      range: `${name}!A${row}:end`,
      majorDimension: 'ROWS',
      values: values,
    };
    const api = `/values:batchUpdate`;
    const body = {
      valueInputOption: 'RAW',
      data: [data],
      includeValuesInResponse: true,
      responseValueRenderOption: 'UNFORMATTED_VALUE',
      responseDateTimeRenderOption: 'FORMATTED_STRING',
    };
    const response = await this.request<any>('POST', api, JSON.stringify(body));
    // remove header row
    const update = response.responses[0].updatedData.values.slice(1);
    return update;
  }

  /**
   * Clear all values from a tab
   * @param tab to clear
   */
  async tabClear(tab: string | ISheetTab) {
    const name = tabName(tab);
    // https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/batchClear
    // TODO is there a way to KNOW what the last column is?
    const body = { ranges: [name] };
    const api = `/values:batchClear`;
    const response = await this.request<any>('POST', api, JSON.stringify(body));
    return response;
  }

  /**
   * Delete the specified row on the tab by compacting the tab
   * @param tab name or ISheetTab
   * @param row to remove
   */
  async rowDelete(tab: string | ISheetTab, row: number) {
    /**
     * Multiple expensive steps required for this functionality:
     * - read all values from the sheet
     * - delete the array entry for the requested row
     * - batch update the sheet with the new collection
     */

    if (!row) throw new SheetError('row cannot be zero');
    const batch = await this.tabValues(tab);
    const rowPos = row - 1;
    if (rowPos > batch.length)
      throw new SheetError(
        `Row ${row} doesn't exist. ${batch.length} rows found.`
      );
    await this.tabClear(tab);
    // Remove the target row
    batch.splice(rowPos, 1);

    const values = await this.batchUpdate(tab, batch);
    return values;
  }

  private static bodyValues(values: SheetValues) {
    return JSON.stringify({ values: [values] });
  }

  /**
   * Update a row of a sheet with the provided values
   *
   * @param tab name or tab sheet
   * @param row 1-based position of row
   * @param values to assign in order for the row
   *
   * The values collection returned has all rows starting from the updated row
   * to the end of the sheet. If only one row of values is passed in, only
   * one row is actually updated, but all remaining rows to the end of the sheet
   * are also returned
   */
  async rowUpdate(
    tab: string | ISheetTab,
    row: number,
    values: SheetValues
  ): Promise<ISheetRowResponse> {
    const body = SheetSDK.bodyValues(values);
    const name = tabName(tab);
    // TODO receive changed values back from request
    // https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/update
    const options =
      'valueInputOption=RAW&includeValuesInResponse=true&responseValueRenderOption=FORMATTED_VALUE';
    const api = `/values/${name}!A${row}:end?${options}`;
    const response = await this.request<any>('PUT', api, body);
    const changeCount = values.length;
    const expected = `1 row(s), ${changeCount} column(s), ${changeCount} cells`;
    const actual = `${response.updatedRows} row(s), ${response.updatedColumns} column(s), ${response.updatedCells} cells`;
    if (expected !== actual)
      throw new SheetError(`Update expected ${expected} but got ${actual}`);
    return { row: row, values: response.updatedData.values };
  }

  /**
   * Create a row of a sheet with the provided values
   *
   * @param tab name or tab sheet
   * @param row 1-based position of row
   * @param values to assign in order for the row
   * @return number of the created row
   *
   * The values collection returned includes only the rows of data that were created
   */
  async rowCreate(
    tab: string | ISheetTab,
    row: number,
    values: SheetValues
  ): Promise<ISheetRowResponse> {
    const body = SheetSDK.bodyValues(values);
    const name = tabName(tab);
    // TODO receive changed values back from request
    // https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/append
    const options =
      'valueInputOption=RAW&insertDataOption=INSERT_ROWS&includeValuesInResponse=true&responseValueRenderOption=FORMATTED_VALUE';
    const api = `/values/${name}!A${row}:end:append?${options}`;
    const response = await this.request<any>('POST', api, body);
    const range = response.updates.updatedRange;
    const match = range.match(/!A(\d+):/);
    if (!match) {
      throw new SheetError(`Update couldn't extract row from range ${range}`);
    }
    const rowId = parseInt(match[1]);
    return { row: rowId, values: response.updates.updatedData.values };
  }

  /**
   * Get values (rows of columns) from the tab
   * @param tab name or ISheetTab
   * @param range defaults to the entire sheet
   */
  async tabValues(tab: string | ISheetTab, range = '!A1:end') {
    return await this.getValues(`${tabName(tab)}${range}`);
  }
}
