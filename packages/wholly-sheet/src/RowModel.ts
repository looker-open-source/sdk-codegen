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

import { v4 as uuidv4 } from 'uuid'
import { boolDefault } from '@looker/sdk-rtl/lib/browser'
import { SheetValues } from './SheetSDK'

export const noDate = new Date(-8640000000000000)

/** Signifies an empty cell */
export const nilCell = '\0'

export const addMinutes = (date: Date, minutes: number) => {
  return new Date(date.getTime() + minutes * 60000)
}

/** Convert a value to the string representation for a cell value */
export const stringer = (value: any) => {
  if (value === undefined || value === null) return nilCell
  if (value instanceof Date) {
    if (value === noDate) return nilCell
    return value.toISOString()
  }
  return value.toString()
}

/** Key/value pairs for tab data */
export type RowValues = Record<string, any>

/** Sheet (tab) column header definition */
export type ColumnHeaders = string[]

/** name of the property that tracks the row's position in the tab sheet */
export const rowPosition = '_row'

export interface IRowValidationError {
  message: string
  type: 'error'
}

export type RowValidationErrors = Record<string, IRowValidationError>

/** Keyed data for a sheet row */
export interface IRowModel extends RowValues {
  _row: number
  _id: string
  _updated: Date
  assign(values: any): IRowModel
  /** All keys for this object */
  keys(): ColumnHeaders
  /** The sheet Column Headers keys for this model */
  header(): ColumnHeaders
  /** The display columh headers for this model */
  displayHeader(): ColumnHeaders
  /** Column values for the entire row to write to the GSheet */
  values(): SheetValues
  /** Prepare the row for saving */
  prepare(): IRowModel
  /** Returns undefined if no errors, or the error messages */
  validate(): RowValidationErrors | undefined
  /** Convert a cell to the right type */
  typeCast(key: string, value: any): any
  /** Converts instance to plain javascript object */
  toObject(): object
  /** Converts from plain javascript object to class instance */
  fromObject(obj: object): IRowModel
}

export class RowModel<T extends IRowModel> implements IRowModel {
  _row = 0
  _id = ''
  _updated: Date = noDate

  constructor(values?: any) {
    if (values && Object.keys(values).length > 0) {
      if (values.row) this._row = values.row
      if (values.id) this._id = values.id
      if (values.updated)
        this._updated = this.typeCast('updated', values.updated)
    }
  }

  keys(): ColumnHeaders {
    return Object.keys(this)
  }

  header(): ColumnHeaders {
    // remove `row`
    return this.keys()
      .slice(1)
      .filter((v) => !v.startsWith('$'))
  }

  displayHeader(): ColumnHeaders {
    // remove `row`
    return this.header().filter((v) => !v.startsWith('_'))
  }

  prepare(): T {
    if (!this._id) {
      // Generate id if not assigned
      this._id = uuidv4()
    }
    /** Always update the "updated" value before saving */
    this._updated = new Date()
    return (this as unknown) as T
  }

  values() {
    const result: SheetValues = []
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
    // if (this[key] instanceof DelimArray) {
    if (Array.isArray(this[key])) {
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
          this[key] = this.typeCast(key, val)
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

  /** default to no errors */
  validate(): RowValidationErrors | undefined {
    return undefined
  }

  toObject(): object {
    return { ...this }
  }

  fromObject(obj: object): IRowModel {
    return this.assign(obj)
  }
}

// TODO figure out the Typescript magic for this to work
export type RowModelFactory<T extends IRowModel> = { new (values?: any): T }

// export const RowModelCreator: RowModelFactory<IRowModel> = (values?: any) =>
//   new RowModel(values)
