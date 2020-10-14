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

import { ISheet, noDate, SheetSDK } from '@looker/wholly-sheet'
import { initSheetSDK } from '../../../wholly-sheet/src/testUtils/testUtils'
import { mockUser } from '../test-data/data'
import { SheetData } from './SheetData'

let sheetSDK: SheetSDK
let doc: ISheet
let data: SheetData

describe('SheetData', () => {
  describe('end to end tests', () => {
    beforeAll(async () => {
      sheetSDK = await initSheetSDK()
      doc = await sheetSDK.index()
      data = new SheetData(sheetSDK, doc)
    })
    test('loads', async () => {
      const actual = data
      expect(actual.hackathons.rows.length).toBeGreaterThan(0)
      expect(actual.judgings.rows.length).toBeGreaterThan(0)
      expect(actual.projects.rows.length).toBeGreaterThan(0)
      expect(actual.projectTechnologies.rows.length).toBeGreaterThan(0)
      expect(actual.registrations.rows.length).toBeGreaterThan(0)
      expect(actual.teamMembers.rows.length).toBeGreaterThan(0)
      expect(actual.technologies.rows.length).toBeGreaterThan(0)
    })
    test('gets current hackathon', () => {
      const actual = data.currentHackathon
      expect(actual).toBeDefined()
      expect(actual?.judging_stops.getTime()).toBeGreaterThan(
        new Date().getTime()
      )
    })
    test('registers a user', async () => {
      const hackathon = data.currentHackathon
      expect(hackathon).toBeDefined()
      if (hackathon) {
        const actual = await data.registerUser(hackathon, mockUser)
        expect(actual._user_id).toEqual(mockUser.id)
        expect(actual.hackathon_id).toEqual(hackathon._id)
        expect(actual._updated).not.toEqual(noDate)
        expect(actual.date_registered).not.toEqual(noDate)
        expect(actual.attended).toEqual(true)
      }
    })
    test('locks hackathon projects', async () => {
      const hackathon = data.currentHackathon
      const projects = data.projects
      expect(hackathon).toBeDefined()
      if (hackathon) {
        const locked = await projects.lock(hackathon, true)
        expect(locked).toBeDefined()
        expect(locked.length).toBeGreaterThan(0)
        locked.forEach((p) => {
          expect(p.locked).toEqual(true)
          expect(p._hackathon_id).toEqual(hackathon._id)
        })
        const unlocked = await projects.lock(hackathon, false)
        expect(unlocked).toBeDefined()
        expect(unlocked.length).toBeGreaterThan(0)
        unlocked.forEach((p) => {
          expect(p.locked).toEqual(true)
          expect(p._hackathon_id).toEqual(hackathon._id)
        })
      }
    })
  })
})
