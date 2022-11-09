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

import path from 'path'
import type { ILooker40SDK } from '@looker/sdk'
import {
  artifact_namespaces,
  environmentPrefix,
  Looker40SDK,
  purge_artifacts,
} from '@looker/sdk'
import { NodeSession, NodeSettingsIniFile } from '@looker/sdk-node'
import cloneDeep from 'lodash/cloneDeep'
import type { IRowModel } from './RowModel'
import { APP_JSON, noDate, stringer } from './RowModel'
import type { ITabTable } from './WhollyArtifact'
import { WhollyArtifact } from './WhollyArtifact'
import type { ITestRowProps } from './RowModel.spec'
import { TestRow, testRowObject } from './RowModel.spec'

const homeToRoost = '../../../'

const rootPath = path.join(__dirname, homeToRoost)
const rootFile = (fileName = '') => path.join(rootPath, fileName)
const settings = new NodeSettingsIniFile(
  environmentPrefix,
  rootFile('looker.ini'),
  'Looker'
)

const session = new NodeSession(settings)
const sdk = new Looker40SDK(session)

export class TestSheet extends WhollyArtifact<TestRow, ITestRowProps> {
  typeRow<T extends IRowModel>(values?: any): T {
    return new TestRow(values) as unknown as T
  }
}

const artiRow = (row: any) => {
  return new TestRow({
    key: `${row._id}`,
    version: 1,
    value: row,
    content_type: APP_JSON,
  })
}

const wait2Mins = 2 * 60 * 1000
const testRow = artiRow(testRowObject)
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

const testRow2 = artiRow(testRow2Object)

const testTable: ITabTable = {
  header: testRow.header(),
  rows: [
    artiRow(testRow),
    artiRow(testRow2),
    artiRow({ _row: 4, _id: '5', _updated: new Date(), name: 'row 4' }),
    artiRow({ _row: 5, _id: '6', _updated: new Date(), name: 'row 5' }),
    artiRow({ _row: 6, _id: '7', _updated: new Date(), name: 'row 6' }),
  ],
}

const emptyTable: ITabTable = {
  header: testRow.header(),
  rows: [],
}

const testSDK = {} as ILooker40SDK
const mockSheet = () => new TestSheet(testSDK, testTable)
const keySheet = () => {
  const meta = new TestRow()
  const data = cloneDeep(testTable)
  data.rows.forEach((r) => (r._id = meta.makey()))
  return new TestSheet(testSDK, testTable)
}

let sheet = mockSheet()

describe('WhollyArtifact', () => {
  beforeEach(() => {
    sheet = mockSheet()
  })
  afterEach(() => {
    jest.clearAllMocks()
  })

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
    expect(actual._id).toMatch(/^TestRow:/)
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
      const sheet2 = new TestSheet(testSDK, emptyTable)
      const rows2 = sheet2.fromObject(obj)
      expect(rows2).toEqual(sheet.rows)
    })
  })

  describe('batch updates', () => {
    describe('getDelta', () => {
      test('No delta for no changes', () => {
        const delta = sheet.getDelta()
        expect(delta.updates).toHaveLength(0)
        expect(delta.deletes).toHaveLength(0)
        expect(delta.creates).toHaveLength(0)
      })
      test('Deletions are in descending row order', () => {
        const a = sheet.rows[0]
        const b = sheet.rows[3]
        a.setDelete()
        b.setDelete()
        const delta = sheet.getDelta()
        expect(delta.updates).toHaveLength(0)
        expect(delta.deletes).toHaveLength(2)
        expect(delta.creates).toHaveLength(0)
        expect(delta.deletes[0]).toEqual(b)
        expect(delta.deletes[1]).toEqual(a)
      })
      test('Updates are in original order', () => {
        const a = sheet.rows[0]
        const b = sheet.rows[3]
        a.setUpdate()
        b.setUpdate()
        const delta = sheet.getDelta()
        expect(delta.updates).toHaveLength(2)
        expect(delta.deletes).toHaveLength(0)
        expect(delta.creates).toHaveLength(0)
        expect(delta.updates[0]).toEqual(a)
        expect(delta.updates[1]).toEqual(b)
      })
      test('Creates are in original order', () => {
        const a = new TestRow({ _id: 'create1' })
        const b = new TestRow({ _id: 'create2' })
        a.setCreate()
        b.setCreate()
        sheet.rows.push(a, b)
        const delta = sheet.getDelta()
        expect(delta.updates).toHaveLength(0)
        expect(delta.deletes).toHaveLength(0)
        expect(delta.creates).toHaveLength(2)
        expect(delta.creates[0]).toEqual(a)
        expect(delta.creates[1]).toEqual(b)
      })
    })

    test('allValues', () => {
      const values = sheet.allValues()
      expect(values).toHaveLength(sheet.rows.length + 1)
      expect(values[0]).toEqual(sheet.header)
      values.splice(0, 1) // remove header row
      values.forEach((r, index) => expect(r[0]).toEqual(sheet.rows[index]._id))
    })

    describe('mergePurge', () => {
      test('updates updates', () => {
        const rows = sheet.rows
        const tab = sheet.allValues()
        expect(tab).toHaveLength(rows.length + 1)
        const a = rows[0]
        const b = rows[3]
        a._id = 'a'
        b._id = 'b'
        a.setUpdate()
        b.setUpdate()
        const delta = sheet.getDelta()
        expect(delta.updates).toHaveLength(2)
        const actual = sheet.mergePurge(tab, delta)
        actual.splice(0, 1) // remove header row
        expect(actual).toHaveLength(rows.length)
        expect(actual[a._row - 2][0]).toEqual(a._id)
        expect(actual[b._row - 2][0]).toEqual(b._id)
      })
      test('deletes deletes', () => {
        const rows = sheet.rows
        const tab = sheet.allValues()
        expect(tab).toHaveLength(rows.length + 1)
        const a = rows[0]
        const b = rows[3]
        a.setDelete()
        b.setDelete()
        const delta = sheet.getDelta()
        expect(delta.deletes).toHaveLength(2)
        const actual = sheet.mergePurge(tab, delta)
        actual.splice(0, 1) // remove header row
        expect(actual).toHaveLength(rows.length - 2)
        expect(actual[0][0]).toEqual(rows[1]._id)
        expect(actual[2][0]).toEqual(rows[4]._id)
      })
      test('creates creates', () => {
        const rows = sheet.rows
        const rowCount = rows.length
        const tab = sheet.allValues()
        expect(tab).toHaveLength(rowCount + 1)
        const a = new TestRow({ _id: 'c1' })
        const b = new TestRow({ _id: 'c2' })
        a.setCreate()
        b.setCreate()
        sheet.rows.push(a, b)
        expect(sheet.rows).toHaveLength(rowCount + 2)
        const delta = sheet.getDelta()
        expect(delta.creates).toHaveLength(2)
        const actual = sheet.mergePurge(tab, delta)
        actual.splice(0, 1) // remove header row
        expect(actual).toHaveLength(rowCount + 2)
        expect(actual[actual.length - 2][0]).toEqual(a._id)
        expect(actual[actual.length - 1][0]).toEqual(b._id)
      })
      test('mixed mode blends', () => {
        const rows = sheet.rows
        const rowCount = rows.length
        const tab = sheet.allValues()
        expect(tab).toHaveLength(rowCount + 1)
        const a = new TestRow({ _id: 'c1' })
        const b = new TestRow({ _id: 'c2' })
        const c = rows[0]
        const d = rows[1]
        a.setCreate()
        b.setCreate()
        sheet.rows.push(a, b)
        c.setDelete()
        d._id = 'updatedid'
        d.setUpdate()
        expect(sheet.rows).toHaveLength(rowCount + 2)
        const delta = sheet.getDelta()
        expect(delta.creates).toHaveLength(2)
        expect(delta.deletes).toHaveLength(1)
        expect(delta.updates).toHaveLength(1)
        const tabLength = tab.length
        // Update 1 row, delete 1 row, create 2 rows
        const actual = sheet.mergePurge(tab, delta)
        expect(actual).toHaveLength(tabLength + 1)
        actual.splice(0, 1) // remove header row
        sheet.loadRows(actual)
        expect(sheet.find(a._id)).toBeDefined()
        expect(sheet.find(b._id)).toBeDefined()
        expect(sheet.find(c._id)).not.toBeDefined()
        expect(sheet.find(d._id)).toBeDefined()
      })
    })
  })

  describe('artifact store', () => {
    /**
     * This function only works after purge() is called
     *
     * It updates the rows of the existing `sheet` variable
     *
     * @param data mock test rows to create
     */
    const createData = async (data: TestSheet) => {
      sheet = new TestSheet(sdk, {
        header: testRow.header(),
        rows: data.rows as IRowModel[],
      })
      sheet.rows.forEach((r) => {
        r.$artifact.version = 0
        r.setCreate()
      })
      return await sheet.batchUpdate()
    }

    /**
     * If the test namespace exists, this routine clears it
     */
    const purge = async () => {
      const meta = new TestRow()
      const ns = meta.namespace()
      const spaces = await sdk.ok(artifact_namespaces(sdk, {}))
      const cruft = spaces.find((s) => s.namespace === ns && s.count > 0)
      if (cruft) {
        await sdk.ok(purge_artifacts(sdk, ns))
      }
      sheet.rows = []
      sheet.index = {}
    }

    beforeEach(async () => {
      await purge()
    })

    describe('batches', () => {
      test(
        'creates all rows',
        async () => {
          const data = mockSheet()
          await createData(data)
          expect(sheet.rows).toHaveLength(data.rows.length)
          sheet.rows.forEach((r, index) => {
            expect(r._id).toEqual(data.rows[index]._id)
            expect(r._updated).not.toEqual(noDate)
            expect(r.score).toBeDefined()
          })
        },
        wait2Mins
      )

      test(
        'updates all rows',
        async () => {
          const data = mockSheet()
          await createData(data)
          sheet.rows.forEach((r, index) => {
            r.name = `u ${index}`
            r.setUpdate()
          })
          const response = (await sheet.batchUpdate()) as unknown as TestRow[]
          expect(response).toHaveLength(sheet.rows.length)
          sheet.rows.forEach((r, index) => {
            expect(r.name).toEqual(`u ${index}`)
            expect(response[index].name).toEqual(`u ${index}`)
          })
        },
        wait2Mins
      )

      test(
        'deletes all rows',
        async () => {
          const data = mockSheet()
          await createData(data)
          expect(sheet.rows.length).toBeGreaterThan(0)
          sheet.rows.forEach((r) => r.setDelete())
          const delta = sheet.getDelta()
          expect(delta.deletes).toHaveLength(sheet.rows.length)
          const response = await sheet.batchUpdate()
          expect(response).toHaveLength(0)
          expect(sheet.rows).toHaveLength(0)
        },
        wait2Mins
      )

      test(
        'refreshes all rows',
        async () => {
          const data = keySheet()
          data.rows.forEach((r) => (r.key = r.makey()))
          await createData(data)
          expect(sheet.rows).toHaveLength(data.rows.length)
          sheet.rows.forEach((r, index) => {
            expect(r._id).toEqual(data.rows[index]._id)
            expect(r._updated).not.toEqual(noDate)
            expect(r.score).toBeDefined()
          })
          await sheet.refresh()
          expect(sheet.rows).toHaveLength(data.rows.length)
        },
        wait2Mins
      )
    })

    describe('CRUD', () => {
      test('create', async () => {
        const data = mockSheet()
        await createData(data)
        const row = new TestRow({
          testRow2Object,
          ...{ _id: 'created', name: 'new row' },
        })
        await sheet.create(row)
        expect(sheet.index[row._id]).toBeDefined()
        const actual = sheet.find(row._id)
        expect(actual).toBeDefined()
        if (actual) {
          expect(actual.key).toEqual(row._id)
          expect(actual.name).toEqual('new row')
          expect(actual.$artifact.version).toEqual(1)
        }
      })

      test('read', async () => {
        const data = mockSheet()
        await createData(data)
        const actual = sheet.find('5')
        expect(actual).toBeDefined()
        expect(actual?._id).toEqual('5')
      })

      test('update', async () => {
        const data = mockSheet()
        await createData(data)
        const key = '5'
        const actual = sheet.find(key)
        expect(actual).toBeDefined()
        if (actual) {
          expect(actual._id).toEqual(key)
          const name = `updated ${actual.name}`
          actual.name = name
          await sheet.update(actual)
          const updated = sheet.find(key)
          expect(updated?.name).toEqual(name)
        }
      })

      test('delete', async () => {
        const data = mockSheet()
        await createData(data)
        const key = '5'
        const actual = sheet.find(key)
        expect(actual).toBeDefined()
        if (actual) {
          expect(actual._id).toEqual(key)
          await sheet.delete(actual)
          const updated = sheet.find(key)
          expect(updated).toBeUndefined()
        }
      })
    })
  })
})
