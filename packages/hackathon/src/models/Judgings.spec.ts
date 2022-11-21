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
// import type { ISheet, SheetSDK } from '@looker/wholly-sheet'
// import { initSheetSDK } from '../../../wholly-sheet/src/testUtils/testUtils'
import {
  mockAdmin,
  mockJudge,
  mockJudging,
  mockStaff,
  mockUser,
  wait2Mins,
} from '../test-data'
import type { SheetData } from './SheetData'
// import { initActiveSheet } from './SheetData'

// let sheetSDK: SheetSDK
// let doc: ISheet
let data: SheetData

describe.skip('Judgings', () => {
  beforeAll(async () => {
    // sheetSDK = await initSheetSDK()
    // doc = await sheetSDK.index()
    // data = initActiveSheet(sheetSDK, doc)
  })
  describe('Permissions', () => {
    test('user cannot judge', () => {
      const hacker = mockUser
      const actual = mockJudging(hacker.id)
      expect(actual.canUpdate(hacker)).toEqual(false)
      expect(actual.canDelete(hacker)).toEqual(false)
      expect(actual.canCreate(hacker)).toEqual(false)
    })
    test('staff cannot judge', () => {
      const hacker = mockStaff
      const actual = mockJudging(hacker.id)
      expect(actual.canUpdate(hacker)).toEqual(false)
      expect(actual.canDelete(hacker)).toEqual(false)
      expect(actual.canCreate(hacker)).toEqual(false)
    })
    test("judge cannot judge someone else's assignment", () => {
      const hacker = mockJudge
      const actual = mockJudging(mockUser.id)
      expect(actual.canUpdate(hacker)).toEqual(false)
      expect(actual.canDelete(hacker)).toEqual(false)
      expect(actual.canCreate(hacker)).toEqual(false)
    })
    test('judge can judge their own assignment', () => {
      const hacker = mockJudge
      const actual = mockJudging(hacker.id)
      expect(actual.canUpdate(hacker)).toEqual(true)
      expect(actual.canDelete(hacker)).toEqual(true)
      expect(actual.canCreate(hacker)).toEqual(true)
    })
    test('admin can judge anything', () => {
      const hacker = mockAdmin
      const actual = mockJudging(mockJudge.id)
      expect(actual.canUpdate(hacker)).toEqual(true)
      expect(actual.canDelete(hacker)).toEqual(true)
      expect(actual.canCreate(hacker)).toEqual(true)
    })
  })
  describe('prepare', () => {
    test('it shoots, it scores!', () => {
      const actual = mockJudging(mockJudge.id)
      expect(actual.score).toEqual(1)
      actual.prepare()
      expect(actual.score).toEqual(5)
    })
  })
  describe('CRUD', () => {
    test('related properties are also loaded', () => {
      expect(data.judgings.rows.length).toBeGreaterThan(0)
      const actual = data.judgings.rows[0]
      expect(actual.$title).toBeDefined()
      expect(actual.$judge_name).toBeDefined()
      expect(actual.$description).toBeDefined()
    })
    test('can refresh the tab', async () => {
      expect(data.judgings.keyColumn).toEqual('_id')
      const expected = data.judgings.rows
      await data.judgings.refresh()
      expect(data.judgings.rows).toEqual(expected)
    })
    test(
      'can update a row',
      async () => {
        const rows = data.judgings.rows
        expect(rows).toBeDefined()
        expect(rows.length).toBeGreaterThan(0)
        const j = rows[Math.max(rows.length - 2, 0)]
        const impact = j.impact
        // Make sure the score is calculated
        let actual = await data.judgings.save(j)
        expect(actual.impact).toEqual(impact)
        const delta = 100
        actual.impact = impact + delta
        actual = await data.judgings.save(actual)
        expect(actual.impact).toEqual(impact + delta)
        // restore the score
        actual.impact = impact
        actual = await data.judgings.save(actual)
        expect(actual.impact).toEqual(impact)
      },
      wait2Mins
    )
    test(
      'can create a row',
      async () => {
        const judgings = data.judgings
        expect(judgings.rows).toBeDefined()
        const rowCount = judgings.rows.length
        const j = mockJudging(mockJudge.id)
        const actual = await data.judgings.save(j)
        expect(actual.user_id).toEqual(j.user_id)
        expect(actual.project_id).toEqual(j.project_id)
        expect(judgings.rows.length).toEqual(rowCount + 1)
        const found = judgings.find(actual._id)
        expect(found).toBeDefined()
        expect(found?._id).toEqual(actual._id)
      },
      wait2Mins
    )
    test(
      'can delete a row',
      async () => {
        const judgings = data.judgings
        const j = mockJudging(mockJudge.id)
        const rowCount = judgings.rows.length
        const created = await judgings.save(j)
        const actual = await judgings.delete(created)
        expect(actual).toEqual(true)
        expect(judgings.rows.length).toEqual(rowCount)
        expect(judgings.find(created._id)).not.toBeDefined()
      },
      wait2Mins
    )
  })
})
