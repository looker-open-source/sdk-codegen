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

import { ISheet, SheetSDK } from '@looker/wholly-sheet'
import { initSheetSDK } from '../../../wholly-sheet/src/testUtils/testUtils'
import { SheetData } from './SheetData'
import { IHacker } from './SheetRow'

let sheetSDK: SheetSDK
let data: ISheet

const mockUser: ISheetUser = {
  id: 'regularJoe',
  roles: new Set<string>(['hacker']),
  permissions: new Set<string>(),
}

const mockStaff: ISheetUser = {
  id: 'regularJoe',
  roles: new Set<string>(['hacker', 'staff']),
  permissions: new Set<string>(),
}

describe('SheetData', () => {
  beforeAll(async () => {
    sheetSDK = await initSheetSDK()
    data = await sheetSDK.index()
  })
  test('loads', async () => {
    const actual = new SheetData(sheetSDK, data)
    expect(actual.hackathons.rows.length).toBeGreaterThan(0)
    expect(actual.judgings.rows.length).toBeGreaterThan(0)
    expect(actual.projects.rows.length).toBeGreaterThan(0)
    expect(actual.projectTechnologies.rows.length).toBeGreaterThan(0)
    expect(actual.registrations.rows.length).toBeGreaterThan(0)
    expect(actual.teamMembers.rows.length).toBeGreaterThan(0)
    expect(actual.technologies.rows.length).toBeGreaterThan(0)
  })
  test('gets current hackathon', () => {
    const sheet = new SheetData(sheetSDK, data)
    const actual = sheet.currentHackathon
    expect(actual).toBeDefined()
    expect(actual?.judging_stops.getTime()).toBeGreaterThan(
      new Date().getTime()
    )
  })
})
