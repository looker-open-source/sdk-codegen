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

import { IRowModel, ITabTable, noDate, RowModel, SheetSDK } from './SheetSDK'
import { WhollySheet } from './WhollySheet'
import { sheets } from './testUtils/testUtils'

const hackJson = `{
  "header": [
    "id",
    "name",
    "description",
    "location",
    "date",
    "duration_in_days",
    "max_team_size",
    "judging_starts",
    "judging_stops"
  ],
  "rows": [
    {
      "row": 2,
      "id": "JOIN_2019",
      "name": "JOIN in SFO",
      "description": "First hackathon!",
      "location": "sfo",
      "date": "2019-11-05T15:00:00.000000+00:00",
      "duration_in_days": "1",
      "max_team_size": "5",
      "judging_starts": "2019-11-05T18:00:00.000000+00:00",
      "judging_stops": "2019-11-05T19:00:00.000000+00:00"
    },
    {
      "row": 3,
      "id": "NYC_2020",
      "name": "NY HACK 2020",
      "description": "First Beast Coast",
      "location": "nyc",
      "date": "2020-11-09T15:00:00.000000+00:00",
      "duration_in_days": "1",
      "max_team_size": "5",
      "judging_starts": "2020-11-09T18:00:00.000000+00:00",
      "judging_stops": "2020-11-09T19:00:00.000000+00:00"
    }
  ]
}`

const hackathonTable = JSON.parse(hackJson)

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
    this.assign(values)
  }
  //
  // // TODO figure out a better way to do this
  // ref(): any {
  //   const mockDate = new Date()
  //   return {
  //     row: 0,
  //     id: '',
  //     name: '',
  //     description: '',
  //     location: '',
  //     date: mockDate,
  //     duration_in_days: 0,
  //     max_team_size: 0,
  //     judging_starts: mockDate,
  //     judging_stops: mockDate,
  //   }
  // }
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
}

describe('WhollySheet', () => {
  describe('with hardcoded data', () => {
    const hackathons = new Hackathons(sheets, hackathonTable)
    it('initializes', () => {
      expect(hackathons.rows).toBeDefined()
      expect(hackathons.rows.length).toEqual(hackathonTable.rows.length)
      expect(hackathons.header).toEqual(hackathonTable.header)
      expect(Object.entries(hackathons.index).length).toEqual(
        hackathonTable.rows.length
      )
    })

    it('gets values in order', () => {
      expect(hackathons.rows).toBeDefined()
      expect(hackathons.rows.length).toEqual(hackathonTable.rows.length)
      const hackathon = hackathons.rows[0]
      const expected = [
        'JOIN_2019',
        'JOIN in SFO',
        'First hackathon!',
        'sfo',
        '2019-11-05T15:00:00.000000+00:00',
        '1',
        '5',
        '2019-11-05T18:00:00.000000+00:00',
        '2019-11-05T19:00:00.000000+00:00',
      ]

      const actual = hackathons.values(hackathon)
      expect(actual).toEqual(expected)
    })

    it('converts sheet data to typed properties', () => {
      expect(hackathons.rows).toBeDefined()
      expect(hackathons.rows.length).toEqual(hackathonTable.rows.length)
      const row = hackathons.rows[0]
      const values = hackathons.values(row)
      const actual = new Hackathon(values)
      expect(actual.id).toEqual('JOIN_2019')
      expect(actual.name).toEqual('JOIN in SFO')
      expect(actual.description).toEqual('First hackathon!')
      expect(actual.location).toEqual('sfo')
      expect(actual.date).toEqual(new Date('2019-11-05T15:00:00.000000+00:00'))
      expect(actual.duration_in_days).toEqual(1)
      expect(actual.max_team_size).toEqual(5)
      expect(actual.judging_starts).toEqual(
        new Date('2019-11-05T18:00:00.000000+00:00')
      )
      expect(actual.judging_stops).toEqual(
        new Date('2019-11-05T19:00:00.000000+00:00')
      )
    })
    describe('find', () => {
      it('finds by id', () => {
        const rows = hackathons.rows
        expect(rows).toBeDefined()
        const target = rows[0]
        const found = hackathons.find(target.id)
        expect(found).toBeDefined()
        expect(found).toEqual(target)
      })
      it('finds by row', () => {
        const rows = hackathons.rows
        expect(rows).toBeDefined()
        const target = rows[1]
        const found = hackathons.find(target.row)
        expect(found).toBeDefined()
        expect(found).toEqual(target)
      })
      it('finds by search', () => {
        const rows = hackathons.rows
        expect(rows).toBeDefined()
        const target = rows[1]
        const found = hackathons.find(target.name, 'name')
        expect(found).toBeDefined()
        expect(found).toEqual(target)
      })
    })
  })

  describe('with a live sheet', () => {
    it('initializes from sheet', async () => {
      const doc = await sheets.index()
      const table = doc.tabs.hackathons
      expect(table).toBeDefined()
      expect(table.header).toBeDefined()
      expect(table.header.length).toBeGreaterThan(0)
      expect(table.rows).toBeDefined()
      expect(table.rows.length).toBeGreaterThan(0)
      const hackathons = new Hackathons(sheets, table)
      expect(hackathons.header).toBeDefined()
      expect(hackathons.header).toEqual(table.header)
      expect(hackathons.rows).toBeDefined()
      expect(hackathons.rows.length).toEqual(table.rows.length)
    })
  })
})
