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
  IRowModel,
  ITabTable,
  RowModel,
  SheetSDK,
  SheetValues,
  WhollySheet,
} from '@looker/wholly-sheet'
import { ISheetRow } from './SheetRow'

/** IMPORTANT: properties must be declared in the tab sheet's columnar order, not sorted order */
export interface IJudging extends ISheetRow {
  user_id: string
  project_id: string
  execution: number
  ambition: number
  coolness: number
  impact: number
  score: number
  notes: string
}

/** IMPORTANT: properties must be declared in the tab sheet's columnar order, not sorted order */
export class Judging extends RowModel<IJudging> {
  user_id = ''
  project_id = ''
  execution = 0
  ambition = 0
  coolness = 0
  impact = 0
  score = 0
  notes = ''
  constructor(values?: any) {
    super()
    // IMPORTANT: this must be done after super() constructor is called so keys are established
    // there may be a way to overload the constructor so this isn't necessary but pattern hasn't been found
    this.assign(values)
  }
}

export class Judgings extends WhollySheet<IJudging> {
  constructor(
    public readonly sheets: SheetSDK,
    public readonly table: ITabTable
  ) {
    super(sheets, 'judgings', table, 'id')
  }

  typeRows<T extends IRowModel>(rows: SheetValues): T[] {
    const result: T[] = []

    rows.forEach((r) => {
      const row: T = (new Judging(r) as unknown) as T
      result.push(row)
    })

    return result
  }
}
