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
  noDate,
  RowModel,
  SheetSDK,
} from '../../SheetSDK'
import { WhollySheet } from '../../WhollySheet'

/** NOTE: Very important that the properties are declared in the tab's columnar order */
interface IHackathon extends IRowModel {
  name: string
  description: string
  location: string
  date: Date
  duration_in_days: number
  max_team_size: number
  judging_starts: Date
  judging_stops: Date
}

/** NOTE: Very important that the properties are declared in the tab's columnar order */
export class Hackathon extends RowModel<IHackathon> {
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

// export const RowHackathonCreator: RowModelFactory<IHackathon> = (values?: any) =>
//   new Hackathon(values)

export class Hackathons extends WhollySheet<IHackathon> {
  constructor(
    public readonly sheets: SheetSDK,
    public readonly table: ITabTable
  ) {
    super(sheets, 'hackathons', table, 'id') //, { new Hackathon(values?: any)})
  }

  typeRows<T extends IRowModel>(rows: any[]): T[] {
    const result: T[] = []

    rows.forEach((r) => {
      const row: T = (new Hackathon(r) as unknown) as T
      result.push(row)
    })

    return result
  }
}
