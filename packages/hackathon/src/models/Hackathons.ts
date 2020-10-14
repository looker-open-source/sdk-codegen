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

import { ITabTable, noDate, SheetSDK, WhollySheet } from '@looker/wholly-sheet'
import { ISheetRow, SheetRow } from './SheetRow'
import { SheetData } from './SheetData'

/** IMPORTANT: properties must be declared in the tab sheet's columnar order, not sorted order */
export interface IHackathon extends ISheetRow {
  name: string
  description: string
  location: string
  date: Date
  duration_in_days: number
  max_team_size: number
  judging_starts: Date
  judging_stops: Date
}

/** IMPORTANT: properties must be declared in the tab sheet's columnar order, not sorted order */
export class Hackathon extends SheetRow<IHackathon> {
  name = ''
  description = ''
  location = ''
  date: Date = noDate
  duration_in_days = 0
  max_team_size = 0
  judging_starts: Date = noDate
  judging_stops: Date = noDate
  constructor(values?: any) {
    super()
    // IMPORTANT: this must be done after super() constructor is called so keys are established
    // there may be a way to overload the constructor so this isn't necessary but pattern hasn't been found
    this.assign(values)
  }
}

export class Hackathons extends WhollySheet<Hackathon> {
  constructor(
    public readonly data: SheetData,
    public readonly table: ITabTable
  ) {
    super(data.sheetSDK ? data.sheetSDK : ({} as SheetSDK), 'hackathons', table)
  }

  typeRow<Hackathon>(values?: any) {
    return (new Hackathon(values) as unknown) as Hackathon
  }
}
