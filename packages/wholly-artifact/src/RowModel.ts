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

import { v4 as uuidv4 } from 'uuid'
import { boolDefault, LookerSDKError } from '@looker/sdk-rtl'
import omit from 'lodash/omit'
import type { IArtifact, IUpdateArtifact } from '@looker/sdk'
export type SheetValues = any[]

export const noDate = new Date(-8640000000000000)
export const APP_JSON = 'application/json'

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

export enum RowAction {
  None,
  Create,
  Update,
  Delete,
}

/**
 * Includes type-specific properties and base Looker Artifact properties where the JSON
 * data in the artifact value property will be extracted into the type-specific
 * properties of the row model
 */
export interface IRowModelProps extends RowValues {
  /** Row position in sheet for this item. Usually assigned in WhollySheet processing */
  _row: number
  /**
   * Unique ID for this row. This is an alias for the artifact's key.
   * It's assigned to a combination type name:UUID in prepare()
   *
   * TODO remove this property entirely after changing the `_id` refs in the Hackathon app to use `key`
   */
  _id: string
  /**
   * Updated date/time stamp for this row. Always set in prepare().
   * TODO remove this property entirely because the artifact `version` property performs the version locking
   */
  _updated: Date

  /** Batch update action. Defaults to RowAction.None, so the row is not part of the delta */
  $action: RowAction
  /** Looker API key/value store artifact object for managing this row */
  $artifact: Partial<IArtifact>
}

/** Keyed data for a sheet row */
export interface IRowModel extends IRowModelProps {
  /**
   * Assign a value array or object to the typed row
   *
   * @param values an array of values, or an object with matching keys
   */
  assign(values: any): IRowModel

  /** All keys for this object, but overrideable */
  keys(): ColumnHeaders

  /** The sheet Column Headers keys for this model */
  header(): ColumnHeaders

  /** The display column headers for this model */
  displayHeader(): ColumnHeaders

  /** Column values in the correct order to write the entire row to the GSheet */
  values(): SheetValues

  /**
   * Prepare the row for saving. This includes auto-generation of _id and updating _update
   * Override this for error handling, calculations, and other default initializations
   * to avoid persisting bad data values to the sheet
   */
  prepare(): IRowModel

  /** Returns undefined if no errors, or the error messages with keys corresponding to property names */
  validate(): RowValidationErrors | undefined

  /**
   * Convert a cell to the declared type of the keyed property
   * @param key name of property to receive the value
   * @param value any value representation
   */
  typeCast(key: string, value: any): any

  /** Converts instance to plain javascript object */
  toObject(): Record<string, unknown>

  /**
   * Converts from plain javascript object to class instance
   * @param obj to assign to row. Uses properties of the same name
   */
  fromObject(obj: Record<string, unknown>): IRowModel

  /** Converts instance to IArtifact javascript object for storing in a Looker instance
   * the required columns are:
   * - key: unique key identifying this item, automatically managed
   * - value: IRowModel descendant nested properties with values from the `headers` keys
   * - version: version number of the artifact
   * - content_type: for WhollyArtifacts, always "application/json"
   */
  toArtifact(): Partial<IUpdateArtifact>

  /** Converts from IArtifact interface to class instance
   *
   * @param obj to assign to row
   */
  fromArtifact(obj: Partial<IArtifact>): IRowModel

  /** Mark a row for update. Sets the $action and returns true if the row can be marked for updating. Throws error otherwise */
  setUpdate(): boolean

  /** Mark a row for deletion. Sets the $action and returns true if the row can be marked for deleting. Throws error otherwise */
  setDelete(): boolean

  /** Mark a row for creation. Sets the $action and returns true if the row can be marked for creating. Throws error otherwise */
  setCreate(): boolean

  /** True if this item has NOT been saved to the artifact store. False otherwise */
  isNew(): boolean

  /** True if this item HAS been saved to the artifact store. False otherwise */
  isStored(): boolean

  /** Namespace of artifact storage bucket to use for this collection  */
  namespace(): string

  /** Prefix (table name, basically) to use for artifact key generation */
  prefix(): string
}

export abstract class RowModel<T extends IRowModel> implements IRowModel {
  _row = 0
  _id = ''
  _updated: Date = noDate

  $artifact: Partial<IArtifact> = {
    version: 0,
    created_by_userid: '',
    updated_by_userid: '',
  }

  constructor(values?: any) {
    this.initValues(values)
    if (!this.key) {
      this.key = this.makey()
      this.$_action = RowAction.Create
    }
  }

  isNew() {
    return this.$artifact.version < 1
  }

  isStored() {
    return !this.isNew()
  }

  private $_action: RowAction = RowAction.None

  private static hide = new Set(['_row'])

  /**
   * initializes values by position, iterating the header keys
   * @param values to initialize
   * @private
   */
  private initFromArray(values?: any) {
    if (Array.isArray(values)) {
      const keys = this.header()
      if (Array.isArray(values)) {
        // Assign by position
        values.forEach((val, index) => {
          if (val !== undefined && val !== null && index < keys.length) {
            const key = keys[index]
            this[key] = this.typeCast(key, val)
          }
        })
      }
      return true
    }
    return false
  }

  /**
   * Initializes values from any of:
   * - an array
   * - a value object
   * - an artifact object
   * @param values to initialize
   * @private
   */
  private initValues(values?: any) {
    if (this.initFromArray(values)) return
    if (typeof values === 'object' && values !== null && values !== undefined) {
      const nested = 'value' in values
      let value = nested ? values.value : values
      if (nested) {
        this.$artifact = values
      }
      if (typeof value === 'string') {
        try {
          value = JSON.parse(value)
        } catch (e: any) {
          if (
            values.$artifact?.content_type?.localeCompare(APP_JSON, 'en', {
              sensitivity: 'base',
            }) === 0
          ) {
            throw new LookerSDKError(`Expected ${APP_JSON} but got ${e}`)
          } else {
            throw new LookerSDKError(e)
          }
        }
      }
      Object.keys(value).forEach((k) => {
        this[k] = this.typeCast(k, value[k])
      })
      if (values.key) this.key = values.key
      return true
    }
    return false
  }

  /**
   * RowModel prefix to use for generating new key values. For example, a prefix() that returns `Hackathon` would
   * result in a key assignment like `Hackathon:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d`
   *
   * When using artifact collections like data tables, artifact key values are intended to be hidden from the UI.
   * This prefix is purely used for making it feasible to query an artifact collection by its prefix key value
   */
  private prefix() {
    return this.constructor.name
  }

  /** makey makey */
  private makey() {
    return `${this.prefix()}:${uuidv4()}`
  }

  get key() {
    return this._id
  }

  set key(value) {
    this._id = value
  }

  private oops(message: string) {
    throw new LookerSDKError(`${this.key}: ${message}`)
  }

  get $action(): RowAction {
    if (this.$_action === RowAction.None && this.isNew())
      return RowAction.Create
    return this.$_action
  }

  set $action(value: RowAction) {
    switch (value) {
      case RowAction.Create: {
        if (this.isStored()) this.oops(`can't create an existing item`)
        break
      }
      case RowAction.Delete: {
        if (this.isNew()) {
          this.oops(`can't delete a new item`)
        }
        break
      }
      case RowAction.Update: {
        if (this.isNew()) {
          this.oops(`can't update a new item`)
        }
        break
      }
      case RowAction.None: {
        if (this.isNew()) {
          this.oops(`Action must be assigned for a new item`)
        }
        break
      }
    }
    this.$_action = value
  }

  setCreate(): boolean {
    this.$action = RowAction.Create
    return true
  }

  setUpdate(): boolean {
    this.$action = RowAction.Update
    return true
  }

  setDelete(): boolean {
    this.$action = RowAction.Delete
    return true
  }

  keys(): ColumnHeaders {
    return Object.keys(this)
  }

  header(): ColumnHeaders {
    const keys = this.keys()
    const result = keys.filter(
      (v) => !(v.startsWith('$') || RowModel.hide.has(v))
    )
    return result
  }

  displayHeader(): ColumnHeaders {
    return this.header().filter(
      (v) => !(v.startsWith('_') || RowModel.hide.has(v))
    )
  }

  prepare(): T {
    if (!this.key) {
      // Generate id if not assigned
      this.key = this.makey()
      this.$action = RowAction.Create
    }
    /** Always update the "updated" value before saving */
    this._updated = new Date()
    return this as unknown as T
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
    if (value === undefined || value === null) value = ''
    const type = typeof this[key]
    const fromType = typeof value
    if (type === fromType) {
      // No conversion required
      return value
    }
    if (type === 'string') {
      return value.toString()
    }
    if (type === 'number') {
      if (value === '') return 0
      const isInt = /^([+-]?[1-9]\d*|0)$/
      if (value.toString().match(isInt)) {
        return parseInt(value, 10)
      }
      return parseFloat(value)
    }
    if (type === 'boolean') {
      return boolDefault(value, false)
    }
    if (this[key] instanceof Date) {
      if (value) return new Date(value)
      return noDate
    }
    if (Array.isArray(this[key])) {
      if (!value) return []
      return value.toString().split(',')
    }
    return value
  }

  assign(values: any): T {
    if (values) {
      this.initValues(values)
    }
    return this as unknown as T
  }

  /** default to no errors */
  validate(): RowValidationErrors | undefined {
    return undefined
  }

  toObject(): Record<string, unknown> {
    return omit({ ...this }, ['$_action'])
  }

  fromObject(obj: Record<string, unknown>): IRowModel {
    return this.assign(obj)
  }

  fromArtifact(obj: Partial<IArtifact>): IRowModel {
    return this.assign(obj)
  }

  /**
   * Values to store in attribute
   * @private
   */
  private storageValues() {
    const result = {}
    const keys = this.displayHeader()
    for (const key of keys) {
      result[key] = this[key]
    }
    return result
  }

  toArtifact(): Partial<IUpdateArtifact> {
    return {
      key: this.key,
      value: JSON.stringify(this.storageValues()),
      version: this.$artifact.version ?? 0,
      content_type: APP_JSON,
    } as Partial<IArtifact>
  }

  abstract namespace(): string
}

// TODO figure out the TypeScript magic for this to work
export type RowModelFactory<T extends IRowModel> = { new (values?: any): T }

// export const RowModelCreator: RowModelFactory<IRowModel> = (values?: any) =>
//   new RowModel(values)
