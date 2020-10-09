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
import { Looker40SDK } from '@looker/sdk'
import { initSheetSDK } from '../../../wholly-sheet/src/testUtils/testUtils'
import { SheetData } from './SheetData'
import { Hacker } from './Hacker'
import { Project } from './Projects'

let sheetSDK: SheetSDK
let data: ISheet

const mockSDK = {} as Looker40SDK
const mockUser = new Hacker(mockSDK)
mockUser.user = { id: 1, first_name: 'Ordinary', last_name: 'Joe' }

const mockStaff = new Hacker(mockSDK)
mockStaff.user = { id: 2, first_name: 'Looker', last_name: 'Staff' }
mockStaff.roles.add('staff')

const mockJudge = new Hacker(mockSDK)
mockJudge.user = { id: 3, first_name: 'Looker', last_name: 'Judge' }
mockJudge.roles.add('judge')

const mockAdmin = new Hacker(mockSDK)
mockJudge.user = { id: 4, first_name: 'Looker', last_name: 'Admin' }
mockAdmin.roles.add('admin')

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
  describe('Projects', () => {
    const proj1 = new Project({
      id: 'p1',
      user_id: mockUser.id,
      title: 'test project',
    })
    const proj2 = new Project({
      id: 'p1',
      user_id: 'different id',
      title: 'test project',
    })
    test('User can manage his own project', () => {
      expect(proj1.canUpdate(mockUser)).toEqual(true)
      expect(proj1.canDelete(mockUser)).toEqual(true)
      expect(proj1.canCreate(mockUser)).toEqual(true)
    })
    test("User cannot manage someone else's project", () => {
      expect(proj2.canUpdate(mockUser)).toEqual(false)
      expect(proj2.canDelete(mockUser)).toEqual(false)
      expect(proj2.canCreate(mockUser)).toEqual(false)
    })
    test("Staff update someone's project but not delete or create", () => {
      expect(proj2.canUpdate(mockStaff)).toEqual(true)
      expect(proj2.canDelete(mockStaff)).toEqual(false)
      expect(proj2.canCreate(mockStaff)).toEqual(false)
    })
    test("Judge can update someone's project but not delete or create", () => {
      expect(proj2.canUpdate(mockJudge)).toEqual(true)
      expect(proj2.canDelete(mockJudge)).toEqual(false)
      expect(proj2.canCreate(mockJudge)).toEqual(false)
    })
    test("Admin can do anything with someone's project", () => {
      expect(proj2.canUpdate(mockAdmin)).toEqual(true)
      expect(proj2.canDelete(mockAdmin)).toEqual(true)
      expect(proj2.canCreate(mockAdmin)).toEqual(true)
    })
  })
})
