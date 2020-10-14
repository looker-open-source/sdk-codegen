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
  Hackathon,
  Hackathons,
  Project,
  Projects,
} from '../../hackathon/src/models'
import { ISheet, SheetSDK } from './SheetSDK'
import { initSheetSDK } from './testUtils/testUtils'
import { nilCell, noDate } from './RowModel'

const rawJson = `
{
  "projects": {
    "header": [
      "_id",
      "_updated",
      "_user_id",
      "_hackathon_id",
      "title",
      "description",
      "date_created",
      "project_type",
      "contestant",
      "locked",
      "technologies"
    ],
    "rows": [
      {
        "_row": 2,
        "_id": "a",
        "_user_id": "1",
        "_hackathon_id": "a",
        "title": "cool project",
        "description": "a description of some project",
        "date_created": "2020-03-05T15:00:00+00:00",
        "project_type": "Invite Only",
        "contestant": "FALSE",
        "locked": "FALSE",
        "technologies": "t1,t2,t3"
      },
      {
        "_row": 3,
        "_id": "b",
        "_user_id": "2",
        "_hackathon_id": "b",
        "title": "another project",
        "description": "the second project",
        "date_created": "2020-03-05T15:00:00.000000+00:00",
        "project_type": "Open",
        "contestant": "TRUE",
        "locked": "FALSE",
        "technologies": "t1,t2,t3"
      },
      {
        "_row": 4,
        "_id": "c",
        "_user_id": "3",
        "_hackathon_id": "c",
        "title": "HackWeek 2020",
        "description": "Just a third project",
        "date_created": "2020-03-05T15:00:00.000000+00:00",
        "project_type": "Closed",
        "contestant": "TRUE",
        "locked": "FALSE",
        "technologies": "t4,t5"
      }
    ]
  },
  "hackathons":{
    "header": [
      "_id",
      "_updated",
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
        "_row": 2,
        "_id": "JOIN_2019",
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
        "_row": 3,
        "_id": "NYC_2020",
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
  }
}`

const data = JSON.parse(rawJson)
const hackathonTable = data.hackathons
const projectTable = data.projects

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

let sheets: SheetSDK
let hackathons: Hackathons
let projects: Projects

describe('WhollySheet', () => {
  beforeAll(async () => {
    sheets = await initSheetSDK()
  })
  describe('with hardcoded data', () => {
    beforeAll(() => {
      hackathons = new Hackathons(sheets, hackathonTable)
      projects = new Projects(sheets, projectTable)
    })
    test('initializes', () => {
      expect(hackathons.rows).toBeDefined()
      expect(hackathons.rows.length).toEqual(hackathonTable.rows.length)
      hackathons.rows.forEach((row) => expect(row._row).toBeGreaterThan(0))
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
        '\u0000',
        'JOIN in SFO',
        'First hackathon!',
        'sfo',
        '2019-11-05T15:00:00.000Z',
        '1',
        '5',
        '2019-11-05T18:00:00.000Z',
        '2019-11-05T19:00:00.000Z',
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
      expect(actual._id).toEqual('JOIN_2019')
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

    test('converts project sheet to typed project', () => {
      expect(projects.rows).toBeDefined()
      expect(projects.rows.length).toEqual(projectTable.rows.length)
      const row = projects.rows[0]
      const values = projects.values(row)
      const actual = new Project(values)
      expect(actual._id).toEqual('a')
      expect(actual._hackathon_id).toEqual('a')
      expect(actual.title).toEqual('cool project')
      expect(actual.description).toEqual('a description of some project')
      expect(actual.project_type).toEqual('Invite Only')
      expect(actual.contestant).toEqual(false)
      expect(actual.locked).toEqual(false)
      expect(actual.technologies.toString()).toEqual('t1,t2,t3')
    })

    test('undefined values are "empty"', () => {
      const someUndefined = [
        'id1',
        '2019-11-05T15:00:00.000Z',
        'name1',
        'desc1',
        'loc1',
        '2019-11-05T15:00:00.000Z',
        5,
        6,
      ]
      const actual = new Hackathon(someUndefined)
      expect(actual._row).toEqual(0)
      expect(actual._id).toEqual(someUndefined[0])
      expect(actual._updated).toEqual(new Date(someUndefined[1]))
      expect(actual.name).toEqual(someUndefined[2])
      expect(actual.description).toEqual(someUndefined[3])
      expect(actual.location).toEqual(someUndefined[4])
      expect(actual.date).toEqual(new Date(someUndefined[5]))
      expect(actual.duration_in_days).toEqual(someUndefined[6])
      expect(actual.max_team_size).toEqual(someUndefined[7])
      expect(actual.judging_starts).toEqual(noDate)
      expect(actual.judging_stops).toEqual(noDate)
      const values = actual.values()
      expect(values[0]).toEqual(someUndefined[0])
      expect(values[1]).toEqual(someUndefined[1])
      expect(values[2]).toEqual(someUndefined[2])
      expect(values[3]).toEqual(someUndefined[3])
      expect(values[4]).toEqual(someUndefined[4])
      expect(values[5]).toEqual(someUndefined[5])
      expect(values[6]).toEqual(someUndefined[6].toString())
      expect(values[7]).toEqual(someUndefined[7].toString())
      expect(values[8]).toEqual(nilCell)
      expect(values[9]).toEqual(nilCell)
    })
    describe('find', () => {
      test('finds by id', () => {
        const rows = hackathons.rows
        expect(rows).toBeDefined()
        rows.forEach((target) => {
          const found = hackathons.find(target._id)
          expect(found).toBeDefined()
          expect(found).toEqual(target)
        })
        const prows = projects.rows
        expect(prows).toBeDefined()
        prows.forEach((target) => {
          const found = projects.find(target._id)
          expect(found).toBeDefined()
          expect(found).toEqual(target)
        })
      })
      test('finds by row', () => {
        const rows = hackathons.rows
        expect(rows).toBeDefined()
        const target = rows[1]
        const found = hackathons.find(target._row)
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

  // jest error handling discussed at https://jestjs.io/docs/en/asynchronous#resolves-rejects
  describe('error checking', () => {
    beforeAll(() => {
      hackathons = new Hackathons(sheets, hackathonTable)
    })
    test('update errors on mismatched update', async () => {
      expect(hackathons.rows).toBeDefined()
      expect(hackathons.rows.length).toBeGreaterThan(0)
      const row = hackathons.rows[0]
      // prepare will update updated
      row.prepare()
      try {
        await hackathons.update(row)
        expect('whoops').toEqual('We should never get here')
      } catch (e) {
        expect(e.message).toMatch(/Row 2 is outdated:/i)
      }
    })
    describe('bad row value', () => {
      test('update needs a non-zero row', async () => {
        expect(hackathons.rows).toBeDefined()
        expect(hackathons.rows.length).toBeGreaterThan(0)
        const row = hackathons.rows[0]
        row._id = 'update_test'
        row._row = 0
        try {
          await hackathons.update(row)
          expect('whoops').toEqual('We should never get here')
        } catch (e) {
          expect(e.message).toMatch(/row must be > 0 to update/i)
        }
      })
      test('create needs a zero row', async () => {
        expect(hackathons.sheets).toBeDefined()
        expect(hackathons.rows).toBeDefined()
        expect(hackathons.rows.length).toBeGreaterThan(0)
        const row = hackathons.rows[0]
        row._id = 'create_test'
        row._row = 2
        await expect(hackathons.create(row)).rejects.toThrow(
          `create needs "${row._id}" row to be < 1, not ${row._row}`
        )
      })
    })
  })
  describe('with a live sheet', () => {
    let doc: ISheet
    beforeAll(async () => {
      doc = await sheets.index()
    })
    test('initializes DelimArray', () => {
      const table = doc.tabs.projects
      expect(table).toBeDefined()
      expect(table.header).toBeDefined()
      expect(table.header.length).toBeGreaterThan(0)
      expect(table.rows).toBeDefined()
      expect(table.rows.length).toBeGreaterThan(0)
      const actual = new Projects(sheets, table)
      expect(actual.header).toBeDefined()
      expect(actual.header).toEqual(table.header)
      expect(actual.rows).toBeDefined()
      expect(actual.rows.length).toEqual(table.rows.length)
    })
    test('initializes from sheet', () => {
      const table = doc.tabs.hackathons
      expect(table).toBeDefined()
      expect(table.header).toBeDefined()
      expect(table.header.length).toBeGreaterThan(0)
      expect(table.rows).toBeDefined()
      expect(table.rows.length).toBeGreaterThan(0)
      const actual = new Hackathons(sheets, table)
      expect(actual.header).toBeDefined()
      expect(actual.header).toEqual(table.header)
      expect(actual.rows).toBeDefined()
      expect(actual.rows.length).toEqual(table.rows.length)
    })
    describe('modifications', () => {
      test('updates a row', async () => {
        const table = doc.tabs.hackathons
        const hackathons = new Hackathons(sheets, table)
        const row = hackathons.rows[0]
        // await expect(hackathons.update(row)).rejects.toThrow()

        const actual = await hackathons.update(row)
        expect(actual).toBeDefined()
      })
      test('creates a row', async () => {
        const table = doc.tabs.hackathons
        const hackathons = new Hackathons(sheets, table)
        const nr = hackathons.nextRow
        const hackathon = new Hackathon()
        hackathon._id = `HACK${nr}`
        hackathon.name = `Hackathon${nr}`
        hackathon.description = `Hackathon description ${nr}`
        hackathon.location = `Here`
        hackathon.date = new Date()
        hackathon.duration_in_days = nr
        hackathon.max_team_size = nr
        hackathon.judging_starts = addDays(hackathon.date, nr)
        hackathon.judging_stops = addDays(hackathon.date, nr + 1)

        const actual = await hackathons.create(hackathon)
        expect(actual).toBeDefined()
        expect(actual._id).toEqual(hackathon._id)
      })
    })
  })
})
