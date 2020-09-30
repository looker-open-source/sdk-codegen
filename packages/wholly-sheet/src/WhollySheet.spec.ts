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

import { ISheet, NIL, noDate } from './SheetSDK'
import { sheets } from './testUtils/testUtils'
import { Hackathon, Hackathons } from './testUtils/models/Hackathons'

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

describe('WhollySheet', () => {
  describe('with hardcoded data', () => {
    const hackathons = new Hackathons(sheets, hackathonTable)
    test('initializes', () => {
      expect(hackathons.rows).toBeDefined()
      expect(hackathons.rows.length).toEqual(hackathonTable.rows.length)
      expect(hackathons.header).toEqual(hackathonTable.header)
      expect(Object.entries(hackathons.index).length).toEqual(
        hackathonTable.rows.length
      )
    })

    test('gets values in order', () => {
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

    test('converts sheet data to typed properties', () => {
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

    test('undefined values are "empty"', () => {
      const someUndefined = [
        'id1',
        'name1',
        'desc1',
        'loc1',
        '2019-11-05T15:00:00.000Z',
        5,
        6,
      ]
      const actual = new Hackathon(someUndefined)
      expect(actual.row).toEqual(0)
      expect(actual.id).toEqual(someUndefined[0])
      expect(actual.name).toEqual(someUndefined[1])
      expect(actual.description).toEqual(someUndefined[2])
      expect(actual.location).toEqual(someUndefined[3])
      expect(actual.date).toEqual(new Date(someUndefined[4]))
      expect(actual.duration_in_days).toEqual(someUndefined[5])
      expect(actual.max_team_size).toEqual(someUndefined[6])
      expect(actual.judging_starts).toEqual(noDate)
      expect(actual.judging_stops).toEqual(noDate)
      const values = actual.values()
      expect(values[0]).toEqual(someUndefined[0])
      expect(values[1]).toEqual(someUndefined[1])
      expect(values[2]).toEqual(someUndefined[2])
      expect(values[3]).toEqual(someUndefined[3])
      expect(values[4]).toEqual(someUndefined[4])
      expect(values[5]).toEqual('5')
      expect(values[6]).toEqual('6')
      expect(values[7]).toEqual(NIL)
      expect(values[8]).toEqual(NIL)
    })
    describe('find', () => {
      test('finds by id', () => {
        const rows = hackathons.rows
        expect(rows).toBeDefined()
        const target = rows[0]
        const found = hackathons.find(target.id)
        expect(found).toBeDefined()
        expect(found).toEqual(target)
      })
      test('finds by row', () => {
        const rows = hackathons.rows
        expect(rows).toBeDefined()
        const target = rows[1]
        const found = hackathons.find(target.row)
        expect(found).toBeDefined()
        expect(found).toEqual(target)
      })
      test('finds by search', () => {
        const rows = hackathons.rows
        expect(rows).toBeDefined()
        const target = rows[1]
        const found = hackathons.find(target.name, 'name')
        expect(found).toBeDefined()
        expect(found).toEqual(target)
      })
    })
  })

  describe('error checking', () => {
    const hackathons = new Hackathons(sheets, hackathonTable)
    describe('empty id', () => {
      // jest error handling discussed at https://jestjs.io/docs/en/asynchronous#resolves-rejects
      test('save errors', async () => {
        expect(hackathons.rows).toBeDefined()
        expect(hackathons.rows.length).toBeGreaterThan(0)
        const row = hackathons.rows[0]
        row.id = ''
        await expect(hackathons.save(row)).rejects.toThrow(
          `"id" must be assigned for row ${row.row}`
        )
      })
      test('update errors', async () => {
        expect(hackathons.rows).toBeDefined()
        expect(hackathons.rows.length).toBeGreaterThan(0)
        const row = hackathons.rows[0]
        row.id = ''
        await expect(hackathons.update(row)).rejects.toThrow(
          `"id" must be assigned for row ${row.row}`
        )
      })
      test('create errors', async () => {
        expect(hackathons.rows).toBeDefined()
        expect(hackathons.rows.length).toBeGreaterThan(0)
        const row = hackathons.rows[0]
        row.row = 0
        row.id = ''
        await expect(hackathons.create(row)).rejects.toThrow(
          `"id" must be assigned for row ${row.row}`
        )
      })
    })
    describe('bad row value', () => {
      test('update needs a non-zero row', async () => {
        expect(hackathons.rows).toBeDefined()
        expect(hackathons.rows.length).toBeGreaterThan(0)
        const row = hackathons.rows[0]
        row.id = 'update_test'
        row.row = 0
        try {
          await hackathons.update(row)
        } catch (e) {
          expect(e.message).toMatch(`"${row.id}" row must be > 0 to update`)
        }
      })
      test('create needs a zero row', async () => {
        expect(hackathons.rows).toBeDefined()
        expect(hackathons.rows.length).toBeGreaterThan(0)
        const row = hackathons.rows[0]
        row.id = 'create_test'
        row.row = 2
        try {
          await hackathons.create(row)
        } catch (e) {
          expect(e.message).toMatch(
            `"${row.id}" row must be 0, not ${row.row} to create`
          )
        }
      })
    })
  })
  describe('with a live sheet', () => {
    let doc: ISheet
    beforeAll(async () => {
      doc = await sheets.index()
    })
    test('initializes from sheet', async () => {
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
    test('updates a row', async () => {
      const table = doc.tabs.hackathons
      const hackathons = new Hackathons(sheets, table)
      const row = hackathons.rows[0]
      const actual = await hackathons.update(row)
      expect(actual).toBeDefined()
    })
  })
})
