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

import { LookerSDKError } from '@looker/sdk-rtl'
import type { ILooker40SDK } from '@looker/sdk'
import type { ColumnHeaders, IRowModel, SheetValues } from './RowModel'
import { RowAction, rowPosition, stringer } from './RowModel'

/**
 * Compare dates without running into numeric comparison problems
 * @param a first date to compare
 * @param b second date to compare
 * @returns 0 if dates are equal, positive if a > b, negative if a < b
 */
export const compareDates = (a: Date, b: Date) => a.getTime() - b.getTime()

export interface IMaker<T> {
  new (values?: any): T
}

export interface IRowDelta<T extends IRowModel> {
  updates: T[]
  deletes: T[]
  creates: T[]
}

// TODO maybe get a technique from https://stackoverflow.com/a/34698946 or
//  https://www.logicbig.com/tutorials/misc/typescript/generic-constraints.html

// TODO refactor WhollyArtifact<T> into something a bit cleaner
//   ref https://www.smashingmagazine.com/2020/10/understanding-typescript-generics/
export class TypedRows<T> {
  rows: T[] = []

  constructor(rows: T[], Maker?: IMaker<T>) {
    if (Maker) {
      this.rows = rows.map((v) => new Maker(v))
    } else {
      this.rows = rows
    }
  }

  public add(value: T): void {
    this.rows.push(value)
  }

  public where(predicate: (value: T) => boolean): TypedRows<T> {
    return TypedRows.from<T>(this.rows.filter(predicate))
  }

  public select<U>(selector: (value: T) => U): TypedRows<U> {
    return TypedRows.from<U>(this.rows.map(selector))
  }

  public toArray(): T[] {
    return this.rows
  }

  public static from<U>(values: U[]): TypedRows<U> {
    // Perhaps we perform some logic here.
    // ...

    return new TypedRows<U>(values)
  }

  public static create<U>(values?: U[]): TypedRows<U> {
    return new TypedRows<U>(values ?? [])
  }

  // Other collection functions.
  // ..
}

export interface IWhollyArtifact<T extends IRowModel, P> {
  /** Initialized REST-based GSheets SDK */
  sdk: ILooker40SDK
  /** Namespace prefix of this collection. TODO rename to namespace */
  name: string
  /**
   * Header column names for reading from/writing to the sheet.
   * The order of the column names **must** match the order of the columns in the sheet.
   * The values used to read and write the sheet are always in column order position.
   */
  header: ColumnHeaders
  /** Column names to display */
  displayHeader: ColumnHeaders
  /** Name of the key column that represents the "id" */
  keyColumn: string
  /** All data in the sheet */
  rows: T[]
  /** Keyed row retrieval */
  index: Record<string, T>
  /** What's the next row of the sheet? */
  nextRow: number

  // TODO figure out init generic typing issue
  // init(values?: any): (values?: any) => T

  /**
   * Verify the column order in the sheet matches the key order of the row type
   * @param header array of column names in order
   */
  checkHeader(header: ColumnHeaders): boolean

  /**
   * True if the column name should be displayed in a UI
   *
   * False if it's an "internal" column name
   *
   * @param columnName to check for display
   */
  displayable(columnName: string): boolean

  /**
   * Gets the row's values in table.header column order
   * @param model row to introspect
   */
  values(model: T): SheetValues

  /**
   * Returns a 2D array of all row values based on the current rows collection.
   * The result include the header row
   */
  allValues(): SheetValues

  /**
   * Create a new row of this type
   * @param values either a value array or an object
   */
  typeRow<T extends IRowModel>(values?: any): T

  /**
   * Converts raw rows into typed rows.
   *
   * @param rows array of data to convert. Either value arrays or a collection of objects
   */
  typeRows<T extends IRowModel>(rows: SheetValues): T[]

  /** Reload the entire tab by fetching all its values from the GSheet */
  refresh<T extends IRowModel>(): Promise<T[]>

  /**
   * Save the specified row to the sheet.
   *
   * This routine determines whether to call update or create based on whether the row position is < 1
   *
   * @param model row to save
   * @param force true to skip checking for outdated values. Defaults to false.
   */
  save<T extends IRowModel>(model: T, force?: boolean): Promise<T>

  /**
   * Create a row in the sheet
   *
   * If the row position is > 0 an error is thrown
   *
   * @param model row to create in sheet
   */
  create<T extends IRowModel>(model: T): Promise<T>

  /**
   * Update a row in the sheet
   *
   * If the row position is < 1 an error is thrown
   *
   * If the row is checkOutdated an error is thrown
   *
   * @param model row to create in sheet
   * @param force true to skip checking for outdated values. Defaults to false.
   */
  update<T extends IRowModel>(model: T, force?: boolean): Promise<T>

  /**
   * Reads the specified row directly from the sheet
   * @param row
   */
  rowGet<T extends IRowModel>(row: number): Promise<T | undefined>

  /**
   * Delete a row if it still exists
   * @param model to delete
   * @param force true to skip checking for outdated values. Defaults to false.
   */
  delete<T extends IRowModel>(model: T, force?: boolean): Promise<boolean>

  /**
   * If the row is out of date, it throws a LookerSDKError
   * @param model row for status check
   * @param source row to compare against
   */
  checkOutdated<T extends IRowModel>(model: T, source?: T): Promise<boolean>

  /**
   * Find the matching row. If columnName is the primary key field, indexed retrieval is used
   *
   * @param value to find
   * @param columnName in which to find the value. Defaults to primary key. If primary key, indexed retrieval is use.
   */
  find(value: any, columnName?: string): T | undefined

  /**
   * Reassigns collection rows, checks header, and reindexes
   * @param rows to overwrite current list
   */
  loadRows<T extends IRowModel>(rows: SheetValues): T[]

  /** Converts the row collection to a plain javascript object array */
  toObject(): P[]

  /** Assigns the passed object[] to the rows collection */
  fromObject<T extends IRowModel>(obj: P[]): T[]

  /** Gets the delta rows for a batch update */
  getDelta<T extends IRowModel>(): IRowDelta<T>

  /**
   * Processes a delta change against the tab values snapshot
   * @param tab SheetValues to update (includes header row)
   * @param delta row changes to apply
   */
  mergePurge<T extends IRowModel>(
    tab: SheetValues,
    delta: IRowDelta<T>
  ): SheetValues

  /**
   * Prepare a batch for processing
   *
   * If `force` is false and update rows are outdated, a LookerSDKError with outdated list is thrown
   * @param tab of sheet values to use for update checks (includes header row)
   * @param delta change to merge and purge
   * @param force prepare each row but don't worry about outdated rows
   */
  prepareBatch<T extends IRowModel>(
    tab: SheetValues,
    delta: IRowDelta<T>,
    force?: boolean
  ): boolean

  /**
   * Perform a batch update by retrieving the delta for the sheet, check for outdated update rows,
   * and update the entire tab sheet with the changes
   * @param force true to skip checking for outdated update rows
   */
  batchUpdate<T extends IRowModel>(force?: boolean): Promise<T[]>
}

/**
 * Keyed data for a tab, and the tab's header row
 * TODO delete this bad boy
 */
export interface ITabTable {
  /** Array of header names, in column order */
  header: ColumnHeaders
  /** Parsed data for the tab */
  rows: IRowModel[]
}

/** CRUDS operations for a GSheet tab */
export abstract class WhollyArtifact<T extends IRowModel, P>
  extends TypedRows<T>
  implements IWhollyArtifact<T, P>
{
  index: Record<string, T> = {}

  constructor(
    public readonly sdk: ILooker40SDK,
    /** name of the tab in the GSheet document */
    public readonly name: string,
    public readonly table: ITabTable,
    public readonly keyColumn: string = '_id' // TODO change to `key`
  ) {
    super([])
    this.loadRows(table.rows)
  }

  loadRows<T extends IRowModel>(rows: SheetValues): T[] {
    this.rows = this.typeRows(rows)
    this.checkHeader()
    this.createIndex()
    return this.rows as unknown as T[]
  }

  abstract typeRow<T extends IRowModel>(values?: any): T

  typeRows<T extends IRowModel>(rows: SheetValues): T[] {
    const result: T[] = []
    let pos = 1

    rows.forEach((r) => {
      const row: T = this.typeRow(r)
      pos++
      // fixup row position?
      if (!row[rowPosition]) row[rowPosition] = pos
      result.push(row)
    })

    return result
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
  private static toAT<T extends IRowModel>(value: unknown): T | undefined {
    if (value) return value as T
    return undefined
  }

  checkHeader() {
    // Nothing to check
    if (this.rows.length === 0) return true
    const row = this.rows[0]
    const rowHeader = row.header().join()
    const tableHeader = this.table.header.join()
    if (tableHeader !== rowHeader)
      throw new LookerSDKError(
        `Expected ${this.name} header to be ${rowHeader} not ${tableHeader}`
      )
    return true
  }

  get header() {
    return this.table.header
  }

  get nextRow() {
    // +1 for header row
    // +1 for 1-based rows
    return this.rows.length + 2
  }

  private createIndex() {
    this.index = {}
    this.rows.forEach((r) => {
      this.index[r[this.keyColumn]] = r
    })
  }

  values<T extends IRowModel>(model: T) {
    const result: SheetValues = []
    this.header.forEach((h) => {
      result.push(stringer(model[h]))
    })
    return result
  }

  allValues(): SheetValues {
    const values: SheetValues = [this.header]
    values.push(...this.rows.map((r) => this.values(r)))
    return values
  }

  async save<T extends IRowModel>(model: T, force = false): Promise<T> {
    switch (model.$action) {
      case RowAction.Delete: {
        await this.sdk.ok(
          this.sdk.delete_artifact(this.name, model[this.keyColumn])
        )
        return model
      }
      case RowAction.Update: {
        return await this.update<T>(model, force)
      }
      case RowAction.None: {
        return model
      }
    }
    return (await this.create<T>(model)) as unknown as T
  }

  checkId<T extends IRowModel>(model: T) {
    if (!model[this.keyColumn])
      throw new LookerSDKError(
        `"${this.keyColumn}" must be assigned for ${this.name} row ${model._row}`
      )
  }

  async create<T extends IRowModel>(model: T): Promise<T> {
    if (model._row > 0)
      throw new LookerSDKError(
        `create needs ${this.name} "${
          model[this.keyColumn]
        }" row to be < 1, not ${model._row}`
      )
    model.prepare()
    this.checkId(model)
    const values = this.values(model)
    const result = await this.sdk.rowCreate(this.name, this.nextRow, values)
    if (result.row < 1 || !result.values || result.values.length === 0)
      throw new LookerSDKError(
        `Could not create row for ${model[this.keyColumn]}`
      )
    // This returns an array of values with 1 entry per row value array
    const newRow = this.typeRow(result.values[0])
    newRow._row = result.row
    if (result.row === this.nextRow) {
      // No other rows have been added
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.rows.push(newRow as unknown as T)
      this.createIndex()
    } else {
      await this.refresh()
    }
    return this.index[newRow[this.keyColumn]] as unknown as T
  }

  async update<T extends IRowModel>(model: T, force = false): Promise<T> {
    if (!model._row)
      throw new LookerSDKError(
        `${this.name} "${model[this.keyColumn]}" row must be > 0 to update`
      )

    if (!force) await this.checkOutdated(model)
    let rowPos = -1
    model.prepare()
    this.checkId(model)
    const values = this.values(model)
    /** This will throw an error if the request fails */
    const result = await this.sdk.rowUpdate(this.name, model._row, values)
    if (result.values) {
      // This returns an array of values with 1 entry per row value array
      const updateValues = result.values[0]
      rowPos = this.rows.findIndex((row) => (row._row = model._row))
      this.rows[rowPos].assign(updateValues)
    }
    // ID may have changed?
    this.createIndex()
    return this.rows[rowPos] as unknown as T
  }

  find(value: any, columnName?: string): T | undefined {
    if (!value) return undefined
    let key = columnName || this.keyColumn
    if (typeof value === 'number') {
      // Default key to row
      if (!columnName) key = '_row'
    }
    if (columnName === this.keyColumn) {
      // Find by index
      return WhollyArtifact.toAT(this.index[value.toString()])
    }
    return WhollyArtifact.toAT(this.rows.find((r) => r[key] === value))
  }

  private _displayHeader: ColumnHeaders = []
  get displayHeader(): ColumnHeaders {
    if (this._displayHeader.length === 0) {
      this._displayHeader = this.header.filter((colName) =>
        this.displayable(colName)
      )
    }
    return this._displayHeader
  }

  async delete<T extends IRowModel>(model: T, force = false) {
    if (!force) await this.checkOutdated(model)
    const values = await this.sdk.rowDelete(this.name, model._row)
    this.rows = this.typeRows(values)
    this.createIndex()
    return true
  }

  displayable(columnName: string): boolean {
    return !(columnName.startsWith('_') || columnName.startsWith('$'))
  }

  async rowGet<T extends IRowModel>(row: number): Promise<T | undefined> {
    const values = await this.sdk.rowGet(this.name, row)
    if (!values || values.length === 0) return undefined
    // Returns a nested array of values, 1 top element per row
    const typed = this.typeRow(values[0])
    // ugly hack cheat for type conversion
    return typed as unknown as T
  }

  async checkOutdated<T extends IRowModel>(model: T, source?: T) {
    if (model._row < 1) return false
    const errors: string[] = []
    if (!source) source = await this.rowGet<T>(model._row)
    if (!source) {
      errors.push(`Row not found`)
    } else {
      if (
        source._updated !== undefined &&
        compareDates(source._updated, model._updated) !== 0
      ) {
        errors.push(`update is ${source._updated} not ${model._updated}`)
      }
      if (source[this.keyColumn] !== model[this.keyColumn])
        errors.push(
          `${this.keyColumn} is "${source[this.keyColumn]}" not "${
            model[this.keyColumn]
          }"`
        )
    }
    if (errors.length > 0)
      throw new LookerSDKError(
        `${this.name} row ${model._row} is outdated: ${errors.join()}`
      )
    return false
  }

  async refresh<T extends IRowModel>(): Promise<T[]> {
    let values = await this.sdk.tabValues(this.name)
    // trim header row
    values = values.slice(1)
    const rows = this.typeRows(values) as unknown as T[]
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.rows = rows
    this.createIndex()
    return rows
  }

  fromObject<T extends IRowModel>(obj: P[]): T[] {
    this.loadRows(obj)
    return this.rows as unknown as T[]
  }

  toObject(): P[] {
    return this.rows.map((r) => r.toObject() as unknown as P)
  }

  async batchUpdate<T extends IRowModel>(force = false): Promise<T[]> {
    const delta = this.getDelta()
    let values = await this.sdk.tabValues(this.name)
    this.prepareBatch(values, delta, force)
    values = this.mergePurge(values, delta)
    const response = await this.sdk.batchUpdate(this.name, values)
    return this.loadRows(response)
  }

  getDelta<T extends IRowModel>(): IRowDelta<T> {
    const updates = this.rows.filter((r) => r.$action === RowAction.Update)
    // Sort deletions in descending row order
    const deletes = this.rows
      .filter((r) => r.$action === RowAction.Delete)
      .sort((a, b) => b._row - a._row)
    const creates = this.rows.filter((r) => r.$action === RowAction.Create)

    return {
      updates: updates as unknown as T[],
      deletes: deletes as unknown as T[],
      creates: creates as unknown as T[],
    }
  }

  mergePurge<T extends IRowModel>(
    values: SheetValues,
    delta: IRowDelta<T>
  ): SheetValues {
    delta.updates.forEach((u) => (values[u._row - 1] = this.values(u)))
    delta.deletes.forEach((d) => values.splice(d._row - 1, 1))
    delta.creates.forEach((c) => values.push(this.values(c)))
    return values
  }

  prepareBatch<T extends IRowModel>(
    values: SheetValues,
    delta: IRowDelta<T>,
    force?: boolean
  ): boolean {
    if (!force) {
      const errors = []
      try {
        delta.updates.forEach((u) =>
          this.checkOutdated(u, this.typeRow(values[u._row - 1]))
        )
        delta.deletes.forEach((d) =>
          this.checkOutdated(d, this.typeRow(values[d._row - 1]))
        )
      } catch (e: any) {
        errors.push(e.message)
      }
      if (errors.length > 0) throw new LookerSDKError(errors.join('\n'))
    }
    delta.updates.forEach((u) => u.prepare())
    delta.creates.forEach((c) => c.prepare())
    return true
  }
}
