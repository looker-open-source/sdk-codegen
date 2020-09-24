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

import { google } from 'googleapis'

const sheets = google.sheets_v4

export interface ISheetModel {
  id?: string
}

export interface IWhollySheet {
  /** This is probably the GSheet API client structure? */
  client: any
  /** Id of the spreadsheet to use */
  spreadsheetId: string
  /** Name of the sheet/table to use */
  sheetName: string
  /** Name of the key column that represents the "id" */
  keyColumn: string
  /** Range expression for retrieving the entire sheet */
  range: string
  save<T>(model: T): T
  create<T>(model: T): T
  update<T>(model: T): T
  rows<T>(): T[]
  find<T>(value: any, key?: string): T | undefined
}

// https://github.com/gsuitedevs/node-samples/blob/master/sheets/snippets/test/helpers.js

export class Sheets {
  constructor(public readonly sheetId: string, credConfig: string) {
    const scopes = [
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/spreadsheets",
    ]
    const credentials = google.get
  }
}

/** CRUF (no delete) operations for a GSheet */
export class WhollySheet<T> implements IWhollySheet {
  public readonly range: string
  constructor(
    public readonly client: any,
    public readonly spreadsheetId: string,
    public readonly sheetName: string,
    public readonly keyColumn: string
  ) {
    this.range = `${sheetName}!A1:end`
  }

  save<T>(model: T): T {
    if (model.id) return this.update<T>(model)
    return this.create<T>(model)
  }

  create<T>(model: T): T {
    sheets.
  }
  update<T>(model: T): T {}
  rows<T>(model: T): T {}
  find<T>(model: T): T {}
}
