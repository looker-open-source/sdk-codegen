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

import { IAuthSession } from '@looker/sdk-rtl'
import { addMinutes, IRowModel, noDate, stringer } from './RowModel'
import { WhollySheet } from './WhollySheet'
import { TestRow, testRowObject } from './RowModel.spec'
import { ITabTable, SheetSDK } from './SheetSDK'

export class TestSheet extends WhollySheet<TestRow> {
  typeRow<T extends IRowModel>(values?: any): T {
    return (new TestRow(values) as unknown) as T
  }
}

const testRow = new TestRow(testRowObject)
const testRow2Object = {
  _row: 3,
  _id: '4',
  _updated: new Date(),
  name: 'row 2',
  toggle: false,
  score: 10,
  average: 5.1,
  strArray: ['c', 'd'],
}

const testRow2 = new TestRow(testRow2Object)

const testTable: ITabTable = {
  header: testRow.header(),
  rows: [testRow, testRow2],
}

const emptyTable: ITabTable = {
  header: testRow.header(),
  rows: [],
}

const testSDK = new SheetSDK({ settings: {} } as IAuthSession, 'test sheet id')
const sheet = new TestSheet(testSDK, 'test', testTable)

describe('WhollySheet', () => {
  test('gets values in order', () => {
    const row = sheet.rows[0]
    const expected = [
      stringer(testRow._id),
      stringer(testRow._updated),
      stringer(testRow.name),
      stringer(testRow.toggle),
      stringer(testRow.score),
      stringer(testRow.average),
      stringer(testRow.strArray),
    ]

    const actual = sheet.values(row)
    expect(actual).toEqual(expected)
  })

  test('converts sheet data to typed properties', () => {
    const row = sheet.rows[0]
    row.$notheader = 'not a header column'
    const values = sheet.values(row)
    const actual = new TestRow(values)
    expect(actual._id).toEqual(row._id)
    expect(actual._updated).toEqual(row._updated)
    expect(actual.toggle).toEqual(row.toggle)
    expect(actual.score).toEqual(row.score)
    expect(actual.average).toEqual(row.average)
    expect(actual.strArray).toEqual(row.strArray)
    expect(actual.$notheader).toEqual('')
  })

  test('undefined values are "empty"', () => {
    const undefValues: any[] = []
    const actual = new TestRow(undefValues)
    expect(actual._row).toEqual(0)
    expect(actual._id).toEqual('')
    expect(actual._updated).toEqual(noDate)
    expect(actual.toggle).toEqual(false)
    expect(actual.score).toEqual(0)
    expect(actual.average).toEqual(0.0)
    expect(actual.strArray).toEqual([])
    // const values = actual.values()
    // expect(values[0]).toEqual(someUndefined[0])
    // expect(values[1]).toEqual(someUndefined[1])
    // expect(values[2]).toEqual(someUndefined[2])
    // expect(values[3]).toEqual(someUndefined[3])
    // expect(values[4]).toEqual(someUndefined[4])
    // expect(values[5]).toEqual(someUndefined[5])
    // expect(values[6]).toEqual(someUndefined[6].toString())
    // expect(values[7]).toEqual(someUndefined[7].toString())
    // expect(values[8]).toEqual(nilCell)
    // expect(values[9]).toEqual(nilCell)
  })
  describe('find', () => {
    test('finds by id', () => {
      const rows = sheet.rows
      expect(rows).toBeDefined()
      rows.forEach((target) => {
        const found = sheet.find(target._id)
        expect(found).toBeDefined()
        expect(found).toEqual(target)
      })
    })
    test('finds by row', () => {
      const rows = sheet.rows
      expect(rows).toBeDefined()
      const target = rows[1]
      const found = sheet.find(target._row)
      expect(found).toBeDefined()
      expect(found).toEqual(target)
    })
    test('finds by search', () => {
      const rows = sheet.rows
      expect(rows).toBeDefined()
      const target = rows[1]
      const found = sheet.find(target.name, 'name')
      expect(found).toBeDefined()
      expect(found).toEqual(target)
    })
  })

  describe('object conversion', () => {
    test('fromObject and toObject', () => {
      const obj = sheet.toObject()
      const sheet2 = new TestSheet(testSDK, 'test2', emptyTable)
      const rows2 = sheet2.fromObject(obj)
      expect(rows2).toEqual(sheet.rows)
    })
  })

  // jest error handling discussed at https://jestjs.io/docs/en/asynchronous#resolves-rejects
  describe('error checking', () => {
    test('update errors on mismatched update', async () => {
      expect(sheet.rows).toBeDefined()
      expect(sheet.rows.length).toBeGreaterThan(0)
      const row = sheet.rows[0]
      const mockVals = sheet.values(row)
      // _id = 0, _updated = 1
      mockVals[1] = stringer(addMinutes(row._updated, 1))
      jest.spyOn(testSDK, 'rowGet').mockReturnValue(Promise.resolve(mockVals))
      // prepare will update updated
      row.prepare()
      try {
        await sheet.update(row)
        expect('whoops').toEqual('We should never get here')
      } catch (e) {
        expect(e.message).toMatch(/Row 2 is outdated:/i)
      }
    })
    describe('bad row value', () => {
      test('update needs a non-zero row', async () => {
        expect(sheet.rows).toBeDefined()
        expect(sheet.rows.length).toBeGreaterThan(0)
        const row = sheet.rows[0]
        row._id = 'update_test'
        row._row = 0
        try {
          await sheet.update(row)
          expect('whoops').toEqual('We should never get here')
        } catch (e) {
          expect(e.message).toMatch(/row must be > 0 to update/i)
        }
      })
      test('create needs a zero row', async () => {
        expect(sheet.sheets).toBeDefined()
        expect(sheet.rows).toBeDefined()
        expect(sheet.rows.length).toBeGreaterThan(0)
        const row = sheet.rows[0]
        row._id = 'create_test'
        row._row = 2
        await expect(sheet.create(row)).rejects.toThrow(
          `create needs "${row._id}" row to be < 1, not ${row._row}`
        )
      })
    })
  })
})
