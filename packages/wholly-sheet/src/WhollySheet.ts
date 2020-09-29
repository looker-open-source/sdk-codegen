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
  ColumnHeaders,
  IRowModel,
  ITabTable,
  noDate,
  SheetSDK,
} from './SheetSDK'

export interface IWhollySheet<T extends IRowModel> {
  /** Initialized REST-based GSheets SDK */
  sheets: SheetSDK
  /** Name of the tab */
  name: string
  /** Header column names */
  header: ColumnHeaders
  /** Name of the key column that represents the "id" */
  keyColumn: string
  /** All data in the sheet */
  rows: T[]
  /** Keyed row retrieval */
  index: Record<string, T>
  // TODO figure out init generic typing issue
  // init(values?: any): (values?: any) => T
  checkHeader(header: ColumnHeaders): boolean
  /** Gets the row's values in column order */
  values(model: T): any[]
  save<T extends IRowModel>(model: T): T
  create<T extends IRowModel>(model: T): T
  update<T extends IRowModel>(model: T): T
  find(value: any, columnName?: string): T | undefined
}

// https://github.com/gsuitedevs/node-samples/blob/master/sheets/snippets/test/helpers.js

/** CRUF (no delete) operations for a GSheet */
export class WhollySheet<T extends IRowModel> implements IWhollySheet<T> {
  index: Record<string, T> = {}
  rows: T[]
  constructor(
    public readonly sheets: SheetSDK,
    public readonly name: string,
    public readonly table: ITabTable,
    public readonly keyColumn: string = 'id' // public readonly NewItem: RowModelFactory<T>
  ) {
    this.rows = this.table.rows as T[]
    this.createIndex()
    this.checkHeader()
  }

  // // TODO figure out init generic typing issue
  // init(values?: any): T {
  //   const result: T = new this.NewItem(values)
  //   return result
  // }

  /**
   * convert value to the strong type, or undefined if not value
   * @param value to strongly type
   * @private
   */
  private toAT<T extends IRowModel>(value: unknown): T | undefined {
    if (value) return value as T
    return undefined
  }

  checkHeader() {
    // TODO figure out generic constructor
    return true
    // // limitations of checking property keys of interface https://stackoverflow.com/a/56121798
    // const mock = new this.NewItem()
    // // row should be the first key, so skip it
    // const keys = Object.keys(mock).slice(1)
    // return keys === this.header
  }

  get header() {
    return this.table.header
  }

  private createIndex() {
    this.index = {}
    this.rows.forEach((r) => {
      this.index[r[this.keyColumn]] = r
    })
  }

  private notYet(method: string) {
    throw new Error(`${method} not implemented`)
  }

  values(model: T) {
    const result: any[] = []
    this.header.forEach((h) => {
      const value = model[h]
      if (value === noDate) {
        result.push(undefined)
      } else {
        result.push(model[h])
      }
    })
    return result
  }

  save<T extends IRowModel>(model: T): T {
    // A model with a non-zero row is an update
    if (model.row) return this.update<T>(model)
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

  find(value: any, columnName?: string): T | undefined {
    if (!value) return undefined
    let key = columnName || this.keyColumn
    if (typeof value === 'number') {
      // Default key to row
      if (!columnName) key = 'row'
    }
    if (columnName === this.keyColumn) {
      // Find by index
      return this.toAT(this.index[value.toString()])
    }
    return this.toAT(this.rows.find((r) => r[key] === value))
  }
}
