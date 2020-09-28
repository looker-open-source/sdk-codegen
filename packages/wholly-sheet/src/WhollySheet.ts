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

import { IRowModel, SheetSDK, TabData } from './SheetSDK'

export interface IWhollySheet {
  /** Initialized REST-based GSheets SDK */
  sheets: SheetSDK
  /** Name of the tab */
  name: string
  /** Name of the key column that represents the "id" */
  keyColumn: string
  /** All data in the sheet */
  rows: TabData
  save<T extends IRowModel>(model: T): T
  create<T extends IRowModel>(model: T): T
  update<T extends IRowModel>(model: T): T
  find<T extends IRowModel>(value: any, columnName?: string): T | undefined
}

// https://github.com/gsuitedevs/node-samples/blob/master/sheets/snippets/test/helpers.js

/** CRUF (no delete) operations for a GSheet */
export class WhollySheet implements IWhollySheet {
  constructor(
    public readonly sheets: SheetSDK,
    public readonly name: string,
    public readonly rows: TabData,
    public readonly keyColumn: string
  ) {}

  private notYet(method: string) {
    throw new Error(`${method} not implemented`)
  }

  save<T extends IRowModel>(model: T): T {
    if (model.id) return this.update<T>(model)
    return this.create<T>(model)
  }

  create<T extends IRowModel>(model: T): T {
    this.notYet('create')
    return model
  }

  update<T extends IRowModel>(model: T): T {
    this.notYet('create')
    return model
  }

  find<T extends IRowModel>(value: any, columnName?: string): T | undefined {
    if (!value) return undefined
    if (typeof value === 'number')
      return this.rows.find((r) => r.row === value) as T
    return this.rows.find((r) => r[columnName || this.keyColumn] === value) as T
  }
}
